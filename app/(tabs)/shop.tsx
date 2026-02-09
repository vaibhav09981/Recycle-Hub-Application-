import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView } from 'react-native';

export default function ShopScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Eco Shop</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* Product Card 1 */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm">
            <View className="bg-emerald-100 rounded-lg h-32 items-center justify-center mb-3">
              <Text className="text-4xl">♻️</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 font-poppins">Recycled Bag</Text>
            <Text className="text-sm text-emerald-500 font-poppins">₹99</Text>
          </View>

          {/* Product Card 2 */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm">
            <View className="bg-emerald-100 rounded-lg h-32 items-center justify-center mb-3">
              <Text className="text-4xl">🌱</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 font-poppins">Plant Pot</Text>
            <Text className="text-sm text-emerald-500 font-poppins">₹149</Text>
          </View>

          {/* Product Card 3 */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm">
            <View className="bg-emerald-100 rounded-lg h-32 items-center justify-center mb-3">
              <Text className="text-4xl">🧴</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 font-poppins">Eco Bottle</Text>
            <Text className="text-sm text-emerald-500 font-poppins">₹299</Text>
          </View>

          {/* Product Card 4 */}
          <View className="bg-white rounded-xl p-4 w-[48%] mb-4 shadow-sm">
            <View className="bg-emerald-100 rounded-lg h-32 items-center justify-center mb-3">
              <Text className="text-4xl">📦</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 font-poppins">Gift Box</Text>
            <Text className="text-sm text-emerald-500 font-poppins">₹199</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
