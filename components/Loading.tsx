import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.container}>
      {/* App Logo */}
      <Image
        source={require('@/assets/recyclehub_icon.png')}
        style={styles.logo}
        contentFit="contain"
      />
      
      {/* Loading Animation */}
      <View style={styles.loadingContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.text}>Loading... {percentage}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '80%',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins',
  },
});
