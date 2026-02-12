import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrackCarbonScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <TouchableOpacity
          className="flex-row items-center py-2"
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-xl text-primary font-semibold mr-1">←</Text>
          <Text className="text-base font-semibold text-primary">BACK</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Hero Section */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-textPrimary mb-2">Track Your Impact</Text>
          <Text className="text-sm text-textSecondary leading-5">
            Monitor your carbon footprint and see how much CO2 you&apos;re saving through recycling
          </Text>
        </View>

        {/* Option Buttons */}
        <View className="gap-4 mb-8">
          {/* Button 1: Track My Carbon Footprint */}
          <TouchableOpacity
            className="bg-warningLight rounded-2xl p-5 border-2 border-amber-500"
            onPress={() => (router as any).push('/track-carbon/footprint')}
            activeOpacity={0.9}
          >
            <View className="w-14 h-14 rounded-xl bg-amber-500 items-center justify-center mb-3">
              <Text className="text-3xl">🏭</Text>
            </View>
            <Text className="text-lg font-bold text-textPrimary mb-1.5">Track My Carbon Footprint</Text>
            <Text className="text-xs text-textSecondary leading-[18px]">Calculate your daily/weekly emissions before recycling</Text>
          </TouchableOpacity>

          {/* Button 2: Track Carbon Savings */}
          <TouchableOpacity
            className="bg-primaryLight rounded-2xl p-5 border-2 border-primary"
            onPress={() => (router as any).push('/track-carbon/savings')}
            activeOpacity={0.9}
          >
            <View className="w-14 h-14 rounded-xl bg-primary items-center justify-center mb-3">
              <Text className="text-3xl">🌱</Text>
            </View>
            <Text className="text-lg font-bold text-textPrimary mb-1.5">Track Carbon Savings</Text>
            <Text className="text-xs text-textSecondary leading-[18px]">See how much CO₂ you&apos;ve saved by recycling</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-textPrimary mb-4">Why Track Carbon?</Text>
            
          <View className="flex-row items-center bg-card rounded-xl p-4 mb-3 shadow-sm shadow-black/5 elevation-2">
            <Text className="text-2xl mr-3.5">📊</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-textPrimary mb-1">Know Your Impact</Text>
              <Text className="text-xs text-textSecondary leading-[18px]">Understand how your consumption affects the environment</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-card rounded-xl p-4 mb-3 shadow-sm shadow-black/5 elevation-2">
            <Text className="text-2xl mr-3.5">📈</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-textPrimary mb-1">Track Progress</Text>
              <Text className="text-xs text-textSecondary leading-[18px]">See improvements over time with detailed analytics</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-card rounded-xl p-4 mb-3 shadow-sm shadow-black/5 elevation-2">
            <Text className="text-2xl mr-3.5">🏆</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-textPrimary mb-1">Earn Rewards</Text>
              <Text className="text-xs text-textSecondary leading-[18px]">Get badges and points for reducing your carbon footprint</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
