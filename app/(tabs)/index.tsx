import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Modal, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/AuthContext';
import { useCarbon } from '@/context/CarbonContext';
import { useCredits } from '@/context/CreditsContext';
import { findNearbyRecyclingCenters, RecyclingCenter } from '@/lib/scanService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalFootprint, totalSavings, carbonHistory } = useCarbon();
  const { greenCredits } = useCredits();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const userName = user?.name || user?.email?.split('@')[0] || 'Eco Hero';

  const currentDate = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }), []);

  const itemsRecycled = useMemo(
    () => carbonHistory.filter((entry) => entry.type === 'savings').length,
    [carbonHistory]
  );

  const handleScan = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/scan');
  }, [router]);

  const handleGetLocation = async () => {
    Haptics.selectionAsync();
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
      Alert.alert('Location Found', `Your location has been set to ${locationName || 'your current area'}.`, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please check your GPS settings.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleFindNearbyCenters = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      // Increased radius to 50km for better coverage
      const centers = await findNearbyRecyclingCenters(location.lat, location.lng, 50000);
      setRecyclingCenters(centers);
    } catch (error) {
      console.error('Find centers error:', error);
      Alert.alert('Error', 'Could not find recycling centers. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleOpenGoogleMapsSearch = useCallback(() => {
    Haptics.selectionAsync();
    const query = locationName ? `recycling centers in ${locationName}` : 'recycling centers near me';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    WebBrowser.openBrowserAsync(url);
  }, [locationName]);

  const handleSchedulePickup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCentersModal(false);
    router.push('/schedule-pickup');
  }, [router]);

  const handleCenterConnect = useCallback((center: RecyclingCenter, type: 'call' | 'whatsapp') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (!center.phone) {
      Alert.alert('Contact Missing', 'This center hasn\'t provided a phone number.');
      return;
    }

    const cleanPhone = center.phone.replace(/[^0-9+]/g, '');
    
    if (type === 'whatsapp') {
      const message = encodeURIComponent(`Hi ${center.name}, I found your recycling center on RecycleHub and have some materials for collection.`);
      const url = `https://wa.me/${cleanPhone}?text=${message}`;
      Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp is not installed on your device.'));
    } else {
      const url = `tel:${cleanPhone}`;
      Linking.openURL(url);
    }
  }, []);

  const centerKeyExtractor = useCallback(
    (item: RecyclingCenter) => item.placeId || item.name,
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View className='flex flex-row justify-between items-start py-4'>
          <View>
            <Text className="text-slate-500 font-poppins text-base font-medium">Welcome back,</Text>
            <Text className="text-4xl font-poppins-black text-slate-900 leading-tight">{userName}</Text>
            <Text className="text-xs text-slate-400 font-poppins mt-1 tracking-wide">{currentDate}</Text>
          </View>

          <TouchableOpacity 
            className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm border border-teal/20" 
            onPress={handleGetLocation} 
            activeOpacity={0.7}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#14B8A6" />
            ) : (
              <Ionicons name="location" size={22} color="#14B8A6" />
            )}
          </TouchableOpacity>
        </View>

        <View className="mb-8 mt-4 p-6 rounded-[28px] bg-white shadow-sm border border-slate-100">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-poppins-black text-slate-900 tracking-wide uppercase">Total Impact</Text>
            <View className="bg-earth/10 px-3 py-1 rounded-full border border-earth/20">
               <Text className="text-[10px] font-extrabold text-earth font-poppins uppercase tracking-wider">Eco Rank: Artisan</Text>
            </View>
          </View>
          
          <View className="flex-row gap-3">
            <View className="flex-1 items-center bg-teal/5 rounded-[20px] p-4 border border-teal/10">
              <View className="w-10 h-10 rounded-2xl bg-teal/10 items-center justify-center mb-2">
                <Ionicons name="leaf" size={20} color="#14B8A6" />
              </View>
              <Text className="text-2xl font-poppins-black text-teal">{totalSavings.toFixed(1)}</Text>
              <Text className="text-[9px] text-teal/70 font-bold font-poppins text-center tracking-tight">KG SAVED</Text>
            </View>
            
            <View className="flex-1 items-center bg-earth/5 rounded-[20px] p-4 border border-earth/20 shadow-sm shadow-earth/10">
              <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mb-2 shadow-sm">
                <Ionicons name="cash" size={20} color="#78350F" />
              </View>
              <Text className="text-2xl font-poppins-black text-earth">{greenCredits}</Text>
              <Text className="text-[9px] text-earth/70 font-bold font-poppins text-center tracking-tight">CREDITS (GC)</Text>
            </View>

            <View className="flex-1 items-center bg-slate-50/50 rounded-[20px] p-4 border border-slate-50">
              <View className="w-10 h-10 rounded-2xl bg-emerald-100 items-center justify-center mb-2">
                <Ionicons name="repeat" size={20} color="#059669" />
              </View>
              <Text className="text-2xl font-poppins-black text-slate-900">{itemsRecycled}</Text>
              <Text className="text-[9px] text-slate-500 font-bold font-poppins text-center tracking-tight">RECYCLED</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          className="mb-8 bg-emerald-600 rounded-[28px] p-6 shadow-xl shadow-emerald-900/20" 
          onPress={handleScan} 
          activeOpacity={0.9}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-3xl font-poppins-black text-white leading-tight">Ready to recycle?</Text>
              <Text className="text-base text-emerald-50 font-poppins mt-2">Scan any item to see its impact and how to handle it.</Text>
            </View>
            <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
              <Ionicons name="scan-outline" size={32} color="white" />
            </View>
          </View>
          
          <View className="bg-white/10 h-[1px] w-full mb-4" />
          
          <View className="flex-row items-center">
            <View className="flex-row -space-x-2 mr-3">
              {[1, 2, 3].map((i) => (
                <View key={i} className="w-6 h-6 rounded-full bg-teal/40 border-2 border-white/20 items-center justify-center">
                  <Ionicons name="person" size={10} color="white" />
                </View>
              ))}
            </View>
            <Text className="text-xs text-teal/10 font-medium font-poppins">Join 12k+ people recycling today</Text>
          </View>
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="text-2xl font-poppins-black text-slate-900 mb-6 tracking-wide">Explore Hub</Text>
          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity 
              className="w-[48%] bg-white rounded-[20px] p-5 shadow-sm border border-teal/10" 
              onPress={() => (router as any).push('/track-carbon')} 
              activeOpacity={0.9}
            >
              <View className="w-10 h-10 rounded-xl bg-teal/5 items-center justify-center mb-3">
                <Ionicons name="bar-chart" size={20} color="#14B8A6" />
              </View>
              <Text className="text-base font-poppins-bold text-slate-900">Track Carbon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-[48%] bg-white rounded-[20px] p-5 shadow-sm border border-earth/20" 
              onPress={() => router.push('/(tabs)/shop')} 
              activeOpacity={0.9}
            >
              <View className="w-10 h-10 rounded-xl bg-earth/5 items-center justify-center mb-3">
                <Ionicons name="cart" size={20} color="#78350F" />
              </View>
              <Text className="text-base font-poppins-bold text-earth">Eco Shop</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-full bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex-row items-center" 
              onPress={handleFindNearbyCenters} 
              activeOpacity={0.9}
            >
              <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center mr-4">
                <Ionicons name="map" size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-poppins-bold text-slate-900">Find Nearby Centers</Text>
                <Text className="text-[11px] text-slate-400 font-poppins">Locate the closest recycling points</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-40" />
      </ScrollView>

      <Modal visible={showCentersModal} animationType="slide" transparent onRequestClose={() => setShowCentersModal(false)}>
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white mt-24 rounded-t-3xl overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
              <View className="flex-row items-center gap-2">
                <Ionicons name="reload-circle" size={22} color="#059669" />
                <Text className="text-lg font-bold text-slate-900 font-poppins">Recycling Centres</Text>
              </View>
              <TouchableOpacity className="p-2" onPress={() => setShowCentersModal(false)}>
                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {locationName ? (
              <View className="flex-row items-center px-4 py-2 bg-emerald-50">
                <Ionicons name="location" size={14} color="#059669" />
                <Text className="text-xs font-bold text-emerald-700 ml-2 font-poppins">{locationName}</Text>
              </View>
            ) : null}

            {/* Global Connect Banner */}
            <TouchableOpacity 
              onPress={() => handleSchedulePickup()}
              className="mx-4 mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex-row items-center"
            >
              <View className="w-10 h-10 bg-emerald-600 rounded-xl items-center justify-center">
                <Ionicons name="chatbubbles" size={20} color="white" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-emerald-900 font-poppins">Can't reach a center?</Text>
                <Text className="text-[10px] text-emerald-600 font-medium font-poppins">Connect with our team for doorstep pickup</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#059669" />
            </TouchableOpacity>

            {isLoadingLocation ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="text-sm text-slate-400 mt-4 font-poppins italic">Searching for local points...</Text>
              </View>
            ) : recyclingCenters.length > 0 ? (
              <FlatList
                data={recyclingCenters}
                keyExtractor={centerKeyExtractor}
                removeClippedSubviews
                maxToRenderPerBatch={8}
                renderItem={({ item }) => (
                  <View className="bg-white rounded-2xl p-5 mx-4 my-2 border border-slate-100 shadow-sm">
                    <TouchableOpacity 
                      className="flex-row justify-between items-start mb-4"
                      onPress={() => WebBrowser.openBrowserAsync(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}&query_place_id=${item.placeId}`)}
                    >
                      <View className="flex-1 pr-4">
                        <Text className="text-base font-bold text-slate-900 font-poppins">{item.name}</Text>
                        <Text className="text-xs text-slate-500 mt-1 font-poppins leading-4">{item.address}</Text>
                        <Text className="text-[10px] text-slate-400 mt-1 font-poppins">{item.distance || 'Nearby'}</Text>
                      </View>
                      <View className="bg-emerald-50 px-2 py-1 rounded-lg flex-row items-center">
                        <Ionicons name="star" size={12} color="#10B981" />
                        <Text className="text-[10px] font-bold text-emerald-700 ml-1">{item.rating.toFixed(1)}</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Connection Options */}
                    <View className="flex-row border-t border-slate-50 pt-4 gap-2">
                      <TouchableOpacity 
                        onPress={() => handleCenterConnect(item, 'whatsapp')}
                        className="flex-1 bg-emerald-50 border border-emerald-100 flex-row items-center justify-center py-2 rounded-xl"
                      >
                        <Ionicons name="logo-whatsapp" size={14} color="#059669" />
                        <Text className="text-[10px] font-bold text-emerald-700 ml-1.5 font-poppins">WhatsApp</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => handleCenterConnect(item, 'call')}
                        className="flex-1 bg-blue-50 border border-blue-100 flex-row items-center justify-center py-2 rounded-xl"
                      >
                        <Ionicons name="call" size={14} color="#2563EB" />
                        <Text className="text-[10px] font-bold text-blue-700 ml-1.5 font-poppins">Call Center</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => WebBrowser.openBrowserAsync(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}&query_place_id=${item.placeId}`)}
                        className="flex-1 bg-slate-50 border border-slate-100 flex-row items-center justify-center py-2 rounded-xl"
                      >
                        <Ionicons name="navigate-outline" size={14} color="#64748B" />
                        <Text className="text-[10px] font-bold text-slate-600 ml-1.5 font-poppins">Maps</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingVertical: 12 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center py-10 px-10">
                <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="search-outline" size={32} color="#CBD5E1" />
                </View>
                <Text className="text-lg font-bold text-slate-900 font-poppins text-center">No results in your area</Text>
                <Text className="text-sm text-slate-400 mt-2 font-poppins text-center mb-6 px-4">We expanded the search to 50km but couldn't find points. Try doorstep pickup!</Text>
                
                <TouchableOpacity 
                  onPress={() => handleSchedulePickup()}
                  className="w-full bg-amber-500 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-amber-200 mb-4"
                >
                  <Ionicons name="car" size={20} color="white" />
                  <Text className="text-base font-bold text-white ml-3 font-poppins">Schedule Doorstep Pickup</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="w-full bg-emerald-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-200"
                  onPress={handleOpenGoogleMapsSearch}
                >
                  <Ionicons name="logo-google" size={20} color="white" />
                  <Text className="text-base font-bold text-white ml-3 font-poppins">Search on Google Maps</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
