import { Colors } from '@/constants/theme';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function DailyChallenge() {
  const [clicked, setClicked] = useState(false);

  const handleViewRewards = () => {
    setClicked(true);
    Alert.alert('Rewards', 'You have earned 10 points!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Challenge</Text>
      <Text style={styles.description}>Complete today's challenge to earn rewards!</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="View Rewards"
          onPress={handleViewRewards}
          color={Colors.light.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.text,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.light.textSecondary,
  },
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
