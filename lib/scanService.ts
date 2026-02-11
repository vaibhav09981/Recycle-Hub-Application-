import { GoogleGenerativeAI } from "@google/generative-ai";
import * as ImagePicker from 'expo-image-picker';

// Initialize Gemini with API key from environment
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

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
      throw new Error('Cloudinary upload preset not configured. Please create an unsigned upload preset named "recycle_hub_preset" in your Cloudinary dashboard.');
    } else {
      throw new Error('Upload failed: ' + JSON.stringify(data));
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Analyze image with Gemini Vision
export const analyzeProductWithGemini = async (imageUrl: string) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash" 
    });

    const prompt = `
      Analyze this product image and provide recycling information.
      Respond ONLY in valid JSON format:
      {
        "productName": "string",
        "materials": ["material1", "material2"],
        "brand": "brand name or null",
        "recyclability": "fully" or "partially" or "non",
        "estimatedWeight": number (in grams),
        "category": "PET or HDPE or PVC or Aluminum or Steel or Cardboard or Glass or Paper or E-waste or Other",
        "recyclingTips": "brief recycling tips"
      }
    `;

    // Convert image URL to base64
    const base64Data = await fetchImageAsBase64(imageUrl);

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
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        productName: parsed.productName || 'Unknown Product',
        materials: parsed.materials || [],
        brand: parsed.brand || null,
        recyclability: parsed.recyclability || 'unknown',
        estimatedWeight: parsed.estimatedWeight || 50,
        category: parsed.category || 'Other',
        recyclingTips: parsed.recyclingTips || 'Check local recycling guidelines',
      };
    } else {
      throw new Error('Invalid response format from Gemini');
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
};

// Helper: Convert image URL to base64
const fetchImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw error;
  }
};

// Take photo with camera
export const takePhoto = async (): Promise<string | null> => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Camera permission is required!');
      return null;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Gallery permission is required!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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

// Google Places API - Find nearby recycling centers
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
  radiusMeters: number = 100000
): Promise<RecyclingCenter[]> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Places API key not configured');
      return [];
    }

    // Search for recycling centers, scrap dealers, e-waste centers
    const searchTypes = [
      'recycling+center',
      'scrap+dealer',
      'waste+management',
      'e-waste+recycling'
    ];

    const allCenters: RecyclingCenter[] = [];

    for (const type of searchTypes) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${type}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        for (const place of data.results) {
          allCenters.push({
            name: place.name,
            address: place.vicinity || '',
            rating: place.rating || 0,
            totalRatings: place.user_ratings_total || 0,
            distance: '',
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            phone: '',
            placeId: place.place_id,
          });
        }
      }
    }

    // Remove duplicates based on placeId
    const uniqueCenters = allCenters.filter((center, index, self) =>
      index === self.findIndex((c) => c.placeId === center.placeId)
    );

    // Sort by rating
    return uniqueCenters.sort((a, b) => b.rating - a.rating).slice(0, 10);
  } catch (error) {
    console.error('Google Places API error:', error);
    return [];
  }
};

// Get place details (phone, address)
export const getPlaceDetails = async (placeId: string): Promise<Partial<RecyclingCenter> | null> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) return null;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,formatted_address,rating,user_ratings_total,geometry&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.result) {
      return {
        name: data.result.name,
        address: data.result.formatted_address || '',
        phone: data.result.formatted_phone_number || '',
        rating: data.result.rating || 0,
        totalRatings: data.result.user_ratings_total || 0,
        lat: data.result.geometry?.location?.lat || 0,
        lng: data.result.geometry?.location?.lng || 0,
      };
    }

    return null;
  } catch (error) {
    console.error('Get place details error:', error);
    return null;
  }
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
