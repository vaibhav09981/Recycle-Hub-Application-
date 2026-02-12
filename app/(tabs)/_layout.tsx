import { Tabs } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Text, View, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { useCart } from '@/context/CartContext';
import { useJournal } from '@/context/JournalContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ScrollContext = createContext<Animated.Value | null>(null);

export function useScroll() {
  return useContext(ScrollContext);
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cartCount } = useCart();
  const { journalCount } = useJournal();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animate tab bar translateY based on scrollY
  const translateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  return (
    <ScrollContext.Provider value={scrollY}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#9CA3AF',
          headerShown: false,
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom,
            left: 8,
            right: 8,
            height: 60,
            paddingBottom: 0,
            paddingTop: 8,
            borderColor: '#E5E7EB',
            backgroundColor: '#FFFFFF',
            elevation: 8,
            shadowRadius: 4,
            transform: [{ translateY }],
          },
          tabBarLabelStyle: {
            fontFamily: 'Poppins',
            fontSize: 10,
            fontWeight: '500',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>🏠</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>🛍️</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>🛒</Text>
                {cartCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                        fontFamily: 'Poppins',
                      }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>📋</Text>
                {journalCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      backgroundColor: '#10B981',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                        fontFamily: 'Poppins',
                      }}
                    >
                      {journalCount > 99 ? '99+' : journalCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </ScrollContext.Provider>
  );
}
