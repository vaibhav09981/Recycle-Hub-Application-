import { Stack } from 'expo-router';

export default function TrackCarbonLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="footprint/index" />
      <Stack.Screen name="savings/index" />
    </Stack>
  );
}
