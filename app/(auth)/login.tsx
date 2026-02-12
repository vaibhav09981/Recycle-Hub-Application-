import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } else {
      router.replace('/' as any);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <Image source={require('@/assets/recyclehub_icon.png')} className="w-25 h-25 mb-2" resizeMode="contain" />
          <View className="flex-row items-center mb-2">
            <Text className="text-4xl font-bold text-primary">Recycle</Text>
            <Text className="text-4xl font-bold text-black">Hub</Text>
          </View>
          <Text className="text-base text-textSecondary">Welcome back! Login to continue.</Text>
        </View>

        <View className="w-full">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Email</Text>
          <TextInput
            className="w-full p-4 rounded-xl border border-border bg-card text-base text-textPrimary mb-4"
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text className="text-sm font-semibold text-textPrimary mb-2">Password</Text>
          <TextInput
            className="w-full p-4 rounded-xl border border-border bg-card text-base text-textPrimary mb-4"
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity className="w-full p-4 bg-primary rounded-xl items-center mt-2" onPress={handleLogin} disabled={loading}>
            <Text className="text-base font-semibold text-white">{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-textSecondary">Don&apos;t have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-sm text-primary font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
