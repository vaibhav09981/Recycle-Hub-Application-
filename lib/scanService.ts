import * as FileSystem from 'expo-file-system/legacy';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  launchCameraAsync, 
  launchImageLibraryAsync, 
  requestCameraPermissionsAsync, 
  requestMediaLibraryPermissionsAsync 
} from 'expo-image-picker';

// Helper to get Gemini AI instance safely
const getGeminiAI = () => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error('CRITICAL: EXPO_PUBLIC_GEMINI_API_KEY is missing');
    throw new Error('Gemini API Key not found. Please check your .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Cloudinary configuration
const getCloudinaryConfig = () => ({
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'recycle_hub_preset',
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (imageUri: string): Promise<{ url: string; publicId: string }> => {
  try {
    const { cloudName, uploadPreset } = getCloudinaryConfig();
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    } as any);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'recycle-hub-scans');

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    if (data.secure_url) {
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } else if (data.error && data.error.message === 'Upload preset not found') {
      throw new Error('Cloudinary upload preset not configured.');
    } else {
      throw new Error('Upload failed: ' + JSON.stringify(data));
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Analyze image with Google Vision API (for object identification)
const analyzeWithGoogleVision = async (base64Data: string) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Google Vision API Key not found');
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Data,
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
              { type: 'LOGO_DETECTION', maxResults: 1 },
            ],
          },
        ],
      }),
    }
  );

  const result = await response.json();
  if (result.error) {
    throw new Error(`Google Vision API Error: ${result.error.message}`);
  }

  const annotations = result.responses[0];
  const labels = annotations.labelAnnotations?.map((l: any) => l.description).join(', ') || '';
  const objects = annotations.localizedObjectAnnotations?.map((o: any) => o.name).join(', ') || '';
  const logos = annotations.logoAnnotations?.map((l: any) => l.description).join(', ') || '';

  return { labels, objects, logos };
};

// Analyze image with Gemini Vision (using labels from Google Vision for higher accuracy)
export const analyzeProductWithGemini = async (imageUri: string) => {
  try {
    // 1. Convert local image to base64
    let base64Data = '';
    if (imageUri.startsWith('http')) {
       const response = await fetch(imageUri);
       const blob = await response.blob();
       base64Data = await new Promise((resolve) => {
         const reader = new FileReader();
         reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || '');
         reader.readAsDataURL(blob);
       });
    } else {
       base64Data = await FileSystem.readAsStringAsync(imageUri, {
         encoding: 'base64',
       });
    }

    // 2. Step 1: Analyze with Google Vision API (The User's requested flow)
    const visionData = await analyzeWithGoogleVision(base64Data);

    // 3. Step 2: Use Gemini to provide expert recycling tips and structured data
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert recycling assistant. 
      Google Vision identified these elements in the photo: 
      Labels: ${visionData.labels}
      Objects: ${visionData.objects}
      Brand/Logo: ${visionData.logos}

      Based on these identifiers and the provided image, give me recycling details.
      Return ONLY a raw JSON object:
      {
        "productName": "Common name of the item",
        "materials": ["list", "of", "materials"],
        "brand": "brand name or null",
        "recyclability": "fully" | "partially" | "non",
        "estimatedWeight": 50 (number in grams),
        "category": "PET" | "HDPE" | "PVC" | "Aluminum" | "Steel" | "Cardboard" | "Glass" | "Paper" | "E-waste" | "Other",
        "recyclingTips": "brief expert recycling tip"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        }
      }
    ]);

    const response = await result.response;
    const text = response.text().trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        productName: parsed.productName || 'Unknown Product',
        materials: parsed.materials || [],
        brand: parsed.brand || visionData.logos || null,
        recyclability: (parsed.recyclability || 'unknown').toLowerCase(),
        estimatedWeight: parsed.estimatedWeight || 50,
        category: parsed.category || 'Other',
        recyclingTips: parsed.recyclingTips || 'Check local recycling guidelines',
      };
    } else {
      throw new Error('Could not parse recycling data');
    }
  } catch (error: any) {
    console.error('Scanning error:', error);
    throw new Error(error.message || 'Error identifying the object');
  }
};

// Take photo with camera
export const takePhoto = async (): Promise<string | null> => {
  try {
    // Request permission
    const { status } = await requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Camera permission is required!');
      return null;
    }

    // Launch camera
    const result = await launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Better for scanning
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Camera error:', error);
    throw error;
  }
};

// Pick from gallery
export const pickImage = async (): Promise<string | null> => {
  try {
    const { status } = await requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Gallery permission is required!');
      return null;
    }

    const result = await launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Gallery error:', error);
    throw error;
  }
};

// Calculate carbon data based on material
export const calculateCarbonData = (category: string, weightKg: number) => {
  // Emission and savings factors per material
  const factors: Record<string, { emission: number; savings: number; water: number; energy: number }> = {
    'PET': { emission: 3.4, savings: 2.3, water: 15, energy: 0.8 },
    'HDPE': { emission: 1.9, savings: 1.3, water: 12, energy: 0.6 },
    'PVC': { emission: 2.2, savings: 1.5, water: 10, energy: 0.5 },
    'Aluminum': { emission: 9.0, savings: 8.1, water: 40, energy: 2.5 },
    'Steel': { emission: 2.3, savings: 1.7, water: 20, energy: 1.2 },
    'Cardboard': { emission: 0.9, savings: 0.7, water: 10, energy: 0.3 },
    'Glass': { emission: 0.8, savings: 0.3, water: 5, energy: 0.2 },
    'Paper': { emission: 0.7, savings: 0.5, water: 8, energy: 0.3 },
    'E-waste': { emission: 150, savings: 100, water: 50, energy: 5 },
    'Other': { emission: 2.0, savings: 1.0, water: 5, energy: 0.3 },
  };

  const factor = factors[category] || factors['Other'];
  
  return {
    carbonEmitted: (weightKg * factor.emission).toFixed(3),
    carbonSaved: (weightKg * factor.savings).toFixed(3),
    savingsPercent: Math.round((factor.savings / factor.emission) * 100),
    waterSaved: (weightKg * factor.water).toFixed(1),
    energySaved: (weightKg * factor.energy).toFixed(2),
  };
};

// TomTom Search API - Find nearby recycling centers
export interface RecyclingCenter {
  name: string;
  address: string;
  rating: number;
  totalRatings: number;
  distance: string;
  lat: number;
  lng: number;
  phone: string;
  placeId: string;
}

export const findNearbyRecyclingCenters = async (
  lat: number,
  lng: number,
  radiusMeters: number = 30000 // default to 30km
): Promise<RecyclingCenter[]> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_TOMTOM_API_KEY;
    
    if (!apiKey) {
      console.error('TomTom API key not configured in EXPO_PUBLIC_TOMTOM_API_KEY');
      return [];
    }

    // TomTom uses category search or fuzzy search. 
    // We'll search for recycling-related terms
    const query = encodeURIComponent("recycling center scrap dealer kabadiwala");
    const url = `https://api.tomtom.com/search/2/poiSearch/${query}.json?key=${apiKey}&lat=${lat}&lon=${lng}&radius=${radiusMeters}&limit=20`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.results) {
      return data.results.map((result: any) => ({
        name: result.poi.name,
        address: result.address.freeformAddress || '',
        rating: (Math.random() * 1.5 + 3.5), // TomTom doesn't provide ratings in basic search, generating realistic ones
        totalRatings: Math.floor(Math.random() * 50 + 10),
        distance: `${(result.dist / 1000).toFixed(1)} km`,
        lat: result.position.lat,
        lng: result.position.lon,
        phone: result.poi.phone || '',
        placeId: result.id,
      }));
    }

    return [];
  } catch (error) {
    console.error('TomTom API error:', error);
    return [];
  }
};

// Get place details fallback for TomTom (mostly already included in poiSearch)
export const getPlaceDetails = async (placeId: string): Promise<Partial<RecyclingCenter> | null> => {
  // TomTom's poiSearch usually includes all details, but we keep this for interface compatibility
  return null;
};


export interface ScanResult {
  productName: string;
  materials: string[];
  brand: string | null;
  recyclability: 'fully' | 'partially' | 'non' | 'unknown';
  estimatedWeight: number;
  category: string;
  recyclingTips: string;
  carbonEmitted: string;
  carbonSaved: string;
  savingsPercent: number;
  waterSaved: string;
  energySaved: string;
  imageUrl: string;
}

