import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', fontFamily: 'Poppins' }}>
          Cart
        </Text>
      </View>

      {/* Empty Cart Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🛒</Text>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827', fontFamily: 'Poppins', marginBottom: 8 }}>
          Your cart is empty
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', fontFamily: 'Poppins', textAlign: 'center', paddingHorizontal: 32 }}>
          Start shopping for eco-friendly products and make a difference!
        </Text>
      </View>
    </SafeAreaView>
  );
}
