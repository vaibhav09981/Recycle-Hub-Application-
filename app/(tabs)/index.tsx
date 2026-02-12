import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '@/context/AuthContext';
import { useCarbon } from '@/context/CarbonContext';
import { findNearbyRecyclingCenters, RecyclingCenter } from '@/lib/scanService';

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
  subtleBg: '#F3F4F6',
  subtleBorder: '#E5E7EB',
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalFootprint, totalSavings, carbonHistory } = useCarbon();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user name from session
  const userName = user?.name || user?.email?.split('@')[0] || 'Eco Hero';

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Calculate items recycled from history
  const itemsRecycled = carbonHistory.filter((entry) => entry.type === 'savings').length;

  const handleScan = () => {
    router.push('/scan');
  };

  // Get current location (private - no coordinates shown to user)
  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Required', 'Please enable location access to find nearby recycling centers.');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get location name
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (address) {
        const city = address.city || address.subregion || address.region || 'Unknown';
        setLocationName(city);
      }
      
      setUserLocation({ lat: latitude, lng: longitude });
      
      // Don't show lat/long to user - just confirm location found
      Alert.alert(
        '📍 Location Found',
        'Your location has been set. Tap "Nearby Recycling Centres" to find centers in your area.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please check your GPS settings.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Find recycling centers in the state/area
  const handleFindNearbyCenters = async () => {
    setShowCentersModal(true);
    setIsLoadingLocation(true);

    try {
      let location = userLocation;
      if (!location) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location Required', 'Please enable location access to find recycling centers in your area.');
          setIsLoadingLocation(false);
          return;
        }

        const coords = await Location.getCurrentPositionAsync({});
        location = { lat: coords.coords.latitude, lng: coords.coords.longitude };
        setUserLocation(location);
        
        // Reverse geocode to get location name
        const [address] = await Location.reverseGeocodeAsync({ 
          latitude: coords.coords.latitude, 
          longitude: coords.coords.longitude 
        });
        
        if (address) {
          const city = address.city || address.subregion || address.region || 'Your Area';
          setLocationName(city);
        }
      }

      // Search with larger radius to cover entire state/region
      const centers = await findNearbyRecyclingCenters(location.lat, location.lng, 100000);
      setRecyclingCenters(centers);

      if (centers.length === 0) {
        Alert.alert('No Centers Found', 'No recycling centers were found in your area. Try searching manually.');
      }
    } catch (error) {
      console.error('Find centers error:', error);
      Alert.alert('Error', 'Could not find recycling centers. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.header}>Good Morning</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {/* Location Button */}
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={handleGetLocation}
            activeOpacity={0.7}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.locationIcon}>📍</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Impact Stats Dashboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            {/* CO2 Saved */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                <Text style={styles.statIcon}>🌍</Text>
              </View>
              <Text style={styles.statValue}>{totalSavings.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>

            {/* Carbon Footprint */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.statIcon}>🏭</Text>
              </View>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>{totalFootprint.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>Carbon Footprint</Text>
            </View>

            {/* Items Recycled */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                <Text style={styles.statIcon}>♻️</Text>
              </View>
              <Text style={styles.statValue}>{itemsRecycled}</Text>
              <Text style={styles.statLabel}>Items Recycled</Text>
            </View>

            {/* Green Points */}
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>{Math.round(totalSavings * 10)}</Text>
              <Text style={styles.statLabel}>Green Points</Text>
            </View>
          </View>
        </View>

        {/* AI Scanner Card */}
        <View style={styles.section}>
          <View style={styles.scannerCard}>
            {/* Scanner Header */}
            <View style={styles.scannerHeader}>
              <View style={styles.scannerTitleRow}>
                <View style={[styles.scannerIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.scannerIcon}>🤖</Text>
                </View>
                <View style={styles.scannerTitleContent}>
                  <Text style={styles.scannerTitle}>AI Scanner</Text>
                  <Text style={styles.scannerSubtitle}>Powered by Gemini Vision</Text>
                </View>
              </View>
            </View>

            {/* Camera/Upload Area */}
            <TouchableOpacity
              style={styles.scannerButton}
              onPress={handleScan}
              activeOpacity={0.9}
            >
              <View style={styles.scannerButtonContent}>
                <View style={styles.scannerButtonIcon}>
                  <Text style={styles.scannerButtonIconText}>📷</Text>
                </View>
                <Text style={styles.scannerButtonTitle}>Tap to Scan</Text>
                <Text style={styles.scannerButtonSubtitle}>
                  Identify recyclability, carbon savings{' '}and get action options
                </Text>
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => router.push('/(tabs)/shop')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionIcon}>🛍️</Text>
                <Text style={styles.quickActionLabel}>Eco Shop</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => router.push('/(tabs)/cart')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionIcon}>🛒</Text>
                <Text style={styles.quickActionLabel}>My Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionIcon}>📊</Text>
                <Text style={styles.quickActionLabel}>My Impact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => (router as any).push('/track-carbon')}
              activeOpacity={0.9}
            >
              <Text style={styles.optionButtonIcon}>📊</Text>
              <Text style={styles.optionButtonText}>Track Carbon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => router.push('/(tabs)/shop')}
              activeOpacity={0.9}
            >
              <Text style={styles.optionButtonIcon}>🛍️</Text>
              <Text style={styles.optionButtonText}>Shop Eco-friendly</Text>
            </TouchableOpacity>

            {/* New: Nearby Recycling Centres Button */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleFindNearbyCenters}
              activeOpacity={0.9}
            >
              <Text style={styles.optionButtonIcon}>♻️</Text>
              <Text style={styles.optionButtonText}>Nearby Recycling Centres</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing for Tab Bar */}
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
              <Text style={styles.modalTitle}>♻️ Recycling Centres</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCentersModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {locationName ? (
              <Text style={styles.locationSubtitle}>📍 {locationName}</Text>
            ) : null}

            {isLoadingLocation ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding recycling centres...</Text>
              </View>
            ) : recyclingCenters.length > 0 ? (
              <FlatList
                data={recyclingCenters}
                keyExtractor={(item) => item.placeId || Math.random().toString()}
                renderItem={({ item }) => (
                  <View style={styles.centerCard}>
                    <View style={styles.centerInfo}>
                      <Text style={styles.centerName}>{item.name}</Text>
                      <Text style={styles.centerAddress}>{item.address}</Text>
                      <View style={styles.centerRating}>
                        <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
                        <Text style={styles.ratingsCount}>({item.totalRatings})</Text>
                      </View>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.centersList}
              />
            ) : (
              <View style={styles.noCentersContainer}>
                <Text style={styles.noCentersIcon}>🔍</Text>
                <Text style={styles.noCentersText}>No centres found</Text>
                <Text style={styles.noCentersSubtext}>Try enabling location access</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Header Section
  headerSection: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  // Search Bar & Location
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationIcon: {
    fontSize: 20,
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  // Scanner Card
  scannerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scannerHeader: {
    marginBottom: 16,
  },
  scannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scannerIcon: {
    fontSize: 24,
  },
  scannerTitleContent: {
    flex: 1,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  scannerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  // Scanner Button
  scannerButton: {
    aspectRatio: 1.6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    borderStyle: 'dashed',
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scannerButtonContent: {
    alignItems: 'center',
  },
  scannerButtonIcon: {
    backgroundColor: COLORS.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scannerButtonIconText: {
    fontSize: 28,
  },
  scannerButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 4,
    textAlign: 'center',
  },
  scannerButtonSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.subtleBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.subtleBorder,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  // Option Buttons
  buttonContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.subtleBg,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.subtleBorder,
  },
  optionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  // Bottom Spacer
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
    backgroundColor: COLORS.subtleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  locationSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
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
    backgroundColor: COLORS.subtleBg,
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
