import { Colors } from '@/constants/theme';
import React, { useState } from 'react';
import { Alert, Button, Text, View, TouchableOpacity } from 'react-native';

export default function DailyChallenge() {
  const [clicked, setClicked] = useState(false);

  const handleViewRewards = () => {
    setClicked(true);
    Alert.alert('Rewards', 'You have earned 10 points!');
  };

  return (
    <View className="p-5 bg-background rounded-xl mx-2.5">
      <Text className="text-xl font-bold mb-2.5" style={{ color: Colors.light.text }}>Daily Challenge</Text>
      <Text className="text-base mb-5" style={{ color: Colors.light.textSecondary }}>Complete today&apos;s challenge to earn rewards!</Text>
      <View className="rounded-lg overflow-hidden">
        <TouchableOpacity
          className="py-3 px-4 items-center"
          style={{ backgroundColor: Colors.light.primary }}
          onPress={handleViewRewards}
        >
          <Text className="text-base font-semibold text-white">View Rewards</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
