import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Mock material data (will be replaced with database)
const materialsData: Record<string, {
  recyclable: 'fully' | 'partially' | 'no';
  carbonSaved: number;
  waterSaved: number;
  energySaved: number;
}> = {
  'plastic': { recyclable: 'fully', carbonSaved: 42, waterSaved: 18, energySaved: 0.6 },
  'plastic bottle': { recyclable: 'fully', carbonSaved: 42, waterSaved: 18, energySaved: 0.6 },
  'pet': { recyclable: 'fully', carbonSaved: 45, waterSaved: 20, energySaved: 0.7 },
  'cardboard': { recyclable: 'fully', carbonSaved: 65, waterSaved: 15, energySaved: 1.2 },
  'paper': { recyclable: 'fully', carbonSaved: 55, waterSaved: 12, energySaved: 0.9 },
  'glass': { recyclable: 'fully', carbonSaved: 70, waterSaved: 25, energySaved: 1.5 },
  'metal': { recyclable: 'fully', carbonSaved: 75, waterSaved: 10, energySaved: 2.0 },
  'aluminum': { recyclable: 'fully', carbonSaved: 85, waterSaved: 8, energySaved: 2.5 },
  'steel': { recyclable: 'fully', carbonSaved: 72, waterSaved: 10, energySaved: 1.8 },
  'ewaste': { recyclable: 'partially', carbonSaved: 30, waterSaved: 5, energySaved: 0.5 },
  'electronic': { recyclable: 'partially', carbonSaved: 25, waterSaved: 5, energySaved: 0.4 },
  'battery': { recyclable: 'partially', carbonSaved: 35, waterSaved: 8, energySaved: 0.6 },
  'plastic bag': { recyclable: 'no', carbonSaved: 0, waterSaved: 0, energySaved: 0 },
  'styrofoam': { recyclable: 'no', carbonSaved: 0, waterSaved: 0, energySaved: 0 },
};

interface ScanResult {
  itemName: string;
  material: string;
  recyclable: 'fully' | 'partially' | 'no';
  carbonSaved: number;
  waterSaved: number;
  energySaved: number;
  tips: string[];
}

export default function ScanScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis (will be replaced with Gemini Vision API)
    setTimeout(() => {
      // Mock AI response
      const mockResults: ScanResult[] = [
        {
          itemName: 'Plastic Water Bottle',
          material: 'Plastic (PET)',
          recyclable: 'fully',
          carbonSaved: 42,
          waterSaved: 18,
          energySaved: 0.6,
          tips: [
            'Rinse before recycling',
            'Remove the cap (recycle separately)',
            'Crush to save space',
          ],
        },
        {
          itemName: 'Cardboard Box',
          material: 'Cardboard',
          recyclable: 'fully',
          carbonSaved: 65,
          waterSaved: 15,
          energySaved: 1.2,
          tips: [
            'Flatten the box',
            'Remove any plastic tape',
            'Keep dry',
          ],
        },
        {
          itemName: 'Electronic Waste',
          material: 'E-waste',
          recyclable: 'partially',
          carbonSaved: 30,
          waterSaved: 5,
          energySaved: 0.5,
          tips: [
            'Do not disassemble yourself',
            'Take to authorized e-waste center',
            'Remove batteries first',
          ],
        },
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setScanResult(randomResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleRecycle = () => {
    setIsSaved(true);
    // TODO: Save to database, update user impact
  };

  const getRecyclableColor = (status: string) => {
    switch (status) {
      case 'fully': return '#10B981';
      case 'partially': return '#F59E0B';
      case 'no': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRecyclableText = (status: string) => {
    switch (status) {
      case 'fully': return 'Fully Recyclable';
      case 'partially': return 'Partially Recyclable';
      case 'no': return 'Non-Recyclable';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', textAlign: 'center' }}>
          Scan Item
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {!selectedImage && (
          /* Upload Section */
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 16 }}>📷</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 8 }}>
              Scan an Item
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center', marginBottom: 24 }}>
              Take a photo or upload an image to identify recyclability and environmental impact
            </Text>
            
            <TouchableOpacity
              style={{ backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 48, marginBottom: 16 }}
              onPress={handlePickImage}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, fontFamily: 'Poppins' }}>
                Choose Image
              </Text>
            </TouchableOpacity>
            
            <Text style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'Poppins' }}>
              or take a photo with camera
            </Text>
          </View>
        )}

        {selectedImage && !scanResult && (
          /* Analyzing State */
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200, borderRadius: 16, marginBottom: 24 }} />
            
            {isAnalyzing ? (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: '#10B981', borderTopColor: 'transparent', marginBottom: 16 }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginBottom: 8 }}>
                  Analyzing...
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins' }}>
                  Identifying material composition
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={{ backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 }}
                onPress={() => analyzeImage(selectedImage)}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Poppins' }}>
                  Analyze Again
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {scanResult && (
          /* Scan Result */
          <View style={{ padding: 16 }}>
            {/* Recyclability Status */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <Text style={{ fontSize: 28 }}>{scanResult.recyclable === 'fully' ? '♻️' : scanResult.recyclable === 'partially' ? '⚠️' : '❌'}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
                    {scanResult.itemName}
                  </Text>
                  <View style={{ backgroundColor: getRecyclableColor(scanResult.recyclable), paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 4 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 12, fontFamily: 'Poppins' }}>
                      {getRecyclableText(scanResult.recyclable)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Material Info */}
              <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', fontFamily: 'Poppins', marginBottom: 8 }}>
                  Material Composition
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins' }}>
                  {scanResult.material}
                </Text>
              </View>

              {/* Impact Stats */}
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 12 }}>
                🌱 Your Environmental Impact
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>🌍</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>
                    {scanResult.carbonSaved}%
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
                    CO₂ Emissions Saved
                  </Text>
                </View>
                
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>💧</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6', fontFamily: 'Poppins' }}>
                    {scanResult.waterSaved}L
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
                    Water Saved
                  </Text>
                </View>
                
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>⚡</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B', fontFamily: 'Poppins' }}>
                    {scanResult.energySaved}kWh
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
                    Energy Saved
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FCE7F3', borderRadius: 12, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>⭐</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#EC4899', fontFamily: 'Poppins' }}>
                    +50
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
                    Green Points
                  </Text>
                </View>
              </View>
            </View>

            {/* Recycling Tips */}
            {scanResult.tips.length > 0 && (
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 12 }}>
                  💡 Recycling Tips
                </Text>
                {scanResult.tips.map((tip, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>•</Text>
                    <Text style={{ fontSize: 14, color: '#374151', fontFamily: 'Poppins', flex: 1 }}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Options */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 16 }}>
                ♻️ What Would You Like to Do?
              </Text>
              
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 12 }}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
                    Find Recycling Center
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    Locate nearest drop-off point
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: '#10B981' }}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 12 }}
                onPress={() => {}}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>🚚</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
                    Schedule Pickup
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    Scrap Uncle - Home pickup
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: '#10B981' }}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 12 }}
                onPress={() => {}}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>🏠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
                    Drop-off Near Me
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    Find nearby collection points
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: '#10B981' }}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 12, padding: 16 }}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>🛒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
                    Eco Alternatives
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    Shop sustainable products
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: '#F59E0B' }}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Recycle Button */}
            <TouchableOpacity
              style={{ backgroundColor: isSaved ? '#10B981' : '#10B981', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16 }}
              onPress={handleRecycle}
              disabled={isSaved}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, fontFamily: 'Poppins' }}>
                {isSaved ? '✓ Saved to Journal!' : '♻️ Recycle This Item'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
