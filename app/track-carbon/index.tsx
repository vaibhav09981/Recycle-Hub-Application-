import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Colors from UI/UX Guide
const COLORS = {
  primary: '#10B981',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

export default function TrackCarbonScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Track Your Impact</Text>
          <Text style={styles.heroSubtitle}>
            Monitor your carbon footprint and see how much CO2 you&apos;re saving through recycling
          </Text>
        </View>

        {/* Option Buttons */}
        <View style={styles.buttonContainer}>
          {/* Button 1: Track My Carbon Footprint */}
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => (router as any).push('/track-carbon/footprint')}
            activeOpacity={0.9}
          >
            <View style={styles.buttonIconContainer}>
              <Text style={styles.buttonIcon}>🏭</Text>
            </View>
            <Text style={styles.buttonTitle}>Track My Carbon Footprint</Text>
            <Text style={styles.buttonSubtitle}>Calculate your daily/weekly emissions before recycling</Text>
          </TouchableOpacity>

          {/* Button 2: Track Carbon Savings */}
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => (router as any).push('/track-carbon/savings')}
            activeOpacity={0.9}
          >
            <View style={styles.buttonIconContainer}>
              <Text style={styles.buttonIcon}>🌱</Text>
            </View>
            <Text style={styles.buttonTitle}>Track Carbon Savings</Text>
            <Text style={styles.buttonSubtitle}>See how much CO2 you&apos;ve saved by recycling</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Track Carbon?</Text>
           
          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>📊</Text>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Know Your Impact</Text>
              <Text style={styles.infoCardText}>Understand how your consumption affects the environment</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>📈</Text>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Track Progress</Text>
              <Text style={styles.infoCardText}>See improvements over time with detailed analytics</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardIcon}>🏆</Text>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Earn Rewards</Text>
              <Text style={styles.infoCardText}>Get badges and points for reducing your carbon footprint</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
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
  // Custom Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    lineHeight: 20,
  },
  // Button Container
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  // Primary Button (Footprint)
  buttonPrimary: {
    backgroundColor: COLORS.warningLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  buttonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    fontSize: 28,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  buttonSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    lineHeight: 18,
  },
  // Secondary Button (Savings)
  buttonSecondary: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  // Info Section
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    lineHeight: 18,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
