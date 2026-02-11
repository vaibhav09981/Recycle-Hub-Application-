import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  StyleSheet,
  Easing,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
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

// Colors from UI/UX Guide
const COLORS = {
  primary: '#10B981',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#22C55E',
  info: '#3B82F6',
  carbon: '#059669',
  water: '#0EA5E9',
  energy: '#FBBF24',
  points: '#EC4899',
};

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
    <View style={styles.scanningContainer}>
      <View style={styles.scanFrame}>
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY }] },
          ]}
        />
        <View style={[styles.scanCorner, styles.scanCornerTL]} />
        <View style={[styles.scanCorner, styles.scanCornerTR]} />
        <View style={[styles.scanCorner, styles.scanCornerBL]} />
        <View style={[styles.scanCorner, styles.scanCornerBR]} />
      </View>
      <Text style={styles.scanningText}>AI Analyzing...</Text>
      <Text style={styles.scanningSubtext}>Identifying product & recyclability</Text>
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
      const addr = encodeURIComponent(center.address);
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
      case 'fully': return COLORS.success;
      case 'partially': return COLORS.warning;
      case 'non': return COLORS.error;
      default: return COLORS.textTertiary;
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Scanner</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Initial Upload State */}
        {!selectedImage && (
          <View style={styles.uploadSection}>
            <View style={styles.uploadIconContainer}>
              <Text style={styles.uploadIcon}>📷</Text>
            </View>
            <Text style={styles.uploadTitle}>Scan an Item</Text>
            <Text style={styles.uploadSubtitle}>
              Take a photo or upload an image to identify recyclability and environmental impact using AI
            </Text>
            
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              activeOpacity={0.9}
            >
              <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.uploadButton, styles.cameraButton]}
              onPress={handleTakePhoto}
              activeOpacity={0.9}
            >
              <Text style={[styles.uploadButtonText, styles.cameraButtonText]}>📸 Take Photo</Text>
            </TouchableOpacity>
            
            <Text style={styles.uploadDivider}>AI will identify the product automatically</Text>
          </View>
        )}

        {/* Analyzing State */}
        {selectedImage && !scanResult && (
          <View style={styles.analyzingSection}>
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              
              {isAnalyzing ? (
                <ScanningAnimation />
              ) : (
                <View style={styles.analyzingActions}>
                  <TouchableOpacity
                    style={styles.analyzeButton}
                    onPress={() => analyzeImage(selectedImage)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.analyzeButtonText}>🔄 Analyze Again</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetScan}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Scan Result */}
        {scanResult && (
          <View style={styles.resultSection}>
            {/* Item Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIconContainer}>
                  <Text style={styles.statusIcon}>{getStatusIcon(scanResult.recyclability)}</Text>
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>{scanResult.productName}</Text>
                  {scanResult.brand && (
                    <Text style={styles.brandText}>{scanResult.brand}</Text>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: getRecyclableColor(scanResult.recyclability) }]}>
                    <Text style={styles.statusBadgeText}>{getRecyclableText(scanResult.recyclability)}</Text>
                  </View>
                </View>
              </View>

              {/* Product Image */}
              <Image source={{ uri: scanResult.imageUrl }} style={styles.productImage} />

              {/* Material Info */}
              <View style={styles.materialCard}>
                <Text style={styles.materialLabel}>Material Composition</Text>
                <View style={styles.materialTags}>
                  {scanResult.materials.map((material, index) => (
                    <View key={index} style={styles.materialTag}>
                      <Text style={styles.materialTagText}>{material}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.categoryText}>Category: {scanResult.category}</Text>
              </View>

              {/* Impact Stats */}
              <View style={styles.impactSection}>
                <Text style={styles.impactTitle}>🌱 Your Environmental Impact</Text>
                <View style={styles.impactGrid}>
                  {/* CO2 Saved */}
                  <View style={[styles.impactCard, styles.impactCardCarbon]}>
                    <Text style={styles.impactIcon}>🌍</Text>
                    <Text style={styles.impactValue}>{scanResult.savingsPercent}%</Text>
                    <Text style={styles.impactLabel}>CO₂ Savings</Text>
                    <Text style={styles.impactSubtext}>{scanResult.carbonSaved} kg</Text>
                  </View>
                  
                  {/* Water Saved */}
                  <View style={[styles.impactCard, styles.impactCardWater]}>
                    <Text style={styles.impactIcon}>💧</Text>
                    <Text style={styles.impactValue}>{scanResult.waterSaved}L</Text>
                    <Text style={styles.impactLabel}>Water Saved</Text>
                  </View>
                  
                  {/* Energy Saved */}
                  <View style={[styles.impactCard, styles.impactCardEnergy]}>
                    <Text style={styles.impactIcon}>⚡</Text>
                    <Text style={styles.impactValue}>{scanResult.energySaved}kWh</Text>
                    <Text style={styles.impactLabel}>Energy Saved</Text>
                  </View>

                  {/* Green Points */}
                  <View style={[styles.impactCard, styles.impactCardPoints]}>
                    <Text style={styles.impactIcon}>⭐</Text>
                    <Text style={styles.impactValuePoints}>+{Math.round(scanResult.savingsPercent * 2)}</Text>
                    <Text style={styles.impactLabel}>Green Points</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recycling Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Recycling Tips</Text>
              <Text style={styles.tipMainText}>{scanResult.recyclingTips}</Text>
            </View>

            {/* Action Options */}
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>♻️ What Would You Like to Do?</Text>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFindRecyclingCenters}
                activeOpacity={0.9}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.actionIcon}>📍</Text>
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Find Recycling Center</Text>
                  <Text style={styles.actionSubtitle}>Locate nearest drop-off point</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSchedulePickup}
                activeOpacity={0.9}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.actionIcon}>🚚</Text>
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Schedule Pickup</Text>
                  <Text style={styles.actionSubtitle}>Scrap Uncle - Home pickup</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
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
                <View style={[styles.actionIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.actionIcon}>🏠</Text>
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Drop-off Near Me</Text>
                  <Text style={styles.actionSubtitle}>Find nearby collection points</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButtonEco}
                onPress={() => router.push('/(tabs)/shop')}
                activeOpacity={0.9}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.actionIcon}>🛒</Text>
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Eco Alternatives</Text>
                  <Text style={styles.actionSubtitle}>Shop sustainable products</Text>
                </View>
                <Text style={[styles.actionArrow, { color: COLORS.warning }]}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Recycle Button */}
            <TouchableOpacity
              style={[styles.recycleButton, isSaved && styles.recycleButtonSaved]}
              onPress={handleRecycle}
              disabled={isSaved}
              activeOpacity={0.9}
            >
              <Text style={styles.recycleButtonText}>
                {isSaved ? '✓ Saved to Journal!' : '♻️ Recycle This Item'}
              </Text>
            </TouchableOpacity>

            {/* Scan Another */}
            <TouchableOpacity
              style={styles.scanAnotherButton}
              onPress={resetScan}
              activeOpacity={0.7}
            >
              <Text style={styles.scanAnotherText}>Scan Another Item</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Recycling Centers Modal */}
      <Modal
        visible={showCentersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCentersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>♻️ Nearby Recycling Centers</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCentersModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoadingLocation ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding nearby centers...</Text>
              </View>
            ) : recyclingCenters.length > 0 ? (
              <ScrollView style={styles.centersList}>
                {recyclingCenters.map((center, index) => (
                  <TouchableOpacity
                    key={center.placeId || index}
                    style={styles.centerCard}
                    onPress={() => handleCenterPress(center)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.centerInfo}>
                      <Text style={styles.centerName}>{center.name}</Text>
                      <Text style={styles.centerAddress}>{center.address}</Text>
                      <View style={styles.centerRating}>
                        <Text style={styles.ratingText}>⭐ {center.rating.toFixed(1)}</Text>
                        <Text style={styles.ratingsCount}>({center.totalRatings})</Text>
                      </View>
                    </View>
                    <View style={styles.centerAction}>
                      <Text style={styles.directionsText}>Directions →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noCentersContainer}>
                <Text style={styles.noCentersIcon}>🔍</Text>
                <Text style={styles.noCentersText}>No centers found nearby</Text>
                <Text style={styles.noCentersSubtext}>Try expanding your search radius</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  uploadSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadIcon: {
    fontSize: 48,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraButton: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cameraButtonText: {
    color: COLORS.primary,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadDivider: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 16,
  },
  analyzingSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  imagePreviewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  analyzingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  scanningContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
  },
  scanCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.primary,
  },
  scanCornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  scanCornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  scanCornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  scanCornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  scanningSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  resultSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusIcon: {
    fontSize: 28,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  materialCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  materialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  materialTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  materialTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  materialTagText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  impactSection: {
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  impactCardCarbon: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.carbon,
  },
  impactCardWater: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.water,
  },
  impactCardEnergy: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.energy,
  },
  impactCardPoints: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.points,
  },
  impactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  impactValuePoints: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.points,
  },
  impactLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  impactSubtext: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  tipsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  tipMainText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionButtonEco: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  recycleButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  recycleButtonSaved: {
    backgroundColor: COLORS.success,
  },
  recycleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scanAnotherButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanAnotherText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  centersList: {
    padding: 16,
  },
  centerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  centerAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  centerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.warning,
  },
  ratingsCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  centerAction: {
    marginLeft: 12,
  },
  directionsText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  noCentersContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noCentersIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noCentersText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  noCentersSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
