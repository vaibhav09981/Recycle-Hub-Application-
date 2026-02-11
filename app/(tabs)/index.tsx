import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCarbon } from '@/context/CarbonContext';

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
};

export default function HomeScreen() {
 const { session } = useAuth();

export default function HomeScreen() {
  const { session } = useAuth();
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const { user } = useAuth();
  const { totalFootprint, totalSavings, carbonHistory } = useCarbon();
  const [searchQuery, setSearchQuery] = useState('');

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

  const getRecyclableColor = (status: string) => {
    switch (status) {
      case 'fully':
        return '#10B981';
      case 'partially':
        return '#F59E0B';
      case 'no':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getRecyclableIcon = (status: string) => {
    switch (status) {
      case 'fully':
        return '♻️';
      case 'partially':
        return '⚠️';
      case 'no':
        return '❌';
      default:
        return '❓';
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
          <Text style={styles.greeting}>Good Morning</Text>
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
              style={{ flex: 1, color: '#374151', fontFamily: 'Poppins' }}

              placeholder="Search items..."


  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
            <Text className="text-gray-400 mr-3">🔍</Text>
            <TextInput
              className="flex-1 text-gray-700 font-poppins"
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
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
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
            Good Morning
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontFamily: 'Poppins' }}>{currentDate}</Text>
          
          {/* Impact Cards Row */}
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>🌱</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0 kg</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins' }}>CO₂ Saved</Text>
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
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}>
            {/* Card Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>🤖</Text>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
                    AI Scanner
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    Powered by Gemini Vision
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins' }}>
                Scan Item
              </Text>
              <Text style={{ color: '#10B981' }}>✕</Text>
        <View className="px-4 pt-6">
          <Text className="text-2xl font-bold text-gray-900 font-poppins">
            Good Morning
          </Text>
          <View className="flex-row items-baseline mt-1">
            <Text className="text-5xl font-bold text-gray-900 font-poppins">0</Text>
            <Text className="text-base font-medium text-emerald-500 ml-2 font-poppins">
              Items Scanned
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mt-1 font-poppins">{currentDate}</Text>
        </View>

        {/* Main Card: Scan Item */}
        <View className="px-4 pt-6">
          <View className="bg-white rounded-2xl shadow-sm p-4">
            {/* Card Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-emerald-500 font-poppins">
                Scan Item
              </Text>
              <Text className="text-emerald-500">✕</Text>
            </View>

            {/* Camera/Upload Area */}
            <TouchableOpacity
              style={styles.scannerButton}
              style={{ aspectRatio: 1.5, borderWidth: 3, borderColor: '#10B981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', borderStyle: 'dashed' }}
              onPress={handleScan}
              activeOpacity={0.9}
            >

              <View style={styles.scannerButtonContent}>
                <View style={styles.scannerButtonIcon}>
                  <Text style={styles.scannerButtonIconText}>📷</Text>
              <View style={{ alignItems: 'center' }}>
                <View style={{ backgroundColor: '#10B981', padding: 16, borderRadius: 50, marginBottom: 12 }}>
                  <Text style={{ fontSize: 32 }}>📷</Text>
              style={{ aspectRatio: 1, borderWidth: 2, borderColor: '#10B981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}
              onPress={handleUpload}
              activeOpacity={0.8}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📷</Text>
                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 24 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '500', fontFamily: 'Poppins' }}>Upload</Text>

              className="aspect-square border-2 border-emerald-500 rounded-xl items-center justify-center bg-gray-50"
              onPress={handleUpload}
              activeOpacity={0.8}
            >
              <View className="items-center">
                <Text className="text-4xl mb-2">📷</Text>
                <View className="bg-emerald-500 px-6 py-2 rounded-full">
                  <Text className="text-white font-medium font-poppins">Upload</Text>
                </View>
                <Text style={styles.scannerButtonTitle}>Tap to Scan</Text>
                <Text style={styles.scannerButtonSubtitle}>
                  Identify recyclability, carbon savings{'\n'}and get action options
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
          </View>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

        {/* Eco Shop Section */}
        <View className="px-4 pt-6 pb-24">
          <Text className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
            Eco Shop
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-20 right-6">
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-emerald-500 items-center justify-center shadow-lg"
          onPress={() => router.push('/(tabs)/shop')}
          activeOpacity={0.8}
        >
          <Text className="text-2xl">🛍️</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-6">
        <View className="flex-row justify-between items-center">
          {/* Home - Active */}
          <TouchableOpacity className="items-center">
            <Text className="text-2xl">🏠</Text>
            <Text className="text-xs font-medium text-emerald-500 mt-1 font-poppins">Home</Text>
          </TouchableOpacity>

          {/* Cart - Inactive */}
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text className="text-2xl">🛒</Text>
            <Text className="text-xs font-medium text-gray-400 mt-1 font-poppins">Cart</Text>
          </TouchableOpacity>

          {/* Profile - Inactive */}
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text className="text-2xl">👤</Text>
            <Text className="text-xs font-medium text-gray-400 mt-1 font-poppins">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  // Search Bar
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
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
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  optionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
