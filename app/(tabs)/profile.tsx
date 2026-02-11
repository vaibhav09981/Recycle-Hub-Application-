import { useAuth } from '@/context/AuthContext';
import { ScannedItem, useJournal } from '@/context/JournalContext';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// Badge definitions (criteria-based, not hardcoded)
interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: (stats: UserStats) => boolean;
}

interface UserStats {
  totalItemsScanned: number;
  totalItemsRecycled: number;
  totalCo2Saved: number;
  totalWaterSaved: number;
  totalEnergySaved: number;
  greenPoints: number;
  consecutiveDays: number;
  sharesCount: number;
}

const badgeDefinitions: BadgeDefinition[] = [
  { id: 'first-scan', name: 'First Scan', icon: '📸', description: 'Scan your first item', criteria: (s) => s.totalItemsScanned >= 1 },
  { id: 'eco-warrior', name: 'Eco Warrior', icon: '🌍', description: 'Save 1kg CO₂', criteria: (s) => s.totalCo2Saved >= 1 },
  { id: 'recycling-pro', name: 'Recycling Pro', icon: '♻️', description: 'Recycle 5 items', criteria: (s) => s.totalItemsRecycled >= 5 },
  { id: 'water-saver', name: 'Water Saver', icon: '💧', description: 'Save 10L water', criteria: (s) => s.totalWaterSaved >= 10 },
  { id: 'energy-hero', name: 'Energy Hero', icon: '⚡', description: 'Save 1kWh energy', criteria: (s) => s.totalEnergySaved >= 1 },
  { id: 'green-champion', name: 'Green Champion', icon: '🏆', description: 'Earn 100 points', criteria: (s) => s.greenPoints >= 100 },
  { id: 'consistent', name: 'Consistent', icon: '🔥', description: 'Scan 3 days in a row', criteria: (s) => s.consecutiveDays >= 3 },
  { id: 'influencer', name: 'Influencer', icon: '🌟', description: 'Share 3 items', criteria: (s) => s.sharesCount >= 3 },
  { id: 'master-recycler', name: 'Master Recycler', icon: '🌿', description: 'Recycle 20 items', criteria: (s) => s.totalItemsRecycled >= 20 },
  { id: 'climate-hero', name: 'Climate Hero', icon: '🌎', description: 'Save 10kg CO₂', criteria: (s) => s.totalCo2Saved >= 10 },
];

// Progress Ring Component
function ProgressRing({ progress, color, size = 80, strokeWidth = 8 }: { progress: number; color: string; size?: number; strokeWidth?: number }) {
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

// Helper to calculate consecutive days from scanned items
function calculateConsecutiveDays(items: ScannedItem[]): number {
  if (items.length === 0) return 0;
  
  const sortedByDate = [...items].sort((a, b) => 
    new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
  );
  
  let consecutive = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedByDate.length - 1; i++) {
    const currentDate = new Date(sortedByDate[i].scannedAt);
    currentDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(sortedByDate[i + 1].scannedAt);
    nextDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      consecutive++;
    } else {
      break;
    }
  }
  
  return consecutive;
}

export default function ProfileScreen() {
  const { user, session, signOut } = useAuth();
  const { scannedItems, getTotalCarbonSaved, scannedCartCount } = useJournal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'impact' | 'badges' | 'history'>('impact');

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  // Calculate real stats from JournalContext
  const userStats: UserStats = useMemo(() => {
    const totalWaterSaved = scannedItems.reduce((sum, item) => sum + parseFloat(item.waterSaved || '0'), 0);
    const totalEnergySaved = scannedItems.reduce((sum, item) => sum + parseFloat(item.energySaved || '0'), 0);
    
    return {
      totalItemsScanned: scannedItems.length,
      totalItemsRecycled: scannedItems.filter(item => item.recyclability === 'fully' || item.recyclability === 'partially').length,
      totalCo2Saved: getTotalCarbonSaved(),
      totalWaterSaved,
      totalEnergySaved,
      greenPoints: Math.round(getTotalCarbonSaved() * 10),
      consecutiveDays: calculateConsecutiveDays(scannedItems),
      sharesCount: 0, // Would track from sharing feature
    };
  }, [scannedItems, getTotalCarbonSaved]);

  // Calculate earned badges dynamically
  const earnedBadges = useMemo(() => {
    return badgeDefinitions.map(badge => ({
      ...badge,
      earned: badge.criteria(userStats),
      earnedDate: badge.criteria(userStats) 
        ? scannedItems
            .filter(() => badge.criteria(userStats))
            .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())[0]?.scannedAt
        : undefined,
    }));
  }, [userStats, scannedItems]);

  // Calculate monthly data from real scans
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return monthNames.slice(0, currentMonth + 1).map((month, index) => {
      const monthScans = scannedItems.filter(item => {
        const scanDate = new Date(item.scannedAt);
        return scanDate.getMonth() === index;
      });
      
      const co2Saved = monthScans.reduce((sum, item) => sum + parseFloat(item.carbonSaved || '0'), 0);
      
      return {
        month,
        co2Saved: co2Saved || (index === currentMonth ? 0 : 0.1), // Show minimal bar for empty months
        itemsScanned: monthScans.length,
      };
    });
  }, [scannedItems]);

  // User impact data
  const userImpact = {
    totalCo2Saved: userStats.totalCo2Saved,
    totalWaterSaved: userStats.totalWaterSaved,
    totalEnergySaved: userStats.totalEnergySaved,
    totalItemsScanned: userStats.totalItemsScanned,
    totalItemsRecycled: userStats.totalItemsRecycled,
    greenPoints: userStats.greenPoints,
    level: userStats.greenPoints >= 500 ? 'Green Champion' : 
           userStats.greenPoints >= 200 ? 'Eco Warrior' : 
           userStats.greenPoints >= 50 ? 'Eco Starter' : 'Beginner',
    nextLevelPoints: userStats.greenPoints >= 500 ? 1000 : 
                    userStats.greenPoints >= 200 ? 500 : 
                    userStats.greenPoints >= 50 ? 200 : 50,
  };

  const getProgressWidth = () => {
    const progress = (userImpact.greenPoints / userImpact.nextLevelPoints) * 100;
    return Math.min(progress, 100);
  };

  const recyclingRate = userImpact.totalItemsScanned > 0 
    ? ((userImpact.totalItemsRecycled / userImpact.totalItemsScanned) * 100).toFixed(0)
    : 0;
  
  const badgesEarned = earnedBadges.filter(b => b.earned).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
                {userImpact.nextLevelPoints - userImpact.greenPoints > 0 
                  ? `${userImpact.nextLevelPoints - userImpact.greenPoints} points to next level`
                  : 'Max level reached!'}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={{ ...styles.progressFill, width: `${getProgressWidth()}%` }} />
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
                <Text style={styles.impactValueWater}>{userImpact.totalWaterSaved.toFixed(0)}L</Text>
                <Text style={styles.impactLabel}>Water Saved</Text>
              </View>

              {/* Energy Saved */}
              <View style={styles.impactCard}>
                <View style={[styles.impactIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.impactIcon}>⚡</Text>
                </View>
                <Text style={styles.impactValueEnergy}>{userImpact.totalEnergySaved.toFixed(1)}kWh</Text>
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

            {/* Progress rings */}
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>📈 Progress</Text>
              <View style={styles.progressCards}>
                <View style={styles.progressCard}>
                  <ProgressRing progress={parseFloat(recyclingRate as string)} color={COLORS.primary} />
                  <Text style={styles.progressCardTitle}>Recycling Rate</Text>
                  <Text style={styles.progressCardSubtitle}>{recyclingRate}% recycled</Text>
                </View>
                <View style={styles.progressCard}>
                  <ProgressRing progress={parseFloat(((badgesEarned / badgeDefinitions.length) * 100).toFixed(0))} color={COLORS.warning} />
                  <Text style={styles.progressCardTitle}>Badges Earned</Text>
                  <Text style={styles.progressCardSubtitle}>{badgesEarned}/{badgeDefinitions.length}</Text>
                </View>
              </View>
            </View>

            {/* Monthly Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>CO₂ Saved This Year</Text>
              <View style={styles.chartContainer}>
                {monthlyData.map((data, index) => {
                  const maxCo2 = Math.max(...monthlyData.map(d => d.co2Saved), 1);
                  const height = (data.co2Saved / maxCo2) * 80;
                  return (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.chartBarValue}>
                        <Text style={styles.chartBarValueText}>{data.co2Saved > 0.1 ? `${data.co2Saved.toFixed(1)}kg` : ''}</Text>
                      </View>
                      <View style={[styles.chartBarFill, { height: Math.max(height, 4), backgroundColor: data.co2Saved > 0.1 ? COLORS.primary : COLORS.border }]} />
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
                <Text style={[styles.quickStatValue, { color: COLORS.warning }]}>{badgesEarned}/{badgeDefinitions.length}</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Cart Items</Text>
                <Text style={[styles.quickStatValue, { color: COLORS.info }]}>{scannedCartCount}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>🏅 Your Badges</Text>
            
            {/* Progress summary */}
            <View style={styles.badgesProgressCard}>
              <Text style={styles.badgesProgressTitle}>Progress: {badgesEarned} / {badgeDefinitions.length} badges</Text>
              <View style={styles.badgesProgressBar}>
                <View style={{ ...styles.badgesProgressFill, width: `${(badgesEarned / badgeDefinitions.length) * 100}%` }} />
              </View>
            </View>

            <View style={styles.badgesGrid}>
              {earnedBadges.map((badge) => (
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
                    <Text style={styles.badgeEarnedDate}>Earned {formatDate(badge.earnedDate)}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>📜 Scan History</Text>
            
            {scannedItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No scans yet</Text>
                <Text style={styles.emptySubtitle}>Start scanning items to build your history</Text>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => router.push('/scan')}
                >
                  <Text style={styles.scanButtonText}>Scan Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.historyList}>
                {scannedItems.map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyIconContainer}>
                      <Text style={styles.historyIcon}>
                        {item.recyclability === 'fully' ? '♻️' : item.recyclability === 'partially' ? '⚠️' : '❌'}
                      </Text>
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyName}>{item.productName}</Text>
                      <Text style={styles.historyDate}>{formatDate(item.scannedAt)}</Text>
                    </View>
                    <View style={styles.historyBadge}>
                      <Text style={styles.historyBadgeText}>+{item.savingsPercent}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
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
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Tab Content
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  // Impact Grid
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  impactCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  impactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  impactIcon: {
    fontSize: 24,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactValueWater: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.water,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactValueEnergy: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.energy,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  // Progress Section
  progressSection: {
    marginTop: 24,
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
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 12,
    textAlign: 'center',
  },
  progressCardSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  // Chart
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarValue: {
    marginBottom: 8,
  },
  chartBarValueText: {
    fontSize: 9,
    color: COLORS.textTertiary,
  },
  chartBarFill: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  // Quick Stats
  quickStatsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
  },
  // Badges
  badgesProgressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  badgesProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  badgesProgressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgesProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
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
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeEarnedDate: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
  // History
  emptyContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
  },
  historyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyIcon: {
    fontSize: 20,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Logout
  logoutContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
