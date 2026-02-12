import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useJournal, ScannedItem } from '@/context/JournalContext';

export default function JournalScreen() {
  const router = useRouter();
  const { scannedItems, removeScannedItem, toggleScannedCart, getScannedCartItems, getTotalCarbonSaved, journalCount } = useJournal();
  const [selectedItem, setSelectedItem] = useState<ScannedItem | null>(null);

  const handleRemoveItem = (id: string, productName: string) => {
    Alert.alert('Remove Item', `Remove "${productName}" from your journal?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { removeScannedItem(id); if (selectedItem?.id === id) setSelectedItem(null); } },
    ]);
  };

  const handleToggleCart = (id: string) => { toggleScannedCart(id); };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-row items-center px-4 py-4 bg-card border-b border-border">
        <TouchableOpacity className="flex-row items-center py-2" onPress={() => router.back()}>
          <Text className="text-xl text-primary font-semibold mr-1">←</Text>
          <Text className="text-base font-semibold text-primary">BACK</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-textPrimary text-center">My Journal</Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-card rounded-2xl p-4 items-center">
            <Text className="text-xs text-textSecondary mb-2">Total Scanned</Text>
            <Text className="text-2xl font-bold text-primary">{journalCount}</Text>
            <Text className="text-xs text-textTertiary">items</Text>
          </View>
          <View className="flex-1 bg-card rounded-2xl p-4 items-center">
            <Text className="text-xs text-textSecondary mb-2">CO₂ Saved</Text>
            <Text className="text-2xl font-bold text-emerald-600">{getTotalCarbonSaved().toFixed(2)} kg</Text>
            <Text className="text-xs text-textTertiary">by recycling</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-textPrimary mb-3">Scanned Items</Text>
          {scannedItems.length === 0 ? (
            <View className="bg-card rounded-2xl p-10 items-center">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="text-lg font-semibold text-textPrimary mb-2">No items yet</Text>
              <Text className="text-sm text-textSecondary mb-6">Scan items to add them to your journal</Text>
              <TouchableOpacity className="bg-primary px-8 py-3 rounded-lg" onPress={() => router.push('/scan')}>
                <Text className="text-base font-semibold text-white">Scan Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {scannedItems.map((item) => (
                <TouchableOpacity key={item.id} className="flex-row items-center bg-card rounded-xl p-3" onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
                  <Image source={{ uri: item.imageUrl }} className="w-15 h-15 rounded-xl mr-3" />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-textPrimary mb-1">{item.productName}</Text>
                    <View className="flex-row items-center gap-2">
                      <View className="px-2 py-0.5 rounded" style={{ backgroundColor: getRecyclableColor(item.recyclability) + '33' }}>
                        <Text className="text-xs font-medium" style={{ color: getRecyclableColor(item.recyclability) }}>{getRecyclableText(item.recyclability)}</Text>
                      </View>
                      <Text className="text-xs text-textTertiary">{formatDate(item.scannedAt)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity className={`w-9 h-9 rounded-full items-center justify-center border ${item.inScannedCart ? 'bg-primary border-primary' : 'bg-background border-border'}`} onPress={() => handleToggleCart(item.id)}>
                    <Text className={`text-lg ${item.inScannedCart ? 'text-white' : 'text-textSecondary'}`}>{item.inScannedCart ? '✓' : '+'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedItem && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-textPrimary mb-3">Item Details</Text>
            <View className="bg-card rounded-2xl p-4">
              <View className="flex-row mb-4">
                <Image source={{ uri: selectedItem.imageUrl }} className="w-25 h-25 rounded-xl mr-4" />
                <View className="flex-1">
                  <Text className="text-xl font-bold text-textPrimary">{selectedItem.productName}</Text>
                  {selectedItem.brand && <Text className="text-sm text-textSecondary mt-1">Brand: {selectedItem.brand}</Text>}
                  <View className="mt-2 px-2 py-1 rounded" style={{ backgroundColor: getRecyclableColor(selectedItem.recyclability) + '33' }}>
                    <Text className="text-xs font-medium" style={{ color: getRecyclableColor(selectedItem.recyclability) }}>{getRecyclableText(selectedItem.recyclability)}</Text>
                  </View>
                </View>
              </View>

              <View className="h-px bg-border my-4" />

              <Text className="text-base font-semibold text-textPrimary mb-3">🌱 Environmental Impact</Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-background rounded-xl p-3 items-center">
                  <Text className="text-xl mb-1">🌍</Text>
                  <Text className="text-lg font-bold text-primary">{selectedItem.savingsPercent}%</Text>
                  <Text className="text-xs text-textSecondary">CO₂ Savings</Text>
                </View>
                <View className="flex-1 bg-background rounded-xl p-3 items-center">
                  <Text className="text-xl mb-1">💧</Text>
                  <Text className="text-lg font-bold text-blue-500">{selectedItem.waterSaved}L</Text>
                  <Text className="text-xs text-textSecondary">Water Saved</Text>
                </View>
                <View className="flex-1 bg-background rounded-xl p-3 items-center">
                  <Text className="text-xl mb-1">⚡</Text>
                  <Text className="text-lg font-bold text-amber-500">{selectedItem.energySaved}kWh</Text>
                  <Text className="text-xs text-textSecondary">Energy Saved</Text>
                </View>
              </View>

              <View className="h-px bg-border my-4" />

              <Text className="text-base font-semibold text-textPrimary mb-2">📦 Materials</Text>
              <View className="flex-row flex-wrap gap-2 mb-2">
                {selectedItem.materials.map((material, index) => (
                  <View key={index} className="bg-primaryLight px-3 py-1 rounded-full">
                    <Text className="text-xs text-primary">{material}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-sm text-textSecondary">Category: {selectedItem.category}</Text>

              <View className="h-px bg-border my-4" />

              <Text className="text-base font-semibold text-textPrimary mb-2">💡 Recycling Tips</Text>
              <Text className="text-sm text-textSecondary">{selectedItem.recyclingTips}</Text>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity className="flex-1 bg-primary py-3 rounded-xl items-center" onPress={() => { handleToggleCart(selectedItem.id); Alert.alert('Added to Cart', `${selectedItem.productName} added to your scanned items cart`); }}>
                  <Text className="text-base font-semibold text-white">{selectedItem.inScannedCart ? 'Remove from Cart' : 'Add to Cart'}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-red-100 py-3 px-4 rounded-xl items-center border border-red-500" onPress={() => handleRemoveItem(selectedItem.id, selectedItem.productName)}>
                  <Text className="text-base font-semibold text-red-600">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {getScannedCartItems().length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-textPrimary mb-3">Scanned Items Cart ({getScannedCartItems().length})</Text>
            <View className="bg-card rounded-2xl p-4">
              {getScannedCartItems().map((item) => (
                <View key={item.id} className="flex-row items-center py-3 border-b border-border">
                  <Image source={{ uri: item.imageUrl }} className="w-12 h-12 rounded-lg mr-3" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-textPrimary">{item.productName}</Text>
                    <Text className="text-xs text-textSecondary">{item.estimatedWeight}g</Text>
                  </View>
                  <Text className="text-sm font-medium text-emerald-600">{item.carbonSaved} kg CO₂</Text>
                </View>
              ))}
              <View className="pt-3 mt-2">
                <Text className="text-sm text-textSecondary text-center">
                  Total: {getScannedCartItems().reduce((sum, item) => sum + item.estimatedWeight, 0)}g | CO₂: {getScannedCartItems().reduce((sum, item) => sum + parseFloat(item.carbonSaved), 0).toFixed(2)} kg
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
