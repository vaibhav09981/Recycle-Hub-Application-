import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css"

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { JournalProvider } from '@/context/JournalContext';
import { CarbonProvider } from '@/context/CarbonContext';
import { CreditsProvider } from '@/context/CreditsContext';
import Loading from '@/components/Loading';

import { 
  useFonts, 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InitialLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading && fontsLoaded) {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (!session && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)');
      }
      
      setIsReady(true);
    }
  }, [session, loading, segments, fontsLoaded]);

  if (!isReady || !fontsLoaded) {
    return <Loading onLoadingComplete={() => {}} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
        <Stack.Screen name="track-carbon" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <JournalProvider>
          <CarbonProvider>
            <CreditsProvider>
              <InitialLayout />
            </CreditsProvider>
          </CarbonProvider>
        </JournalProvider>
      </CartProvider>
    </AuthProvider>
  );
}
