import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useCredits } from '@/context/CreditsContext';
import { useJournal } from '@/context/JournalContext';

const WASTE_TYPES = ['Plastic', 'Paper', 'Metal', 'Cardboard', 'E-waste', 'Glass', 'Other'];

const sendEmailNotification = async (data: any) => {
  try {
    // We'll use a simple Fetch to send the email data to your inbox 
    // This uses a public relay for demonstration - replace with your SMTP/EmailJS in production
    const response = await fetch('https://formspree.io/f/xqewkoaj', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        address: data.address,
        weight: `${data.weight} KG`,
        waste_items: data.wasteTypes,
        _subject: `New Pickup Request from ${data.name}`,
      })
    });
    return response.ok;
  } catch (err) {
    console.warn('Email notification failed:', err);
    return false;
  }
};

export default function SchedulePickupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { gradualAddCredits } = useCredits();
  const { scannedItems, markAsRecycled, getScannedCartItems } = useJournal();
  
  // Initial selection from Journal's "cart"
  const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>(
    getScannedCartItems().map(item => item.id)
  );

  const selectedItems = scannedItems.filter(item => selectedJournalIds.includes(item.id));
  const journalCredits = selectedItems.reduce((acc, item) => acc + (Math.abs(parseFloat(item.carbonSaved)) * 1000), 0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    aptNo: '',
    streetNo: '',
    city: '',
    state: '',
    weight: '',
    selectedTypes: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showJournalPicker, setShowJournalPicker] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const saved = await AsyncStorage.getItem('pickup_credentials');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          name: parsed.name || '',
          phone: parsed.phone || '',
          aptNo: parsed.aptNo || '',
          streetNo: parsed.streetNo || '',
          city: parsed.city || '',
          state: parsed.state || '',
        }));
      }
    } catch (err) {
      console.warn('Error loading credentials:', err);
    }
  };

  const saveCredentials = async () => {
    try {
      const creds = {
        name: formData.name,
        phone: formData.phone,
        aptNo: formData.aptNo,
        streetNo: formData.streetNo,
        city: formData.city,
        state: formData.state,
      };
      await AsyncStorage.setItem('pickup_credentials', JSON.stringify(creds));
    } catch (err) {
      console.warn('Error saving credentials:', err);
    }
  };

  const toggleWasteType = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type],
    }));
  };

  const toggleJournalItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedJournalIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleWeightChange = (text: string) => {
    // Only allow numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    if ((cleaned.match(/\./g) || []).length <= 1) {
      setFormData(prev => ({ ...prev, weight: cleaned }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.streetNo || !formData.city || !formData.state || !formData.weight) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const weightNum = parseFloat(formData.weight);
    if (isNaN(weightNum) || weightNum < 3) {
      Alert.alert('Invalid Weight', 'Minimum weight of 3 KG is required for home pickup.');
      return;
    }

    if (formData.selectedTypes.length === 0 && selectedItems.length === 0) {
      Alert.alert('Select Waste', 'Please select items from your journal or specify waste types.');
      return;
    }

    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to schedule a pickup.');
        return;
      }

      // Record in Supabase
      const { error } = await supabase.from('pickups').insert({
        user_id: user.id,
        user_name: formData.name,
        phone_number: formData.phone,
        apt_no: formData.aptNo,
        street_no: formData.streetNo,
        city: formData.city,
        state: formData.state,
        waste_weight: weightNum,
        waste_type: [...formData.selectedTypes, ...selectedItems.map(i => i.productName)].join(', '),
        status: 'pending',
      });

      if (error) throw error;

      // Send Email Notification
      await sendEmailNotification({
        name: formData.name,
        phone: formData.phone,
        address: `${formData.aptNo ? formData.aptNo + ', ' : ''}${formData.streetNo}, ${formData.city}, ${formData.state}`,
        weight: weightNum,
        wasteTypes: [...formData.selectedTypes, ...selectedItems.map(i => i.productName)].join(', '),
      });

      // Save credentials for future use
      await saveCredentials();

      // Award credits based on Journal items (as per user request)
      const creditReward = Math.round(journalCredits > 0 ? journalCredits : weightNum * 100);
      gradualAddCredits(creditReward, 5000); // Over 5 seconds

      // Mark items as recycled in journal (don't delete)
      markAsRecycled(selectedJournalIds);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Request Sent!',
        `Our "Pickup Partner" will be reaching you out soon. You will earn ${creditReward} Green Credits once the pickup is verified!`,
        [{ text: 'Great!', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Pickup request error:', error);
      Alert.alert('Submission Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#64748B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 font-poppins">Schedule Pickup</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          {/* Hero Section */}
          <View className="mb-8 items-center">
            <View className="w-20 h-20 rounded-[28px] bg-emerald-50 items-center justify-center mb-4">
              <Ionicons name="car" size={36} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 text-center font-poppins">Request Home Collection</Text>
            <Text className="text-sm text-slate-400 text-center mt-2 font-poppins px-6">
              Our specialized team will collect your recyclables directly from your doorstep.
            </Text>
          </View>

          {/* Journal Items Selection */}
          <View className="mb-8 p-6 bg-emerald-50 rounded-[32px] border border-emerald-100">
             <TouchableOpacity 
               onPress={() => {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                 setShowJournalPicker(!showJournalPicker);
               }}
               className="flex-row items-center justify-between mb-4"
             >
                <View className="flex-row items-center">
                   <View className="w-8 h-8 bg-emerald-600 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="journal" size={16} color="white" />
                   </View>
                   <Text className="text-emerald-900 font-bold text-base font-poppins">Select from Journal</Text>
                </View>
                <View className="flex-row items-center">
                   <Text className="text-emerald-600 font-bold text-xs mr-2">{selectedJournalIds.length} Selected</Text>
                   <Ionicons name={showJournalPicker ? "chevron-up" : "chevron-down"} size={16} color="#059669" />
                </View>
             </TouchableOpacity>

             {showJournalPicker && (
               <View className="space-y-3 mt-2 max-h-60">
                 <ScrollView nestedScrollEnabled className="space-y-2">
                   {scannedItems.filter(i => !i.isRecycled).length === 0 ? (
                     <Text className="text-emerald-600/50 text-xs font-poppins text-center py-4">No scanned items found in journal.</Text>
                   ) : (
                     scannedItems.filter(i => !i.isRecycled).map((item) => (
                       <TouchableOpacity
                         key={item.id}
                         onPress={() => toggleJournalItem(item.id)}
                         className={`p-3 rounded-2xl flex-row items-center justify-between border ${selectedJournalIds.includes(item.id) ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-emerald-100'}`}
                       >
                          <View className="flex-row items-center flex-1 mr-2">
                             <Image source={{ uri: item.imageUrl }} className="w-8 h-8 rounded-lg mr-3" />
                             <Text className={`text-xs font-bold font-poppins ${selectedJournalIds.includes(item.id) ? 'text-white' : 'text-slate-700'}`} numberOfLines={1}>
                               {item.productName}
                             </Text>
                          </View>
                          <Text className={`text-[10px] font-black font-poppins ${selectedJournalIds.includes(item.id) ? 'text-emerald-100' : 'text-emerald-600'}`}>
                             +{Math.round(Math.abs(parseFloat(item.carbonSaved)) * 1000)} GC
                          </Text>
                       </TouchableOpacity>
                     ))
                   )}
                 </ScrollView>
               </View>
             )}

             <View className="h-[1px] bg-emerald-200 my-4" />
             <View className="flex-row items-center justify-between">
                <Text className="text-emerald-900 font-bold text-sm font-poppins">Total Credits to Earn</Text>
                <Text className="text-emerald-600 font-black text-xl font-poppins">{Math.round(journalCredits)} GC</Text>
             </View>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 font-poppins">Contact Information</Text>
              <TextInput
                className="bg-slate-50 rounded-2xl px-5 py-4 text-base text-slate-900 border border-slate-100 font-poppins mb-3"
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />
              <TextInput
                className="bg-slate-50 rounded-2xl px-5 py-4 text-base text-slate-900 border border-slate-100 font-poppins"
                placeholder="Phone Number (WhatsApp Active)"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={text => setFormData({ ...formData, phone: text })}
              />
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4 ml-1 font-poppins">Address Details</Text>
              <View className="flex-row space-x-3 mb-3">
                <TextInput
                  className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 text-base text-slate-900 border border-slate-100 font-poppins"
                  placeholder="Apt/Suite No (Optional)"
                  placeholderTextColor="#94A3B8"
                  value={formData.aptNo}
                  onChangeText={text => setFormData({ ...formData, aptNo: text })}
                />
                <TextInput
                  className="flex-[2] bg-slate-50 rounded-2xl px-5 py-4 text-base text-slate-900 border border-slate-100 font-poppins"
                  placeholder="Street Address"
                  placeholderTextColor="#94A3B8"
                  value={formData.streetNo}
                  onChangeText={text => setFormData({ ...formData, streetNo: text })}
                />
              </View>
              <View className="flex-row space-x-3">
                <TextInput
                  className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 text-base text-slate-900 border border-slate-100 font-poppins"
                  placeholder="City"
                  placeholderTextColor="#94A3B8"
                  value={formData.city}
                  onChangeText={text => setFormData({ ...formData, city: text })}
                />
                <TextInput
                  className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 text-base text-slate-900 border border-slate-100 font-poppins"
                  placeholder="State"
                  placeholderTextColor="#94A3B8"
                  value={formData.state}
                  onChangeText={text => setFormData({ ...formData, state: text })}
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4 ml-1 font-poppins">Estimated Weight</Text>
              <View className="bg-slate-50 rounded-2xl flex-row items-center border border-slate-100 pr-5">
                <TextInput
                  className="flex-1 py-4 px-5 text-base text-slate-900 font-bold font-poppins"
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={formData.weight}
                  onChangeText={handleWeightChange}
                />
                <Text className="text-base font-bold text-slate-400 font-poppins">KG</Text>
              </View>
              <View className="flex-row items-center mt-2 px-1">
                <Ionicons name="information-circle-outline" size={14} color="#F59E0B" />
                <Text className="text-[10px] text-amber-600 font-bold font-poppins ml-1">
                  Minimum weight of 3 KG is compulsory
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-4 ml-1 font-poppins">Other Waste Categories</Text>
              <TouchableOpacity
                className="bg-slate-50 rounded-2xl px-5 py-4 flex-row items-center justify-between border border-slate-100"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowTypePicker(!showTypePicker);
                }}
              >
                <Text className={`text-base font-poppins ${formData.selectedTypes.length > 0 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {formData.selectedTypes.length > 0 ? formData.selectedTypes.join(', ') : 'Select Categories'}
                </Text>
                <Ionicons name={showTypePicker ? 'chevron-up' : 'chevron-down'} size={20} color="#94A3B8" />
              </TouchableOpacity>

              {showTypePicker && (
                <View className="bg-slate-50 rounded-2xl mt-2 p-4 border border-slate-100 flex-row flex-wrap gap-2">
                  {WASTE_TYPES.map(type => {
                    const isSelected = formData.selectedTypes.includes(type);
                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => toggleWasteType(type)}
                        className={`px-4 py-2 rounded-xl border ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'} font-poppins`}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`mt-10 h-16 rounded-[24px] items-center justify-center shadow-lg ${isSubmitting ? 'bg-slate-200' : 'bg-emerald-600 shadow-emerald-200'}`}
          >
            <Text className="text-white text-lg font-bold font-poppins">
              {isSubmitting ? 'Sending Request...' : 'Submit Pickup Request'}
            </Text>
          </TouchableOpacity>

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
