import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      <Text style={styles.text}>LOADING... ({percentage}%)</Text>
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
  text: {
    fontSize: 24,
    color: '#000000',
  },
});
