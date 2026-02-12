import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useJournal } from '@/context/JournalContext';
import {
  uploadToCloudinary,
  analyzeProductWithGemini,
  calculateCarbonData,
  findNearbyRecyclingCenters,
  getPlaceDetails,
  pickImage,
  takePhoto,
  ScanResult,
  RecyclingCenter,
} from '@/lib/scanService';

// Animated Scanning View Component
function ScanningAnimation() {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanLineAnim]);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <View className="items-center justify-center py-6 bg-black/50">
      <View className="w-50 h-50 relative overflow-hidden rounded-lg border-2 border-primary">
        <Animated.View
          className="w-full h-0.5 bg-primary absolute"
          style={{ transform: [{ translateY }] }}
        />
        <View className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-primary" />
        <View className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-primary" />
        <View className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-primary" />
        <View className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-primary" />
      </View>
      <Text className="text-white text-lg font-semibold mt-4">AI Analyzing...</Text>
      <Text className="text-white text-xs mt-1 opacity-80">Identifying product & recyclability</Text>
    </View>
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const { addScannedItem } = useJournal();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Request location permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Required', 'Please enable location access to find nearby recycling centers.');
      return false;
    }
    return true;
  };

  // Get user location
  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLoadingLocation(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      return { lat: latitude, lng: longitude };
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please check your GPS settings.');
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handlePickImage = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setSelectedImage(imageUri);
      analyzeImage(imageUri);
    }
  };

  const handleTakePhoto = async () => {
    const imageUri = await takePhoto();
    if (imageUri) {
      setSelectedImage(imageUri);
      analyzeImage(imageUri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    setScanResult(null);
    setIsSaved(false);

    try {
      // Step 1: Upload to Cloudinary
      const { url: imageUrl } = await uploadToCloudinary(imageUri);

      // Step 2: Analyze with Gemini
      const aiResult = await analyzeProductWithGemini(imageUrl);

      // Step 3: Calculate carbon data
      const weightKg = aiResult.estimatedWeight / 1000;
      const carbonData = calculateCarbonData(aiResult.category, weightKg);

      // Step 4: Create scan result
      const result: ScanResult = {
        ...aiResult,
        carbonEmitted: carbonData.carbonEmitted,
        carbonSaved: carbonData.carbonSaved,
        savingsPercent: carbonData.savingsPercent,
        waterSaved: carbonData.waterSaved,
        energySaved: carbonData.energySaved,
        imageUrl,
      };

      setScanResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFindRecyclingCenters = async () => {
    setIsLoadingLocation(true);
    setShowCentersModal(true);

    try {
      let location = userLocation;
      if (!location) {
        location = await getUserLocation();
      }

      if (!location) {
        Alert.alert('Location Required', 'Please enable location access to find nearby recycling centers.');
        return;
      }

      // Find nearby centers
      const centers = await findNearbyRecyclingCenters(location.lat, location.lng, 15000);
      setRecyclingCenters(centers);

      if (centers.length === 0) {
        Alert.alert('No Centers Found', 'No recycling centres were found in your area.');
      }
    } catch (error) {
      console.error('Find centers error:', error);
      Alert.alert('Error', 'Could not find recycling centers. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCenterPress = async (center: RecyclingCenter) => {
    // Get place details
    const details = await getPlaceDetails(center.placeId);
    
    if (details) {
      // Open in maps
      const label = encodeURIComponent(center.name);
      const url = `https://www.google.com/maps/search/?api=1&query=${label}&query_place_id=${center.placeId}`;
      
      Linking.openURL(url).catch(() => {
        // Fallback to Apple Maps/Google Maps
        const mapUrl = `maps:0,0?q=${label}&z=15`;
        Linking.openURL(mapUrl);
      });
    }
  };

  const handleSchedulePickup = () => {
    // Search for scrap collectors
    Alert.alert(
      'Schedule Pickup',
      'Looking for scrap collectors in your area...',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Search', onPress: () => handleFindRecyclingCenters() },
      ]
    );
  };

  const handleRecycle = () => {
    if (scanResult) {
      // Save to journal
      addScannedItem({
        productName: scanResult.productName,
        materials: scanResult.materials,
        brand: scanResult.brand,
        recyclability: scanResult.recyclability,
        estimatedWeight: scanResult.estimatedWeight,
        category: scanResult.category,
        recyclingTips: scanResult.recyclingTips,
        carbonEmitted: scanResult.carbonEmitted,
        carbonSaved: scanResult.carbonSaved,
        savingsPercent: scanResult.savingsPercent,
        waterSaved: scanResult.waterSaved,
        energySaved: scanResult.energySaved,
        imageUrl: scanResult.imageUrl,
      });
    }
    setIsSaved(true);
    Alert.alert('✓ Saved!', 'Item added to your recycling journal.');
  };

  const getRecyclableColor = (status: string) => {
    switch (status) {
      case 'fully': return '#22C55E';
      case 'partially': return '#F59E0B';
      case 'non': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getRecyclableText = (status: string) => {
    switch (status) {
      case 'fully': return 'Fully Recyclable';
      case 'partially': return 'Partially Recyclable';
      case 'non': return 'Non-Recyclable';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully': return '♻️';
      case 'partially': return '⚠️';
      case 'non': return '❌';
      default: return '❓';
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setScanResult(null);
    setIsSaved(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-card border-b border-border">
        <TouchableOpacity 
          className="flex-row items-center py-2"
          onPress={() => router.back()} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-xl text-primary font-semibold mr-1">←</Text>
          <Text className="text-base font-semibold text-primary">BACK</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-textPrimary text-center">AI Scanner</Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {/* Initial Upload State */}
        {!selectedImage && (
          <View className="items-center px-6 py-10">
            <View className="w-30 h-30 rounded-full bg-primaryLight items-center justify-center mb-6">
              <Text className="text-5xl">📷</Text>
            </View>
            <Text className="text-2xl font-bold text-textPrimary mb-3">Scan an Item</Text>
            <Text className="text-sm text-textSecondary text-center mb-8 leading-5">
              Take a photo or upload an image to identify recyclability and environmental impact using AI
            </Text>
            
            <TouchableOpacity
              className="w-full bg-primary px-8 py-4 rounded-xl items-center mb-3"
              onPress={handlePickImage}
              activeOpacity={0.9}
            >
              <Text className="text-base font-semibold text-white">Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-full bg-card border-2 border-primary px-8 py-4 rounded-xl items-center mb-4"
              onPress={handleTakePhoto}
              activeOpacity={0.9}
            >
              <Text className="text-base font-semibold text-primary">📸 Take Photo</Text>
            </TouchableOpacity>
            
            <Text className="text-xs text-textTertiary mt-4">AI will identify the product automatically</Text>
          </View>
        )}

        {/* Analyzing State */}
        {selectedImage && !scanResult && (
          <View className="py-6">
            <View className="rounded-xl overflow-hidden bg-card">
              <Image source={{ uri: selectedImage }} className="w-full h-72 rounded-xl" />
              
              {isAnalyzing ? (
                <ScanningAnimation />
              ) : (
                <View className="flex-row justify-around p-4">
                  <TouchableOpacity
                    className="bg-primary px-6 py-3 rounded-lg"
                    onPress={() => analyzeImage(selectedImage)}
                    activeOpacity={0.9}
                  >
                    <Text className="text-sm font-semibold text-white">🔄 Analyze Again</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="bg-card px-6 py-3 rounded-lg border border-border"
                    onPress={resetScan}
                    activeOpacity={0.9}
                  >
                    <Text className="text-sm font-semibold text-textSecondary">Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Scan Result */}
        {scanResult && (
          <View className="py-6">
            {/* Item Status Card */}
            <View className="bg-card rounded-2xl p-5 mb-4">
              <View className="flex-row items-start mb-4">
                <View className="w-15 h-15 rounded-full bg-primaryLight items-center justify-content-center mr-4">
                  <Text className="text-3xl">{getStatusIcon(scanResult.recyclability)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-textPrimary mb-1">{scanResult.productName}</Text>
                  {scanResult.brand && (
                    <Text className="text-sm text-textSecondary mb-2">{scanResult.brand}</Text>
                  )}
                  <View className="px-3 py-1 rounded-lg self-start" style={{ backgroundColor: getRecyclableColor(scanResult.recyclability) }}>
                    <Text className="text-xs font-semibold text-white">{getRecyclableText(scanResult.recyclability)}</Text>
                  </View>
                </View>
              </View>

              {/* Product Image */}
              <Image source={{ uri: scanResult.imageUrl }} className="w-full h-48 rounded-xl mb-4" />

              {/* Material Info */}
              <View className="bg-background rounded-xl p-4 mb-4">
                <Text className="text-sm font-semibold text-textSecondary mb-2">Material Composition</Text>
                <View className="flex-row flex-wrap mb-2">
                  {scanResult.materials.map((material, index) => (
                    <View key={index} className="bg-primaryLight px-3 py-1.5 rounded-full mr-2 mb-2">
                      <Text className="text-xs font-medium text-primaryDark">{material}</Text>
                    </View>
                  ))}
                </View>
                <Text className="text-xs text-textTertiary">Category: {scanResult.category}</Text>
              </View>

              {/* Impact Stats */}
              <View className="mb-4">
                <Text className="text-base font-semibold text-textPrimary mb-3">🌱 Your Environmental Impact</Text>
                <View className="flex-row flex-wrap justify-between">
                  {/* CO2 Saved */}
                  <View className="w-[48%] bg-background rounded-xl p-4 items-center mb-3 border-l-4 border-emerald-600">
                    <Text className="text-2xl mb-2">🌍</Text>
                    <Text className="text-xl font-bold text-textPrimary">{scanResult.savingsPercent}%</Text>
                    <Text className="text-xs text-textSecondary mt-1">CO₂ Savings</Text>
                    <Text className="text-xs text-textTertiary mt-0.5">{scanResult.carbonSaved} kg</Text>
                  </View>
                  
                  {/* Water Saved */}
                  <View className="w-[48%] bg-background rounded-xl p-4 items-center mb-3 border-l-4 border-blue-500">
                    <Text className="text-2xl mb-2">💧</Text>
                    <Text className="text-xl font-bold text-textPrimary">{scanResult.waterSaved}L</Text>
                    <Text className="text-xs text-textSecondary mt-1">Water Saved</Text>
                  </View>
                  
                  {/* Energy Saved */}
                  <View className="w-[48%] bg-background rounded-xl p-4 items-center mb-3 border-l-4 border-amber-500">
                    <Text className="text-2xl mb-2">⚡</Text>
                    <Text className="text-xl font-bold text-textPrimary">{scanResult.energySaved}kWh</Text>
                    <Text className="text-xs text-textSecondary mt-1">Energy Saved</Text>
                  </View>

                  {/* Green Points */}
                  <View className="w-[48%] bg-background rounded-xl p-4 items-center mb-3 border-l-4 border-pink-500">
                    <Text className="text-2xl mb-2">⭐</Text>
                    <Text className="text-xl font-bold text-pink-500">+{Math.round(scanResult.savingsPercent * 2)}</Text>
                    <Text className="text-xs text-textSecondary mt-1">Green Points</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recycling Tips */}
            <View className="bg-card rounded-xl p-4 mb-4">
              <Text className="text-base font-semibold text-textPrimary mb-2">💡 Recycling Tips</Text>
              <Text className="text-sm text-textSecondary leading-5">{scanResult.recyclingTips}</Text>
            </View>

            {/* Action Options */}
            <View className="bg-card rounded-xl p-4 mb-4">
              <Text className="text-base font-semibold text-textPrimary mb-4">♻️ What Would You Like to Do?</Text>
              
              <TouchableOpacity
                className="flex-row items-center py-3 border-b border-border"
                onPress={handleFindRecyclingCenters}
                activeOpacity={0.9}
              >
                <View className="w-11 h-11 rounded-full bg-primaryLight items-center justify-center mr-3">
                  <Text className="text-xl">📍</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-textPrimary">Find Recycling Center</Text>
                  <Text className="text-xs text-textSecondary mt-0.5">Locate nearest drop-off point</Text>
                </View>
                <Text className="text-lg text-primary font-semibold">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center py-3 border-b border-border"
                onPress={handleSchedulePickup}
                activeOpacity={0.9}
              >
                <View className="w-11 h-11 rounded-full bg-primaryLight items-center justify-center mr-3">
                  <Text className="text-xl">🚚</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-textPrimary">Schedule Pickup</Text>
                  <Text className="text-xs text-textSecondary mt-0.5">Scrap Uncle - Home pickup</Text>
                </View>
                <Text className="text-lg text-primary font-semibold">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center py-3 border-b border-border"
                onPress={() => {
                  Alert.alert(
                    'Drop-off Points',
                    'Search for nearby collection bins...',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Search', onPress: handleFindRecyclingCenters },
                    ]
                  );
                }}
                activeOpacity={0.9}
              >
                <View className="w-11 h-11 rounded-full bg-primaryLight items-center justify-center mr-3">
                  <Text className="text-xl">🏠</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-textPrimary">Drop-off Near Me</Text>
                  <Text className="text-xs text-textSecondary mt-0.5">Find nearby collection points</Text>
                </View>
                <Text className="text-lg text-primary font-semibold">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center py-3"
                onPress={() => router.push('/(tabs)/shop')}
                activeOpacity={0.9}
              >
                <View className="w-11 h-11 rounded-full bg-amber-100 items-center justify-center mr-3">
                  <Text className="text-xl">🛒</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-textPrimary">Eco Alternatives</Text>
                  <Text className="text-xs text-textSecondary mt-0.5">Shop sustainable products</Text>
                </View>
                <Text className="text-lg text-amber-500 font-semibold">→</Text>
              </TouchableOpacity>
            </View>

            {/* Recycle Button */}
            <TouchableOpacity
              className={`py-4 rounded-xl items-center mb-3 ${isSaved ? 'bg-success' : 'bg-primary'}`}
              onPress={handleRecycle}
              disabled={isSaved}
              activeOpacity={0.9}
            >
              <Text className="text-base font-bold text-white">
                {isSaved ? '✓ Saved to Journal!' : '♻️ Recycle This Item'}
              </Text>
            </TouchableOpacity>

            {/* Scan Another */}
            <TouchableOpacity
              className="py-4 items-center"
              onPress={resetScan}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-primary">Scan Another Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-10" />
      </ScrollView>

      {/* Recycling Centers Modal */}
      <Modal
        visible={showCentersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCentersModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl max-h-[80%]">
            <View className="flex-row items-center justify-between p-5 border-b border-border">
              <Text className="text-lg font-bold text-textPrimary">♻️ Nearby Recycling Centers</Text>
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-background items-center justify-center"
                onPress={() => setShowCentersModal(false)}
              >
                <Text className="text-lg text-textSecondary">✕</Text>
              </TouchableOpacity>
            </View>

            {isLoadingLocation ? (
              <View className="p-10 items-center">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="text-sm text-textSecondary mt-4">Finding nearby centers...</Text>
              </View>
            ) : recyclingCenters.length > 0 ? (
              <ScrollView contentContainerStyle={{ padding: 16 }}>
                {recyclingCenters.map((center, index) => (
                  <TouchableOpacity
                    key={center.placeId || index}
                    className="flex-row items-center bg-background rounded-xl p-4 mb-3"
                    onPress={() => handleCenterPress(center)}
                    activeOpacity={0.9}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-textPrimary mb-1">{center.name}</Text>
                      <Text className="text-xs text-textSecondary mb-1">{center.address}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-amber-500">⭐ {center.rating.toFixed(1)}</Text>
                        <Text className="text-xs text-textTertiary ml-1">({center.totalRatings})</Text>
                      </View>
                    </View>
                    <View className="ml-3">
                      <Text className="text-xs text-primary font-semibold">Directions →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="p-10 items-center">
                <Text className="text-5xl mb-4">🔍</Text>
                <Text className="text-base font-semibold text-textPrimary mb-2">No centers found nearby</Text>
                <Text className="text-sm text-textSecondary">Try expanding your search radius</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
