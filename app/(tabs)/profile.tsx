import { useAuth } from '@/context/AuthContext';
import { useCarbon } from '@/context/CarbonContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

interface MonthlyData {
  month: string;
  co2Saved: number;
  itemsScanned: number;
}

const badges: Badge[] = [
  { id: '1', name: 'First Scan', icon: '📸', description: 'Scan your first item', earned: true, earnedDate: '2024-01-15' },
  { id: '2', name: 'Eco Warrior', icon: '🌍', description: 'Save 10kg CO₂', earned: true, earnedDate: '2024-01-20' },
  { id: '3', name: 'Recycling Pro', icon: '♻️', description: 'Recycle 20 items', earned: false },
  { id: '4', name: 'Water Saver', icon: '💧', description: 'Save 100L water', earned: false },
  { id: '5', name: 'Energy Hero', icon: '⚡', description: 'Save 5kWh energy', earned: false },
  { id: '6', name: 'Green Champion', icon: '🏆', description: 'Earn 500 points', earned: false },
  { id: '7', name: 'Consistent', icon: '🔥', description: 'Scan 7 days in a row', earned: false },
  { id: '8', name: 'Influencer', icon: '🌟', description: 'Share 5 items', earned: false },
];

const monthlyData: MonthlyData[] = [
  { month: 'Jan', co2Saved: 2.5, itemsScanned: 5 },
  { month: 'Feb', co2Saved: 4.2, itemsScanned: 8 },
  { month: 'Mar', co2Saved: 6.8, itemsScanned: 12 },
  { month: 'Apr', co2Saved: 8.1, itemsScanned: 15 },
  { month: 'May', co2Saved: 12.5, itemsScanned: 22 },
  { month: 'Jun', co2Saved: 15.3, itemsScanned: 28 },
];

// Progress Ring Component
function ProgressRing({ progress, color, size = 80, strokeWidth = 8 }: { progress: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '-90deg' }] }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: '#E5E7EB' }}>
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: '0deg' }],
          }}
        />
      </View>
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '90deg' }] }]}>
        <View
          style={{
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            borderWidth: strokeWidth,
            borderColor: 'transparent',
            borderTopColor: color,
            borderLeftColor: color,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.textPrimary }}>
            {Math.round(progress)}%
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, session, signOut } = useAuth();
  const { totalFootprint, totalSavings, carbonHistory } = useCarbon();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'impact' | 'badges' | 'history'>('impact');
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };


  // Calculate real impact data from CarbonContext
  const itemsRecycled = carbonHistory.filter((entry) => entry.type === 'savings').length;
  const co2Saved = totalSavings; // kg CO2 saved
  const carbonFootprint = totalFootprint; // kg CO2 footprint
  const greenPoints = Math.round(totalSavings * 10); // 10 points per kg saved

  const userImpact = {
    totalCo2Saved: co2Saved,
    totalWaterSaved: 210,
    totalEnergySaved: 7.2,
    totalItemsScanned: carbonHistory.length,
    totalItemsRecycled: itemsRecycled,
    greenPoints: greenPoints,
    level: greenPoints >= 500 ? 'Green Champion' : greenPoints >= 200 ? 'Eco Warrior' : 'Beginner',
    nextLevelPoints: greenPoints >= 500 ? 1000 : greenPoints >= 200 ? 500 : 200,
  };

  const getProgressWidth = () => {
    const progress = (userImpact.greenPoints / userImpact.nextLevelPoints) * 100;
    return Math.min(progress, 100);
  };

  const recyclingRate = ((userImpact.totalItemsRecycled / userImpact.totalItemsScanned) * 100).toFixed(0);
  const badgesEarned = badges.filter(b => b.earned).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Impact</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{userImpact.level}</Text>
            </View>
          </View>

          <Text style={styles.userName}>
            {user?.name || session?.user?.email?.split('@')[0] || 'Eco Hero'}
          </Text>

          {/* Green Points Progress */}
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View style={styles.pointsIconRow}>
                <Text style={styles.pointsIcon}>⭐</Text>
                <Text style={styles.pointsValue}>{userImpact.greenPoints}</Text>
              </View>
              <Text style={styles.pointsRemaining}>
                {userImpact.nextLevelPoints - userImpact.greenPoints} points to next level
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={{ ...styles.progressFill, width: `${getProgressWidth()}%` as `${number}%` }} />
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['impact', 'badges', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'impact' ? '📊 Impact' : tab === 'badges' ? '🏅 Badges' : '📜 History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'impact' && (
          <View style={styles.tabContent}>
            {/* Environmental Impact Section */}
            <Text style={styles.sectionTitle}>🌱 Environmental Impact</Text>
            
            {/* Impact Stats Grid */}
            <View style={styles.impactGrid}>
              {/* CO2 Saved */}
              <View style={styles.impactCard}>
                <View style={[styles.impactIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.impactIcon}>🌍</Text>
                </View>
                <Text style={styles.impactValue}>{userImpact.totalCo2Saved.toFixed(1)} kg</Text>
                <Text style={styles.impactLabel}>CO₂ Saved</Text>
              </View>

              {/* Water Saved */}
              <View style={styles.impactCard}>
                <View style={[styles.impactIconContainer, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={styles.impactIcon}>💧</Text>
                </View>
                <Text style={styles.impactValueWater}>{userImpact.totalWaterSaved}L</Text>
                <Text style={styles.impactLabel}>Water Saved</Text>
              </View>

              {/* Energy Saved */}
              <View style={styles.impactCard}>
                <View style={[styles.impactIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.impactIcon}>⚡</Text>
                </View>
                <Text style={styles.impactValueEnergy}>{userImpact.totalEnergySaved}kWh</Text>
                <Text style={styles.impactLabel}>Energy Saved</Text>
              </View>

              {/* Items Recycled */}
              <View style={styles.impactCard}>
                <View style={[styles.impactIconContainer, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={styles.impactIcon}>♻️</Text>
                </View>
                <Text style={styles.impactValue}>{userImpact.totalItemsRecycled}</Text>
                <Text style={styles.impactLabel}>Items Recycled</Text>
              </View>
            </View>

            {/* Progress Rings */}
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>📈 Monthly Progress</Text>
              <View style={styles.progressCards}>
                <View style={styles.progressCard}>
                  <ProgressRing progress={parseFloat(recyclingRate as string)} color={COLORS.primary} />
                  <Text style={styles.progressCardTitle}>Recycling Rate</Text>
                  <Text style={styles.progressCardSubtitle}>{recyclingRate}% of items recycled</Text>
                </View>
                <View style={styles.progressCard}>
                  <ProgressRing progress={parseFloat(((badgesEarned / badges.length) * 100).toFixed(0))} color={COLORS.warning} />
                  <Text style={styles.progressCardTitle}>Badges Earned</Text>
                  <Text style={styles.progressCardSubtitle}>{badgesEarned}/{badges.length} badges unlocked</Text>
                </View>
              </View>
            </View>

            {/* Monthly Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>CO₂ Saved This Year</Text>
              <View style={styles.chartContainer}>
                {monthlyData.map((data, index) => {
                  const maxCo2 = Math.max(...monthlyData.map(d => d.co2Saved));
                  const height = (data.co2Saved / maxCo2) * 80;
                  return (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.chartBarValue}>
                        <Text style={styles.chartBarValueText}>{data.co2Saved}kg</Text>
                      </View>
                      <View style={[styles.chartBarFill, { height: height, backgroundColor: COLORS.primary }]} />
                      <Text style={styles.chartBarLabel}>{data.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStatsCard}>
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Total Items Scanned</Text>
                <Text style={styles.quickStatValue}>{userImpact.totalItemsScanned}</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Recycling Rate</Text>
                <Text style={[styles.quickStatValue, { color: COLORS.primary }]}>{recyclingRate}%</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Badges Earned</Text>
                <Text style={[styles.quickStatValue, { color: COLORS.warning }]}>{badgesEarned}/{badges.length}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🏅 Your Badges</Text>
            <View style={styles.badgesGrid}>
              {badges.map((badge) => (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}
                >
                  <View style={styles.badgeIconContainer}>
                    <Text style={styles.badgeIcon}>{badge.earned ? badge.icon : '🔒'}</Text>
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                  {badge.earned && badge.earnedDate && (
                    <Text style={styles.badgeEarnedDate}>Earned {badge.earnedDate}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>📜 Scan History</Text>
            <View style={styles.historyList}>
              {[
                { name: 'Plastic Water Bottle', date: 'Today', co2: 42, recyclable: true },
                { name: 'Cardboard Box', date: 'Yesterday', co2: 65, recyclable: true },
                { name: 'E-waste Device', date: '2 days ago', co2: 30, recyclable: false },
                { name: 'Glass Jar', date: '3 days ago', co2: 70, recyclable: true },
                { name: 'Aluminum Can', date: '4 days ago', co2: 85, recyclable: true },
              ].map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyIconContainer}>
                    <Text style={styles.historyIcon}>{item.recyclable ? '♻️' : '⚠️'}</Text>
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyName}>{item.name}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeText}>+{item.co2}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={styles.logoutContainer}>

        <View style={{ padding: 16, paddingBottom: 32 }}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
        <TouchableOpacity
          style={{ 
            backgroundColor: '#EF4444', 
            paddingVertical: 16, 
            borderRadius: 12,
            alignItems: 'center'
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Poppins' }}>
            Logout
          </Text>
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Profile</Text>
        
        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="ml-4">
              <Text className="text-lg font-semibold text-gray-900 font-poppins">
                {user?.email || 'User'}
              </Text>
              <Text className="text-gray-500 font-poppins">View Profile</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-red-500 py-4 rounded-xl items-center mt-auto mb-6"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold font-poppins">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  scrollView: {
    flex: 1,
  },
  // Profile Header
  profileHeader: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primaryLight,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  // Points Card
  pointsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.warning,
    fontFamily: 'Poppins',
  },
  pointsRemaining: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 6,
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  // Tab Content
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  // Impact Grid
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  impactCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  impactIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  impactIcon: {
    fontSize: 26,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactValueWater: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.water,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactValueEnergy: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.energy,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  // Progress Section
  progressSection: {
    marginBottom: 24,
  },
  progressCards: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginTop: 12,
    textAlign: 'center',
  },
  progressCardSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginTop: 4,
    textAlign: 'center',
  },
  // Chart
  chartCard: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingVertical: 12,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarValue: {
    marginBottom: 8,
  },
  chartBarValueText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  chartBarFill: {
    width: 28,
    borderRadius: 6,
    marginBottom: 6,
  },
  chartBarLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontFamily: 'Poppins',
  },
  // Quick Stats
  quickStatsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickStatDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  quickStatLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  // Badges
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 40,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginTop: 4,
  },
  badgeEarnedDate: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginTop: 8,
  },
  // History
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  historyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyIcon: {
    fontSize: 22,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  historyBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  // Logout
  logoutContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: 'Poppins',
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
