import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

interface ScanHistoryItem {
  id: string;
  itemName: string;
  material: string;
  recyclable: 'fully' | 'partially' | 'no';
  carbonSaved: number;
  image?: string;
  date: string;
}

export default function HomeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Mock scan history data
  const [scanHistory] = useState<ScanHistoryItem[]>([
    {
      id: '1',
      itemName: 'Plastic Water Bottle',
      material: 'Plastic (PET)',
      recyclable: 'fully',
      carbonSaved: 42,
      date: 'Today',
    },
    {
      id: '2',
      itemName: 'Cardboard Box',
      material: 'Cardboard',
      recyclable: 'fully',
      carbonSaved: 65,
      date: 'Yesterday',
    },
  ]);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleScan = () => {
    setIsScanning(true);
    // Navigate to scan screen or open camera
    router.push('/scan');
  };

  const getRecyclableColor = (status: string) => {
    switch (status) {
      case 'fully':
        return '#10B981';
      case 'partially':
        return '#F59E0B';
      case 'no':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getRecyclableIcon = (status: string) => {
    switch (status) {
      case 'fully':
        return '♻️';
      case 'partially':
        return '⚠️';
      case 'no':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#F3F4F6', 
            borderRadius: 24, 
            paddingHorizontal: 16, 
            paddingVertical: 12 
          }}>
            <Text style={{ color: '#9CA3AF', marginRight: 12 }}>🔍</Text>
            <TextInput
              style={{ flex: 1, color: '#374151', fontFamily: 'Poppins' }}
              placeholder="Search items..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Greeting & Impact Stats */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
            Good Morning
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontFamily: 'Poppins' }}>{currentDate}</Text>
          
          {/* Impact Cards Row */}
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>🌱</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0 kg</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins' }}>CO₂ Saved</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>♻️</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', fontFamily: 'Poppins' }}>0</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins' }}>Items Recycled</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>⭐</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F59E0B', fontFamily: 'Poppins' }}>0</Text>
              <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Poppins' }}>Green Points</Text>
            </View>
          </View>
        </View>

        {/* AI Scanner Card */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}>
            {/* Card Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>🤖</Text>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
                    AI Scanner
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                    Powered by Gemini Vision
                  </Text>
                </View>
              </View>
            </View>

            {/* Camera/Upload Area */}
            <TouchableOpacity
              style={{ aspectRatio: 1.5, borderWidth: 3, borderColor: '#10B981', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', borderStyle: 'dashed' }}
              onPress={handleScan}
              activeOpacity={0.8}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={{ backgroundColor: '#10B981', padding: 16, borderRadius: 50, marginBottom: 12 }}>
                  <Text style={{ fontSize: 32 }}>📷</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins', marginBottom: 4 }}>
                  Tap to Scan
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
                  Identify recyclability, carbon savings{'\n'}and get action options
                </Text>
              </View>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🛍️</Text>
                <Text style={{ fontSize: 11, color: '#374151', fontFamily: 'Poppins' }}>Eco Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => router.push('/(tabs)/cart')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🛒</Text>
                <Text style={{ fontSize: 11, color: '#374151', fontFamily: 'Poppins' }}>My Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>📊</Text>
                <Text style={{ fontSize: 11, color: '#374151', fontFamily: 'Poppins' }}>My Impact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        {scanHistory.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins', marginBottom: 16 }}>
              Recent Scans
            </Text>
            {scanHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
                onPress={() => router.push('/scan')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 24 }}>{getRecyclableIcon(item.recyclable)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'Poppins' }}>
                      {item.itemName}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Poppins' }}>
                      {item.material} • {item.date}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins' }}>
                        {item.carbonSaved}% CO₂
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#6B7280', fontFamily: 'Poppins', marginTop: 4 }}>
                      Saved
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {scanHistory.length === 0 && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🌍</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginBottom: 8 }}>
              Start Scanning!
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center' }}>
              Scan items to see their recyclability,{'\n'}carbon savings and impact on environment
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
