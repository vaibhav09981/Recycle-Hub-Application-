 import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useJournal, ScannedItem } from '@/context/JournalContext';

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

export default function JournalScreen() {
  const router = useRouter();
  const { scannedItems, removeScannedItem, toggleScannedCart, getScannedCartItems, getTotalCarbonSaved, journalCount } = useJournal();
  const [selectedItem, setSelectedItem] = useState<ScannedItem | null>(null);

  const handleRemoveItem = (id: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove "${productName}" from your journal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removeScannedItem(id);
            if (selectedItem?.id === id) {
              setSelectedItem(null);
            }
          }
        },
      ]
    );
  };

  const handleToggleCart = (id: string) => {
    toggleScannedCart(id);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Journal</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Scanned</Text>
            <Text style={styles.summaryValue}>{journalCount}</Text>
            <Text style={styles.summarySubtitle}>items</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>CO₂ Saved</Text>
            <Text style={[styles.summaryValue, { color: COLORS.carbon }]}>{getTotalCarbonSaved().toFixed(2)} kg</Text>
            <Text style={styles.summarySubtitle}>by recycling</Text>
          </View>
        </View>

        {/* Scanned Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scanned Items</Text>
          
          {scannedItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptySubtitle}>Scan items to add them to your journal</Text>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push('/scan')}
              >
                <Text style={styles.scanButtonText}>Scan Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {scannedItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => setSelectedItem(item)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <View style={styles.itemMeta}>
                      <View style={[styles.recyclableBadge, { backgroundColor: getRecyclableColor(item.recyclability) + '20' }]}>
                        <Text style={[styles.recyclableText, { color: getRecyclableColor(item.recyclability) }]}>
                          {getRecyclableText(item.recyclability)}
                        </Text>
                      </View>
                      <Text style={styles.itemDate}>{formatDate(item.scannedAt)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.cartButton, item.inScannedCart && styles.cartButtonActive]}
                    onPress={() => handleToggleCart(item.id)}
                  >
                    <Text style={[styles.cartButtonText, item.inScannedCart && styles.cartButtonTextActive]}>
                      {item.inScannedCart ? '✓' : '+'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Selected Item Details */}
        {selectedItem && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Image source={{ uri: selectedItem.imageUrl }} style={styles.detailImage} />
                <View style={styles.detailHeaderInfo}>
                  <Text style={styles.detailName}>{selectedItem.productName}</Text>
                  {selectedItem.brand && (
                    <Text style={styles.detailBrand}>Brand: {selectedItem.brand}</Text>
                  )}
                  <View style={[styles.detailBadge, { backgroundColor: getRecyclableColor(selectedItem.recyclability) + '20' }]}>
                    <Text style={[styles.detailBadgeText, { color: getRecyclableColor(selectedItem.recyclability) }]}>
                      {getRecyclableText(selectedItem.recyclability)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailDivider} />

              {/* Impact Stats */}
              <Text style={styles.detailSectionTitle}>🌱 Environmental Impact</Text>
              <View style={styles.impactGrid}>
                <View style={styles.impactCard}>
                  <Text style={styles.impactIcon}>🌍</Text>
                  <Text style={styles.impactValue}>{selectedItem.savingsPercent}%</Text>
                  <Text style={styles.impactLabel}>CO₂ Savings</Text>
                </View>
                <View style={styles.impactCard}>
                  <Text style={styles.impactIcon}>💧</Text>
                  <Text style={styles.impactValue}>{selectedItem.waterSaved}L</Text>
                  <Text style={styles.impactLabel}>Water Saved</Text>
                </View>
                <View style={styles.impactCard}>
                  <Text style={styles.impactIcon}>⚡</Text>
                  <Text style={styles.impactValue}>{selectedItem.energySaved}kWh</Text>
                  <Text style={styles.impactLabel}>Energy Saved</Text>
                </View>
              </View>

              <View style={styles.detailDivider} />

              {/* Materials */}
              <Text style={styles.detailSectionTitle}>📦 Materials</Text>
              <View style={styles.materialsContainer}>
                {selectedItem.materials.map((material, index) => (
                  <View key={index} style={styles.materialTag}>
                    <Text style={styles.materialText}>{material}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.categoryText}>Category: {selectedItem.category}</Text>

              <View style={styles.detailDivider} />

              {/* Recycling Tips */}
              <Text style={styles.detailSectionTitle}>💡 Recycling Tips</Text>
              <Text style={styles.tipsText}>{selectedItem.recyclingTips}</Text>

              {/* Actions */}
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cartActionButton]}
                  onPress={() => {
                    handleToggleCart(selectedItem.id);
                    Alert.alert('Added to Cart', `${selectedItem.productName} added to your scanned items cart`);
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {selectedItem.inScannedCart ? 'Remove from Cart' : 'Add to Cart'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteActionButton]}
                  onPress={() => handleRemoveItem(selectedItem.id, selectedItem.productName)}
                >
                  <Text style={styles.deleteActionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Scanned Cart Summary */}
        {getScannedCartItems().length > 0 && (
          <View style={styles.scannedCartSection}>
            <Text style={styles.sectionTitle}>Scanned Items Cart ({getScannedCartItems().length})</Text>
            <View style={styles.scannedCartCard}>
              {getScannedCartItems().map((item) => (
                <View key={item.id} style={styles.scannedCartItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.scannedCartImage} />
                  <View style={styles.scannedCartInfo}>
                    <Text style={styles.scannedCartName}>{item.productName}</Text>
                    <Text style={styles.scannedCartWeight}>{item.estimatedWeight}g</Text>
                  </View>
                  <Text style={styles.scannedCartCarbon}>{item.carbonSaved} kg CO₂</Text>
                </View>
              ))}
              <View style={styles.scannedCartTotal}>
                <Text style={styles.scannedCartTotalText}>
                  Total: {getScannedCartItems().reduce((sum, item) => sum + item.estimatedWeight, 0)}g | 
                  CO₂: {getScannedCartItems().reduce((sum, item) => sum + parseFloat(item.carbonSaved), 0).toFixed(2)} kg
                </Text>
              </View>
            </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Summary Section
  summarySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summarySubtitle: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  // Empty State
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
  // Items List
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recyclableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recyclableText: {
    fontSize: 10,
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cartButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  cartButtonTextActive: {
    color: '#FFFFFF',
  },
  // Detail Section
  detailSection: {
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  detailHeaderInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  detailBrand: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  detailBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  // Impact Grid
  impactGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  impactCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  impactIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  impactLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Materials
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  materialTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  materialText: {
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  // Tips
  tipsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Actions
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartActionButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteActionButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteActionButtonText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  // Scanned Cart Section
  scannedCartSection: {
    marginBottom: 24,
  },
  scannedCartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  scannedCartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scannedCartImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  scannedCartInfo: {
    flex: 1,
  },
  scannedCartName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scannedCartWeight: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scannedCartCarbon: {
    fontSize: 12,
    color: COLORS.carbon,
    fontWeight: '500',
  },
  scannedCartTotal: {
    paddingTop: 12,
    alignItems: 'center',
  },
  scannedCartTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
