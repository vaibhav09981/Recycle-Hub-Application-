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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

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

// Mock material data
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
      <Text style={styles.scanningText}>Analyzing...</Text>
      <Text style={styles.scanningSubtext}>Identifying material composition</Text>
    </View>
  );
}

export default function ScanScreen() {
  const router = useRouter();
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
    setScanResult(null);

    // Simulate AI analysis
    setTimeout(() => {
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
    }, 2500);
  };

  const handleRecycle = () => {
    setIsSaved(true);
    // TODO: Save to database, update user impact
  };

  const getRecyclableColor = (status: string) => {
    switch (status) {
      case 'fully': return COLORS.success;
      case 'partially': return COLORS.warning;
      case 'no': return COLORS.error;
      default: return COLORS.textTertiary;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fully': return '♻️';
      case 'partially': return '⚠️';
      case 'no': return '❌';
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
        <Text style={styles.headerTitle}>Scan Item</Text>
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
              Take a photo or upload an image to identify recyclability and environmental impact
            </Text>
            
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              activeOpacity={0.9}
            >
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            </TouchableOpacity>
            
            <Text style={styles.uploadDivider}>or take a photo with camera</Text>
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
                <TouchableOpacity
                  style={styles.analyzeButton}
                  onPress={() => analyzeImage(selectedImage)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.analyzeButtonText}>Analyze Again</Text>
                </TouchableOpacity>
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
                  <Text style={styles.statusIcon}>{getStatusIcon(scanResult.recyclable)}</Text>
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>{scanResult.itemName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getRecyclableColor(scanResult.recyclable) }]}>
                    <Text style={styles.statusBadgeText}>{getRecyclableText(scanResult.recyclable)}</Text>
                  </View>
                </View>
              </View>

              {/* Material Info */}
              <View style={styles.materialCard}>
                <Text style={styles.materialLabel}>Material Composition</Text>
                <Text style={styles.materialValue}>{scanResult.material}</Text>
              </View>

              {/* Impact Stats */}
              <View style={styles.impactSection}>
                <Text style={styles.impactTitle}>🌱 Your Environmental Impact</Text>
                <View style={styles.impactGrid}>
                  {/* CO2 Saved */}
                  <View style={[styles.impactCard, styles.impactCardCarbon]}>
                    <Text style={styles.impactIcon}>🌍</Text>
                    <Text style={styles.impactValue}>{scanResult.carbonSaved}%</Text>
                    <Text style={styles.impactLabel}>CO₂ Saved</Text>
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
                    <Text style={styles.impactValuePoints}>+50</Text>
                    <Text style={styles.impactLabel}>Green Points</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Recycling Tips */}
            {scanResult.tips.length > 0 && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Recycling Tips</Text>
                {scanResult.tips.map((tip, index) => (
                  <View key={index} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Options */}
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>♻️ What Would You Like to Do?</Text>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {}}
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
                onPress={() => {}}
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
                onPress={() => {}}
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
    fontFamily: 'Poppins',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  // Upload Section
  uploadSection: {
    padding: 32,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 40,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  uploadDivider: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontFamily: 'Poppins',
  },
  // Analyzing Section
  analyzingSection: {
    padding: 24,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  // Scanning Animation
  scanningContainer: {
    alignItems: 'center',
    padding: 24,
  },
  scanFrame: {
    width: 180,
    height: 180,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    left: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  scanCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
  },
  scanCornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  scanCornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  scanCornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  scanCornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  scanningSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  // Result Section
  resultSection: {
    padding: 16,
  },
  // Status Card
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
  // Material Card
  materialCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  materialLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  materialValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  // Impact Section
  impactSection: {
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  impactCard: {
    width: '47%',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  impactCardCarbon: {
    backgroundColor: COLORS.primaryLight,
  },
  impactCardWater: {
    backgroundColor: '#EFF6FF',
  },
  impactCardEnergy: {
    backgroundColor: '#FEF3C7',
  },
  impactCardPoints: {
    backgroundColor: '#FCE7F3',
  },
  impactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.carbon,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactValuePoints: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.points,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  // Tips Card
  tipsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.primary,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    flex: 1,
    lineHeight: 20,
  },
  // Actions Card
  actionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  actionButtonEco: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  actionArrow: {
    fontSize: 20,
    color: COLORS.primary,
  },
  // Recycle Button
  recycleButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  recycleButtonSaved: {
    backgroundColor: COLORS.success,
  },
  recycleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  // Scan Another
  scanAnotherButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  scanAnotherText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
