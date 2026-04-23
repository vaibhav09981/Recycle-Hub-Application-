import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useJournal, ScannedItem } from '@/context/JournalContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function JournalScreen() {
  const router = useRouter();
  const { scannedItems, removeScannedItem, toggleScannedCart, getTotalCarbonSaved, journalCount, scannedCartCount } = useJournal();
  const [selectedItem, setSelectedItem] = useState<ScannedItem | null>(null);

  const handleRemoveItem = (id: string, productName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Remove Item', `Remove "${productName}" from your journal?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', 
        style: 'destructive', 
        onPress: () => { 
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeScannedItem(id); 
          if (selectedItem?.id === id) setSelectedItem(null); 
        } 
      },
    ]);
  };

  const handleToggleCart = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleScannedCart(id);
  };

  const getRecyclableColor = (status: string) => {
    switch (status) {
      case 'fully': return '#059669';
      case 'partially': return '#D97706';
      case 'non': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getRecyclableText = (status: string) => {
    switch (status) {
      case 'fully': return 'Sustainable';
      case 'partially': return 'Mixed Waste';
      case 'non': return 'Landfill';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFCFB]" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-full bg-white shadow-sm items-center justify-center border border-slate-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-poppins-bold text-slate-900">Eco Journal</Text>
        <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center">
          <Ionicons name="journal" size={20} color="#059669" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 }}
      >
        {/* Impact Overview Section */}
        <View className="mb-10">
          <Text className="text-3xl font-poppins-black text-slate-900 mb-6">
            Your <Text className="text-emerald-600">Impact</Text>
          </Text>
          
          <View className="flex-row gap-4">
            <View className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-50 relative overflow-hidden">
               <View className="absolute -right-2 -bottom-2 opacity-10">
                <Ionicons name="cube" size={80} color="#10B981" />
              </View>
              <Text className="text-[10px] font-poppins-bold text-slate-400 uppercase tracking-widest mb-1">Items Scanned</Text>
              <Text className="text-4xl font-poppins-black text-slate-900">{journalCount}</Text>
              <View className="mt-2 flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-[10px] font-poppins-semibold text-emerald-600 uppercase">Live Tracker</Text>
              </View>
            </View>

            <View className="flex-1 bg-slate-900 p-6 rounded-[32px] shadow-sm relative overflow-hidden">
              <View className="absolute -right-2 -bottom-2 opacity-20">
                <Ionicons name="leaf" size={80} color="white" />
              </View>
              <Text className="text-[10px] font-poppins-bold text-slate-400 uppercase tracking-widest mb-1">CO₂ Saved</Text>
              <View className="flex-row items-baseline">
                <Text className="text-3xl font-poppins-black text-white">{getTotalCarbonSaved().toFixed(1)}</Text>
                <Text className="text-sm font-poppins-bold text-emerald-400 ml-1">kg</Text>
              </View>
              <View className="mt-2 flex-row items-center">
                <Ionicons name="trending-up" size={12} color="#10B981" />
                <Text className="text-[10px] font-poppins-semibold text-emerald-400 uppercase ml-1">Increasing</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Journal List Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-poppins-bold text-slate-900">History Log</Text>
            <View className="px-4 py-1.5 bg-slate-100 rounded-full">
              <Text className="text-[10px] font-poppins-bold text-slate-500 uppercase tracking-widest">Recent</Text>
            </View>
          </View>

          {scannedItems.length === 0 ? (
            <View className="bg-white rounded-[40px] p-12 items-center border border-dashed border-slate-200">
              <View className="w-24 h-24 bg-emerald-50 rounded-full items-center justify-center mb-6">
                <Ionicons name="camera-outline" size={40} color="#059669" />
              </View>
              <Text className="text-xl font-poppins-bold text-slate-900 mb-2">Start Your Journey</Text>
              <Text className="text-sm font-poppins text-slate-500 text-center mb-8 px-4 leading-5">
                Your eco-journal is empty. Scan an item to see its environmental impact!
              </Text>
              <TouchableOpacity 
                className="bg-emerald-600 px-10 py-5 rounded-full shadow-lg shadow-emerald-200" 
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/scan'); }}
              >
                <Text className="text-white font-poppins-bold">Analyze Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-5">
              {scannedItems.map((item) => (
                <View key={item.id}>
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    className={`bg-white rounded-[32px] p-4 shadow-sm border ${selectedItem?.id === item.id ? 'border-emerald-500' : 'border-slate-50'}`}
                    onPress={() => { Haptics.selectionAsync(); setSelectedItem(selectedItem?.id === item.id ? null : item); }}
                  >
                    <View className={`flex-row items-center ${item.isRecycled ? 'opacity-60' : ''}`}>
                      <View className="relative">
                        <Image source={{ uri: item.imageUrl }} className="w-20 h-20 rounded-[24px]" />
                        <View 
                          className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full items-center justify-center border-2 border-white"
                          style={{ backgroundColor: item.isRecycled ? '#059669' : getRecyclableColor(item.recyclability) }}
                        >
                          <Ionicons name={item.isRecycled ? 'checkmark-circle' : (item.recyclability === 'fully' ? 'leaf' : item.recyclability === 'partially' ? 'sync' : 'trash')} size={10} color="white" />
                        </View>
                      </View>
                      
                      <View className="flex-1 ml-5">
                        <Text className="text-lg font-poppins-bold text-slate-900 mb-1" numberOfLines={1}>{item.productName}</Text>
                        <View className="flex-row items-center">
                          {item.isRecycled ? (
                            <View className="bg-emerald-100 px-2 py-0.5 rounded-md mr-2">
                               <Text className="text-[9px] font-poppins-black text-emerald-700 uppercase">Recycled</Text>
                            </View>
                          ) : (
                            <>
                              <Text className="text-[11px] font-poppins-semibold text-slate-400 uppercase tracking-wider">{formatDate(item.scannedAt)}</Text>
                              <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
                            </>
                          )}
                          <Text className="text-[11px] font-poppins-bold text-emerald-600 uppercase tracking-wider">{item.category}</Text>
                        </View>
                      </View>

                      {!item.isRecycled && (
                        <TouchableOpacity
                          className={`w-12 h-12 rounded-full items-center justify-center ${item.inScannedCart ? 'bg-emerald-600' : 'bg-slate-50'}`}
                          onPress={() => handleToggleCart(item.id)}
                        >
                          <Ionicons
                            name={item.inScannedCart ? 'cart' : 'cart-outline'}
                            size={20}
                            color={item.inScannedCart ? 'white' : '#94A3B8'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Expandable Details Area */}
                    {selectedItem?.id === item.id && (
                      <View className="mt-6 pt-6 border-t border-slate-50">
                        <View className="flex-row justify-between mb-6">
                           <View className="items-center">
                            <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mb-2">
                              <Ionicons name="leaf" size={20} color="#059669" />
                            </View>
                            <Text className="text-lg font-poppins-black text-emerald-600">{item.carbonSaved}kg</Text>
                            <Text className="text-[9px] font-poppins-bold text-slate-400 uppercase">CO₂ Saved</Text>
                          </View>
                          
                          <View className="items-center">
                            <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-2">
                              <Ionicons name="water" size={20} color="#0284C7" />
                            </View>
                            <Text className="text-lg font-poppins-black text-blue-600">{item.waterSaved}L</Text>
                            <Text className="text-[9px] font-poppins-bold text-slate-400 uppercase">Water</Text>
                          </View>

                          <View className="items-center">
                            <View className="w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center mb-2">
                              <Ionicons name="flash" size={20} color="#D97706" />
                            </View>
                            <Text className="text-lg font-poppins-black text-amber-600">{item.energySaved}kWh</Text>
                            <Text className="text-[9px] font-poppins-bold text-slate-400 uppercase">Energy</Text>
                          </View>
                        </View>

                        <View className="bg-slate-50 rounded-3xl p-5 mb-6">
                          <Text className="text-[10px] font-poppins-bold text-slate-400 uppercase tracking-widest mb-2">Expert Advice</Text>
                          <Text className="text-sm font-poppins text-slate-600 leading-5 italic">"{item.recyclingTips}"</Text>
                        </View>

                        <View className="flex-row gap-3">
                          <TouchableOpacity 
                            className="flex-1 bg-slate-900 py-4 rounded-2xl items-center shadow-lg"
                            onPress={() => router.push('/track-carbon')}
                          >
                            <Text className="text-white font-poppins-bold text-sm">Full Stats</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            className="w-14 h-14 bg-red-50 rounded-2xl items-center justify-center border border-red-100"
                            onPress={() => handleRemoveItem(item.id, item.productName)}
                          >
                            <Ionicons name="trash-outline" size={20} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Global Action Footer */}
        <View className="bg-emerald-600 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
          <View className="absolute -right-10 -bottom-10 opacity-20">
            <Ionicons name="planet" size={200} color="white" />
          </View>
          <Text className="text-white font-poppins-black text-2xl mb-2">Rewards Hub</Text>
          <Text className="text-white/80 font-poppins text-sm mb-6">
            Add items to your <Text className="font-poppins-bold text-white">Pickup Cart</Text> to earn Green Credits. You have <Text className="font-poppins-bold text-white">{scannedCartCount} items</Text> ready for collection!
          </Text>
          <TouchableOpacity 
            className="bg-white py-4 px-8 rounded-full self-start shadow-xl shadow-emerald-900/20"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/schedule-pickup'); }}
          >
            <Text className="text-emerald-700 font-poppins-bold">Schedule Pickup</Text>
          </TouchableOpacity>
        </View>

        <View className="h-40" />
      </ScrollView>
    </SafeAreaView>
  );
}
