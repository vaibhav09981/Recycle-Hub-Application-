import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '@/context/AuthContext';
import { useCarbon } from '@/context/CarbonContext';
import { findNearbyRecyclingCenters, RecyclingCenter } from '@/lib/scanService';

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

  const userName = user?.name || user?.email?.split('@')[0] || 'Eco Hero';
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const itemsRecycled = carbonHistory.filter((entry) => entry.type === 'savings').length;

  const handleScan = () => router.push('/scan');

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
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const city = address.city || address.subregion || address.region || 'Unknown';
        setLocationName(city);
      }
      setUserLocation({ lat: latitude, lng: longitude });
      Alert.alert('📍 Location Found', 'Your location has been set. Tap "Nearby Recycling Centres" to find centers in your area.', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please check your GPS settings.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

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
        const [address] = await Location.reverseGeocodeAsync({ latitude: coords.coords.latitude, longitude: coords.coords.longitude });
        if (address) {
          const city = address.city || address.subregion || address.region || 'Your Area';
          setLocationName(city);
        }
      }
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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View className="mb-4">
          <Text className="text-sm text-textSecondary font-poppins mb-1">Good Morning</Text>
          <Text className="text-3xl font-bold text-textPrimary font-poppins">{userName}</Text>
          <Text className="text-sm text-textSecondary font-poppins mt-1">{currentDate}</Text>
        </View>

        {/* Search & Location */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 flex-row items-center bg-card rounded-xl px-4 py-3 border border-border">
            <Text className="text-lg mr-3">🔍</Text>
            <TextInput
              className="flex-1 text-base text-textPrimary font-poppins"
              placeholder="Search items..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="w-12 h-12 rounded-xl bg-card items-center justify-content-center ml-3 border border-border" onPress={handleGetLocation} activeOpacity={0.7}>
            {isLoadingLocation ? <ActivityIndicator size="small" color="#10B981" /> : <Text className="text-xl">📍</Text>}
          </TouchableOpacity>
        </View>

        {/* Impact Stats */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-textPrimary font-poppins mb-3">Your Impact</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card rounded-2xl p-3 items-center shadow-sm">
              <View className="w-12 h-12 rounded-xl bg-primaryLight items-center justify-center mb-2"><Text className="text-xl">🌍</Text></View>
              <Text className="text-xl font-bold text-primary font-poppins">{totalSavings.toFixed(1)} kg</Text>
              <Text className="text-xs text-textSecondary font-poppins">CO₂ Saved</Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-3 items-center shadow-sm">
              <View className="w-12 h-12 rounded-xl bg-amber-100 items-center justify-center mb-2"><Text className="text-xl">🏭</Text></View>
              <Text className="text-xl font-bold text-warning font-poppins">{totalFootprint.toFixed(1)} kg</Text>
              <Text className="text-xs text-textSecondary font-poppins">Carbon Footprint</Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-3 items-center shadow-sm">
              <View className="w-12 h-12 rounded-xl bg-primaryLight items-center justify-center mb-2"><Text className="text-xl">♻️</Text></View>
              <Text className="text-xl font-bold text-primary font-poppins">{itemsRecycled}</Text>
              <Text className="text-xs text-textSecondary font-poppins">Items Recycled</Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-3 items-center shadow-sm">
              <View className="w-12 h-12 rounded-xl bg-amber-100 items-center justify-center mb-2"><Text className="text-xl">⭐</Text></View>
              <Text className="text-xl font-bold text-warning font-poppins">{Math.round(totalSavings * 10)}</Text>
              <Text className="text-xs text-textSecondary font-poppins">Green Points</Text>
            </View>
          </View>
        </View>

        {/* AI Scanner Card */}
        <View className="mb-6">
          <View className="bg-white rounded-2xl p-4 border border-primary">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-lg bg-primaryLight items-center justify-center mr-3">
                <Text className="text-xl">🤖</Text>
              </View>
              <View>
                <Text className="text-lg font-semibold text-textPrimary font-poppins">AI Scanner</Text>
                <Text className="text-xs text-textSecondary font-poppins">Powered by Gemini Vision</Text>
              </View>
            </View>

            <TouchableOpacity className="aspect-[1.6] border-2 border-dashed border-primary rounded-xl bg-primaryLight items-center justify-center mb-4" onPress={handleScan} activeOpacity={0.9}>
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
                  <Text className="text-3xl">📷</Text>
                </View>
                <Text className="text-base font-semibold text-primary font-poppins mb-1">Tap to Scan</Text>
                <Text className="text-xs text-textSecondary font-poppins text-center px-8">Identify recyclability, carbon savings and get action options</Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 bg-subtleBg rounded-xl py-3 items-center" onPress={() => router.push('/(tabs)/shop')} activeOpacity={0.7}>
                <Text className="text-xl mb-1">🛍️</Text>
                <Text className="text-xs font-medium text-textSecondary font-poppins">Eco Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-subtleBg rounded-xl py-3 items-center" onPress={() => router.push('/(tabs)/cart')} activeOpacity={0.7}>
                <Text className="text-xl mb-1">🛒</Text>
                <Text className="text-xs font-medium text-textSecondary font-poppins">My Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-subtleBg rounded-xl py-3 items-center" onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.7}>
                <Text className="text-xl mb-1">📊</Text>
                <Text className="text-xs font-medium text-textSecondary font-poppins">My Impact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-textPrimary font-poppins mb-3">Quick Access</Text>
          <View className="gap-3">
            <TouchableOpacity className="flex-row items-center bg-card rounded-xl p-4 shadow-sm" onPress={() => (router as any).push('/track-carbon')} activeOpacity={0.9}>
              <Text className="text-xl mr-3">📊</Text>
              <Text className="text-sm font-medium text-textPrimary font-poppins">Track Carbon</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-card rounded-xl p-4 shadow-sm" onPress={() => router.push('/(tabs)/shop')} activeOpacity={0.9}>
              <Text className="text-xl mr-3">🛍️</Text>
              <Text className="text-sm font-medium text-textPrimary font-poppins">Shop Eco-friendly</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-card rounded-xl p-4 shadow-sm" onPress={handleFindNearbyCenters} activeOpacity={0.9}>
              <Text className="text-xl mr-3">♻️</Text>
              <Text className="text-sm font-medium text-textPrimary font-poppins">Nearby Recycling Centres</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Recycling Centers Modal */}
      <Modal visible={showCentersModal} animationType="slide" transparent onRequestClose={() => setShowCentersModal(false)}>
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white mt-24 rounded-t-3xl overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Text className="text-lg font-semibold text-textPrimary font-poppins">♻️ Recycling Centres</Text>
              <TouchableOpacity className="p-2" onPress={() => setShowCentersModal(false)}>
                <Text className="text-xl text-textSecondary">✕</Text>
              </TouchableOpacity>
            </View>

            {locationName ? <Text className="px-4 py-2 text-sm text-textSecondary">📍 {locationName}</Text> : null}

            {isLoadingLocation ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="text-sm text-textSecondary mt-3 font-poppins">Finding recycling centres...</Text>
              </View>
            ) : recyclingCenters.length > 0 ? (
              <FlatList
                data={recyclingCenters}
                keyExtractor={(item) => item.placeId || Math.random().toString()}
                renderItem={({ item }) => (
                  <View className="bg-card rounded-xl p-4 mx-4 my-2 shadow-sm">
                    <Text className="text-base font-semibold text-textPrimary font-poppins">{item.name}</Text>
                    <Text className="text-sm text-textSecondary mt-1 font-poppins">{item.address}</Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-sm font-medium">⭐ {item.rating.toFixed(1)}</Text>
                      <Text className="text-sm text-textTertiary ml-1">({item.totalRatings})</Text>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingVertical: 12 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-4xl mb-4">🔍</Text>
                <Text className="text-lg font-medium text-textPrimary font-poppins">No centres found</Text>
                <Text className="text-sm text-textSecondary mt-2 font-poppins">Try enabling location access</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
