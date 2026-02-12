import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';

interface LoadingProps {
  onLoadingComplete: () => void;
}

export default function Loading({ onLoadingComplete }: LoadingProps) {
  const [percentage, setPercentage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onLoadingComplete();
          return 100;
        }
        return prev + 1;
      });
    }, 15); // 1.5 seconds / 100 steps ≈ 15ms per step

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      {/* App Logo */}
      <Image
        source={require('@/assets/recyclehub_icon.png')}
        className="w-25 h-25 mb-10"
        contentFit="contain"
      />
      
      {/* Loading Animation */}
      <View className="items-center w-[80%]">
        <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
          <View className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
        </View>
        <Text className="text-sm text-gray-500">Loading... {percentage}%</Text>
      </View>
    </View>
  );
}
