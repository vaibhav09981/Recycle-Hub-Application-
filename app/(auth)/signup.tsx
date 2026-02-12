import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    } else {
      Alert.alert('Success', 'Account created successfully! Please check your email to verify.');
      router.replace('/' as any);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1 px-6">
        <View className="pt-15 mb-5">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="py-2">
              <Text className="text-base text-primary">← Back</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="items-center mb-6">
          <Image source={require('@/assets/recyclehub_icon.png')} className="w-20 h-20 mb-2" resizeMode="contain" />
          <View className="flex-row items-center mb-2">
            <Text className="text-3xl font-bold text-primary">Recycle</Text>
            <Text className="text-3xl font-bold text-black">Hub</Text>
          </View>
          <Text className="text-sm text-textSecondary text-center">Join RecycleHub and start recycling!</Text>
        </View>

        <View className="w-full">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Full Name</Text>
          <TextInput
            className="w-full p-4 rounded-xl border border-border bg-card text-base text-textPrimary mb-4"
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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
            placeholder="Create a password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text className="text-sm font-semibold text-textPrimary mb-2">Confirm Password</Text>
          <TextInput
            className="w-full p-4 rounded-xl border border-border bg-card text-base text-textPrimary mb-4"
            placeholder="Confirm your password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity className="w-full p-4 bg-primary rounded-xl items-center mt-2" onPress={handleSignup} disabled={loading}>
            <Text className="text-base font-semibold text-white">{loading ? 'Creating Account...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6 mb-8">
            <Text className="text-sm text-textSecondary">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-sm text-primary font-semibold">Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
