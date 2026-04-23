import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { useJournal } from '@/context/JournalContext';
import { useCredits } from '@/context/CreditsContext';
import {
  uploadToCloudinary,
  analyzeProductWithGemini,
  calculateCarbonData,
  findNearbyRecyclingCenters,
  pickImage,
  takePhoto,
  ScanResult,
  RecyclingCenter,
} from '@/lib/scanService';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Animated Scanning View Component
function ScanningAnimation() {
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return (
    <View className="items-center justify-center py-10">
      <View className="w-full h-[320px] relative overflow-hidden rounded-[40px] bg-slate-900 shadow-2xl border border-white/10">
        {/* Futuristic Grid Overlay */}
        <View className="absolute inset-0 opacity-10">
           {[...Array(15)].map((_, i) => (
             <View key={i} className="absolute w-full h-[1px] bg-emerald-500" style={{ top: i * 22 }} />
           ))}
           {[...Array(15)].map((_, i) => (
             <View key={i} className="absolute h-full w-[1px] bg-emerald-500" style={{ left: i * (width/15) }} />
           ))}
        </View>

        <Animated.View
          className="w-full h-10 absolute z-10 flex-row items-center justify-center"
          style={{ transform: [{ translateY }] }}
        >
          <View className="w-full h-full bg-emerald-500/20" />
          <View className="absolute w-full h-[3px] bg-emerald-400 shadow-xl shadow-emerald-400" />
        </Animated.View>

        {/* Circular Scanning Rings */}
        <View className="absolute inset-0 items-center justify-center">
           <View className="w-48 h-48 rounded-full border border-emerald-500/10" />
           <View className="absolute w-32 h-32 rounded-full border border-emerald-500/20" />
           <View className="absolute w-16 h-16 rounded-full border border-emerald-500/30" />
        </View>
        
        <View className="flex-1 items-center justify-center">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons name="scan" size={60} color="#34D399" style={{ opacity: 0.8 }} />
          </Animated.View>
        </View>
      </View>

      <View className="mt-8 items-center">
        <View className="bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
          <Text className="text-emerald-500 text-[9px] font-black uppercase tracking-[4px]">Neural Processing</Text>
        </View>
        <Text className="text-slate-900 text-xl font-bold font-poppins">Analyzing Composition</Text>
        <View className="flex-row items-center mt-3">
           <ActivityIndicator size="small" color="#10B981" />
           <Text className="text-slate-400 text-xs ml-3 font-poppins">Gemini AI Engine v4.0 Active</Text>
        </View>
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const router = useRouter();
  const { addScannedItem } = useJournal();
  const { addCredits } = useCredits();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualData, setManualData] = useState({ name: '', material: '', category: 'Electronics' });
  const [demoSearch, setDemoSearch] = useState('');
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Hardcoded Demo Data
  const DEMO_CATEGORIES = [
    {
      title: 'E-Waste (Daily Tech)',
      items: [
        { id: 'laptop', name: 'Laptop', material: 'Lithium, Aluminum, Plastics', recyclable: true, carbon: '25.5', credits: 2500, tips: 'Remove battery separately. Wipe data before recycling at specialized e-waste centers.' },
        { id: 'smartphone', name: 'Mobile Phone', material: 'Rare Earth Metals, Cobalt, Glass', recyclable: true, carbon: '12.2', credits: 1200, tips: 'Many retail stores have drop-off bins. Valuable metals can be recovered.' },
        { id: 'gpu', name: 'Graphic Card / GPU', material: 'Silicon, Copper, Gold Plating', recyclable: true, carbon: '8.4', credits: 850, tips: 'Contains high-value gold and copper. Do not dispose in regular trash.' },
        { id: 'cpu', name: 'CPU Processor', material: 'Silicon, Gold, Ceramic', recyclable: true, carbon: '4.1', credits: 400, tips: 'Tiny but high value. Collect with other computer components.' },
        { id: 'tablet', name: 'Tablet', material: 'Glass, Lithium-Ion, Aluminum', recyclable: true, carbon: '15.0', credits: 1500, tips: 'Cracked screens are okay for recycling; internal components are still valuable.' },
        { id: 'battery', name: 'Lithium Battery', material: 'Lithium, Nickel, Manganese', recyclable: true, carbon: '5.5', credits: 550, tips: 'EXTREMELY HAZARDOUS. Never put in trash. Must go to a battery collection point.' },
      ]
    },
    {
      title: 'Home Appliances',
      items: [
        { id: 'plastic_bottle', name: 'Plastic Water Bottle', material: 'PET / Grade 1 Plastic', recyclable: true, carbon: '0.5', credits: 50, tips: 'Crush to save space. Caps should be left on or recycled separately based on local rules.' },
        { id: 'steel_bottle', name: 'Steel Water Bottle', material: 'Stainless Steel', recyclable: true, carbon: '2.1', credits: 210, tips: 'Steel is infinitely recyclable. Remove any plastic or rubber seals first.' },
        { id: 'microwave', name: 'Microwave Oven', material: 'Steel, Glass, Magnetron', recyclable: true, carbon: '35.0', credits: 3500, tips: 'Bulky item. Most local municipalities offer "White Goods" collection services.' },
        { id: 'toaster', name: 'Toaster', material: 'Nichrome, Steel, Plastic', recyclable: true, carbon: '3.2', credits: 320, tips: 'Clean out crumbs first! Mostly metal, which is easy to scrap.' },
        { id: 'lightbulb', name: 'LED Lightbulb', material: 'Circuit Board, Plastic, Metal', recyclable: true, carbon: '0.8', credits: 80, tips: 'Do not mix with glass bottle recycling. Requires specialized processing.' },
      ]
    }
  ];

  useEffect(() => {
    if (scanResult) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [scanResult]);

  const handlePickImage = useCallback(async () => {
    Haptics.selectionAsync();
    const imageUri = await pickImage();
    if (imageUri) {
      setSelectedImage(imageUri);
      startSimulatedScan(imageUri);
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    Haptics.selectionAsync();
    const imageUri = await takePhoto();
    if (imageUri) {
      setSelectedImage(imageUri);
      startSimulatedScan(imageUri);
    }
  }, []);

  const startSimulatedScan = async (imageUri: string) => {
    setIsAnalyzing(true);
    setScanResult(null);
    setIsSaved(false);
    setShowErrorModal(false);
    setIsDemoMode(false);
    setIsManualMode(false);

    // Simulated random delay between 7-13 seconds
    const delay = Math.floor(Math.random() * (13000 - 7000 + 1) + 7000);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowErrorModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, delay);
  };

  const handleDemoModeSelection = (item: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const result: ScanResult = {
      productName: item.name,
      materials: item.material.split(', '),
      brand: 'Demo Unit',
      recyclability: item.recyclable ? 'fully' : 'non',
      estimatedWeight: Math.round(parseFloat(item.carbon) * 500),
      category: item.id.includes('laptop') || item.id.includes('phone') ? 'Electronics' : 'Household',
      recyclingTips: item.tips,
      carbonEmitted: '0.0',
      carbonSaved: `-${item.carbon}`,
      savingsPercent: '100%',
      waterSaved: (parseFloat(item.carbon) * 15).toFixed(1),
      energySaved: (parseFloat(item.carbon) * 5).toFixed(1),
      imageUrl: selectedImage || '',
    };

    setScanResult(result);
    setIsDemoMode(false);
    setIsManualMode(false);
    setShowErrorModal(false);
  };

  const handleManualSubmit = () => {
    if (!manualData.name || !manualData.material) {
      Alert.alert('Details Required', 'Please fill in the product name and materials.');
      return;
    }

    const demoItem = {
      id: 'manual',
      name: manualData.name,
      material: manualData.material,
      recyclable: true,
      carbon: '4.5',
      credits: 450,
      tips: 'Thank you for manually specifying! Please check local guidelines for specialized disposal of this material.'
    };
    handleDemoModeSelection(demoItem);
  };

  const handleDemoMode = () => {
    setShowErrorModal(false);
    setIsDemoMode(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const analyzeImage = async (imageUri: string) => {
    // Original analysis logic (kept for reference/future use)
    setIsAnalyzing(true);
    setScanResult(null);
    setIsSaved(false);

    try {
      const cloudinaryResponse = await uploadToCloudinary(imageUri);
      const imageUrl = cloudinaryResponse.url;
      const aiResult = await analyzeProductWithGemini(imageUri);
      const weightKg = aiResult.estimatedWeight / 1000;
      const carbonData = calculateCarbonData(aiResult.category, weightKg);

      const result: ScanResult = {
        ...aiResult,
        carbonEmitted: carbonData.carbonEmitted,
        carbonSaved: carbonData.carbonSaved,
        savingsPercent: carbonData.savingsPercent,
        waterSaved: carbonData.waterSaved,
        energySaved: carbonData.energySaved,
        imageUrl,
      };

      setScanResult(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Failed', error.message || 'Could not analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecycle = () => {
    if (scanResult) {
      const carbonSavedKg = Math.abs(parseFloat(scanResult.carbonSaved));
      const creditsToEarn = carbonSavedKg * 1000;

      addScannedItem({
        productName: scanResult.productName,
        materials: scanResult.materials,
        brand: scanResult.brand,
        recyclability: scanResult.recyclability,
        estimatedWeight: scanResult.estimatedWeight,
        category: scanResult.category,
        recyclingTips: scanResult.recyclingTips,
        carbonEmitted: scanResult.carbonEmitted,
        carbonSaved: scanResult.carbonSaved,
        savingsPercent: scanResult.savingsPercent,
        waterSaved: scanResult.waterSaved,
        energySaved: scanResult.energySaved,
        imageUrl: scanResult.imageUrl,
      });

      setIsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fully': return '#10B981';
      case 'partially': return '#F59E0B';
      case 'non': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const handleBackAction = () => {
    Haptics.selectionAsync();
    if (scanResult) {
      setScanResult(null);
      if (isManualMode) {
        // Stay in manual mode selection
      } else {
        setIsDemoMode(true);
      }
    } else if (isManualMode) {
      setIsManualMode(false);
      setIsDemoMode(true);
    } else if (isDemoMode) {
      setIsDemoMode(false);
      setShowErrorModal(true);
    } else if (selectedImage) {
      setSelectedImage(null);
      setIsAnalyzing(false);
    } else {
      router.back();
    }
  };

  const resetScan = useCallback(() => {
    Haptics.selectionAsync();
    setSelectedImage(null);
    setScanResult(null);
    setIsSaved(false);
    setShowErrorModal(false);
    setIsDemoMode(false);
    setIsManualMode(false);
    slideAnim.setValue(50);
    opacityAnim.setValue(0);
  }, []);

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Sophisticated Compact Header */}
      <View className="pt-14 pb-4 px-6 flex-row items-center justify-between bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={handleBackAction} 
          className="p-2 rounded-xl bg-slate-100"
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-[5px] mb-0.5">Analyzer</Text>
          <Text className="text-base font-bold text-slate-900 font-poppins">
            {isDemoMode ? 'Demo Catalog' : isManualMode ? 'Object Details' : 'Environmental Impact'}
          </Text>
        </View>

        {selectedImage ? (
          <TouchableOpacity 
            onPress={resetScan}
            className="p-2 rounded-xl bg-emerald-50"
          >
            <Ionicons name="refresh" size={18} color="#10B981" />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center">
             <Ionicons name="shield-checkmark" size={16} color="#94A3B8" />
          </View>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
      >
        {/* Selection State */}
        {!selectedImage && (
          <View className="items-center">
            <View className="w-full h-72 relative rounded-[32px] overflow-hidden mb-8 shadow-sm">
              <View className="absolute inset-0 bg-slate-900" />
              <View className="absolute inset-0 opacity-20">
                 {[...Array(10)].map((_, i) => (
                   <View key={i} className="absolute w-full h-[1px] bg-white" style={{ top: i * 30 }} />
                 ))}
              </View>
              <View className="flex-1 items-center justify-center">
                <View className="w-20 h-20 rounded-3xl bg-white/10 items-center justify-center border border-white/20 backdrop-blur-lg">
                  <Ionicons name="camera" size={32} color="white" />
                </View>
                <Text className="text-white text-2xl font-black mt-6 tracking-tight">AI VISION ENGINE</Text>
                <Text className="text-white/50 text-[10px] font-poppins mt-1 uppercase tracking-widest">Awaiting Input Signal...</Text>
              </View>
            </View>
            
            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                className="flex-1 bg-emerald-600 h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-200"
                onPress={handleTakePhoto}
                activeOpacity={0.9}
              >
                <Ionicons name="camera-outline" size={20} color="white" />
                <Text className="text-sm font-bold text-white ml-2 font-poppins">Capture</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-white h-16 rounded-2xl flex-row items-center justify-center shadow-sm border border-slate-200"
                onPress={handlePickImage}
                activeOpacity={0.9}
              >
                <Ionicons name="images-outline" size={20} color="#1E293B" />
                <Text className="text-sm font-bold text-slate-900 ml-2 font-poppins">Lab Gallery</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-8 w-full p-5 bg-white rounded-2xl border border-slate-100 flex-row items-start">
               <View className="w-8 h-8 rounded-lg bg-amber-50 items-center justify-center">
                  <Ionicons name="information-circle" size={18} color="#D97706" />
               </View>
               <View className="ml-4 flex-1">
                  <Text className="text-slate-900 font-bold text-sm">How it works</Text>
                  <Text className="text-slate-400 text-xs mt-1 font-poppins leading-5">Our AI identifies the material, estimates weight, and calculates your personal CO₂ savings in real-time.</Text>
               </View>
            </View>
          </View>
        )}

        {/* Demo Mode Selection UI */}
        {isDemoMode && selectedImage && !scanResult && (
          <View className="pb-10">
             {/* Preview at top as requested */}
             <View className="w-full h-48 rounded-3xl overflow-hidden mb-8 border-4 border-white shadow-lg">
                <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                   <View className="bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md">
                      <Text className="text-white font-bold text-xs">Awaiting Classification</Text>
                   </View>
                </View>
             </View>

             <TouchableOpacity 
               onPress={() => {
                 setIsDemoMode(false);
                 setIsManualMode(true);
               }}
               className="w-full bg-slate-900 p-6 rounded-3xl mb-8 flex-row items-center justify-between shadow-xl"
             >
                <View className="flex-row items-center">
                   <View className="w-10 h-10 bg-emerald-500 rounded-xl items-center justify-center mr-4">
                      <Ionicons name="create" size={20} color="white" />
                   </View>
                   <View>
                      <Text className="text-white font-bold text-base">Manual Specification</Text>
                      <Text className="text-white/50 text-xs font-poppins">Type details for a custom demo</Text>
                   </View>
                </View>
                <Ionicons name="arrow-forward" size={20} color="white" />
             </TouchableOpacity>

             <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[4px] mb-4">Select from catalog</Text>
             
             {DEMO_CATEGORIES.map((cat, idx) => (
               <View key={idx} className="mb-6">
                  <Text className="text-slate-900 font-bold text-lg mb-4">{cat.title}</Text>
                  <View className="space-y-3">
                     {cat.items.map((item) => (
                       <TouchableOpacity
                         key={item.id}
                         onPress={() => handleDemoModeSelection(item)}
                         className="bg-white p-5 rounded-2xl border border-slate-100 flex-row items-center justify-between shadow-sm"
                       >
                          <View>
                             <Text className="text-slate-900 font-bold">{item.name}</Text>
                             <Text className="text-slate-400 text-xs mt-1 font-poppins">{item.material}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                       </TouchableOpacity>
                     ))}
                  </View>
               </View>
             ))}
          </View>
        )}

        {/* Manual Input Mode */}
        {isManualMode && selectedImage && !scanResult && (
          <View className="pb-10">
             <View className="w-full h-40 rounded-3xl overflow-hidden mb-8 border-4 border-white shadow-lg">
                <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
             </View>

             <View className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <Text className="text-2xl font-black text-slate-900 mb-2">Item Details</Text>
                <Text className="text-slate-400 text-xs font-poppins mb-8">Please provide the object specifications for manual cloud analysis.</Text>

                <View className="space-y-6">
                   <View>
                      <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-2 ml-1">Object Name</Text>
                      <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row items-center">
                         <Ionicons name="cube-outline" size={18} color="#94A3B8" className="mr-3" />
                         <TextInput 
                           placeholder="e.g. Broken Laptop Display"
                           value={manualData.name}
                           onChangeText={(t) => setManualData({...manualData, name: t})}
                           className="flex-1 text-slate-900 font-bold"
                         />
                      </View>
                   </View>

                   <View>
                      <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-2 ml-1">Main Materials</Text>
                      <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row items-center">
                         <Ionicons name="layers-outline" size={18} color="#94A3B8" className="mr-3" />
                         <TextInput 
                           placeholder="e.g. Glass, Liquid Crystal, Plastic"
                           value={manualData.material}
                           onChangeText={(t) => setManualData({...manualData, material: t})}
                           className="flex-1 text-slate-900 font-bold"
                         />
                      </View>
                   </View>

                   <TouchableOpacity 
                     onPress={handleManualSubmit}
                     className="w-full h-16 bg-emerald-600 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200 mt-4"
                   >
                      <Text className="text-white font-bold text-lg font-poppins">Analyze Specifications</Text>
                   </TouchableOpacity>
                </View>
             </View>
          </View>
        )}

        {/* Analyzing Animation */}
        {selectedImage && !scanResult && isAnalyzing && (
          <ScanningAnimation />
        )}

        {/* Results View */}
        {scanResult && (
          <Animated.View 
            className="pb-20"
            style={{ 
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim
            }}
          >
            {/* Minimalist Image View */}
            <View className="w-full h-64 rounded-3xl overflow-hidden mb-6 border-4 border-white shadow-lg">
              <Image source={{ uri: scanResult.imageUrl }} className="w-full h-full" resizeMode="cover" />
              <View className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-md">
                 <Text className="text-[9px] font-black text-white uppercase tracking-widest">{scanResult.category}</Text>
              </View>
              {/* Recyclability Header for Demo Mode Popup feel */}
              <View className={`absolute bottom-0 left-0 right-0 py-3 items-center ${scanResult.recyclability === 'fully' ? 'bg-emerald-500/90' : 'bg-red-500/90'}`}>
                 <Text className="text-white font-black text-xs uppercase tracking-[2px]">
                   {scanResult.recyclability === 'fully' ? '✓ Yay! It is Recyclable' : '✕ Not Curbside Recyclable'}
                 </Text>
              </View>
            </View>

            {/* Core Info Chip Grid */}
            <View className="flex-row flex-wrap gap-2 mb-6">
               <View className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex-row items-center">
                  <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getStatusColor(scanResult.recyclability) }} />
                  <Text className="text-slate-900 font-bold text-xs capitalize">{scanResult.recyclability} Recyclable</Text>
               </View>
               <View className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex-row items-center">
                  <Ionicons name="cube-outline" size={14} color="#64748B" className="mr-2" />
                  <Text className="text-slate-900 font-bold text-xs">{scanResult.estimatedWeight}g Est.</Text>
               </View>
               {scanResult.brand && (
                 <View className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex-row items-center">
                    <Ionicons name="pricetag-outline" size={14} color="#64748B" className="mr-2" />
                    <Text className="text-slate-900 font-bold text-xs">{scanResult.brand}</Text>
                 </View>
               )}
            </View>

            <Text className="text-2xl font-black text-slate-900 tracking-tight mb-6">{scanResult.productName}</Text>

            {/* Impact Grid (Compact Cards) */}
            <View className="flex-row flex-wrap justify-between mb-8">
               <View className="w-[48%] bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                     <View className="p-2 bg-emerald-600 rounded-lg">
                        <Ionicons name="leaf" size={14} color="white" />
                     </View>
                     <Text className="text-emerald-600 font-black text-[9px] uppercase tracking-widest">Saved</Text>
                  </View>
                  <Text className="text-emerald-900 text-xl font-black">{-scanResult.carbonSaved}kg</Text>
                  <Text className="text-emerald-600 text-[10px] font-poppins mt-1">Carbon Neutralized</Text>
               </View>

               <View className="w-[48%] bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                     <View className="p-2 bg-amber-500 rounded-lg">
                        <Ionicons name="sparkles" size={14} color="white" />
                     </View>
                     <Text className="text-amber-600 font-black text-[9px] uppercase tracking-widest">Earned</Text>
                  </View>
                  <Text className="text-amber-900 text-xl font-black">+{Math.round(Math.abs(parseFloat(scanResult.carbonSaved)) * 1000)}</Text>
                  <Text className="text-amber-600 text-[10px] font-poppins mt-1">Green Credits</Text>
               </View>

               <View className="w-[48%] bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <View className="flex-row justify-between items-center mb-3">
                     <View className="p-2 bg-blue-600 rounded-lg">
                        <Ionicons name="water" size={14} color="white" />
                     </View>
                     <Text className="text-blue-600 font-black text-[9px] uppercase tracking-widest">Water</Text>
                  </View>
                  <Text className="text-blue-900 text-xl font-black">{scanResult.waterSaved}L</Text>
                  <Text className="text-blue-600 text-[10px] font-poppins mt-1">Resource Offset</Text>
               </View>

               <View className="w-[48%] bg-slate-100 rounded-2xl p-4 border border-slate-200">
                  <View className="flex-row justify-between items-center mb-3">
                     <View className="p-2 bg-slate-900 rounded-lg">
                        <Ionicons name="flash" size={14} color="white" />
                     </View>
                     <Text className="text-slate-500 font-black text-[9px] uppercase tracking-widest">Energy</Text>
                  </View>
                  <Text className="text-slate-900 text-xl font-black">{scanResult.energySaved}kW</Text>
                  <Text className="text-slate-500 text-[10px] font-poppins mt-1">Power Saved</Text>
               </View>
            </View>

            {/* Technical Composition */}
            <View className="mb-8">
               <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-4">Detected Composition</Text>
               <View className="flex-row flex-wrap">
                  {scanResult.materials.map((m, i) => (
                    <View key={i} className="bg-slate-900 px-4 py-2 rounded-lg mr-2 mb-2">
                       <Text className="text-white text-[10px] font-bold font-poppins uppercase tracking-tighter">{m}</Text>
                    </View>
                  ))}
               </View>
            </View>

            {/* Expert Insight Box */}
            <View className="bg-white rounded-3xl p-6 border border-slate-100 mb-8 shadow-sm">
               <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-emerald-50 rounded-full items-center justify-center">
                     <Ionicons name="bulb-outline" size={16} color="#10B981" />
                  </View>
                  <Text className="text-slate-900 font-bold text-sm ml-3">Disposal Protocol</Text>
               </View>
               <Text className="text-slate-500 text-sm leading-6 font-poppins">{scanResult.recyclingTips}</Text>
            </View>

            {/* Action Chip Bar (Replacing big buttons) */}
            <View className="flex-row gap-3">
               <TouchableOpacity
                 className={`flex-1 h-14 rounded-2xl flex-row items-center justify-center shadow-lg ${isSaved ? 'bg-slate-200' : 'bg-emerald-600'}`}
                 onPress={handleRecycle}
                 disabled={isSaved}
               >
                 <Ionicons name={isSaved ? "checkmark" : "add"} size={20} color={isSaved ? "#64748B" : "white"} />
                 <Text className={`text-sm font-bold ml-2 font-poppins ${isSaved ? 'text-slate-500' : 'text-white'}`}>
                   {isSaved ? "Impact Logged" : "Log Impact"}
                 </Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 onPress={() => router.push('/(tabs)')}
                 className="w-14 h-14 bg-white rounded-2xl items-center justify-center border border-slate-200"
               >
                 <Ionicons name="home-outline" size={20} color="#1E293B" />
               </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        
        <View className="h-10" />
      </ScrollView>

      {/* Signal Strength Error Modal */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
           <View className="bg-white w-full rounded-[32px] p-8 items-center shadow-2xl">
              <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center mb-6">
                 <Ionicons name="wifi-outline" size={40} color="#D97706" />
                 <View className="absolute top-0 right-0 w-6 h-6 bg-amber-500 rounded-full items-center justify-center border-2 border-white">
                    <Ionicons name="alert" size={14} color="white" />
                 </View>
              </View>
              
              <Text className="text-xl font-bold text-slate-900 font-poppins text-center mb-2">Signal Interrupted</Text>
              <Text className="text-slate-400 text-sm font-poppins text-center mb-8">
                The neural link is weak. Kindly check your signal strength or network connectivity to continue cloud analysis.
              </Text>

              <View className="w-full space-y-3">
                 <TouchableOpacity 
                    onPress={() => {
                       setShowErrorModal(false);
                       if (selectedImage) startSimulatedScan(selectedImage);
                    }}
                    className="w-full h-14 bg-emerald-600 rounded-2xl items-center justify-center flex-row"
                 >
                    <Ionicons name="refresh" size={18} color="white" className="mr-2" />
                    <Text className="text-white font-bold font-poppins ml-2">Scan Again</Text>
                 </TouchableOpacity>

                 <TouchableOpacity 
                    onPress={handleDemoMode}
                    className="w-full h-14 bg-slate-100 rounded-2xl items-center justify-center flex-row"
                 >
                    <Ionicons name="flask-outline" size={18} color="#1E293B" className="mr-2" />
                    <Text className="text-slate-900 font-bold font-poppins ml-2">Try Demo Mode</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      </Modal>
    </View>
  );
}
