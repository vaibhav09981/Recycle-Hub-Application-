import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCarbon } from '@/context/CarbonContext';

// Recycling savings factors (kg CO2 saved per kg recycled)
const SAVINGS_FACTORS: Record<string, { savings: number; percent: number; category: string }> = {
  'PET (Plastic bottles)': { savings: 2.3, percent: 67, category: 'plastic' },
  'HDPE (Milk jugs)': { savings: 1.3, percent: 68, category: 'plastic' },
  'Plastic bags': { savings: 1.4, percent: 70, category: 'plastic' },
  'Aluminum (cans)': { savings: 8.1, percent: 90, category: 'metal' },
  'Steel (tin cans)': { savings: 1.7, percent: 74, category: 'metal' },
  'Cardboard': { savings: 0.7, percent: 77, category: 'paper' },
  'Mixed paper': { savings: 0.9, percent: 82, category: 'paper' },
  'Glass bottles': { savings: 0.3, percent: 37, category: 'glass' },
  'Electronics': { savings: 150, percent: 75, category: 'ewaste' },
};

const MATERIALS = Object.keys(SAVINGS_FACTORS);

export default function SavingsScreen() {
  const router = useRouter();
  const { totalSavings: contextTotalSavings, addSavings } = useCarbon();
  const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIALS[0]);
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [result, setResult] = useState<{ savings: number; percent: number; equivalent: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Calculate equivalents based on real total
  const calculateEquivalents = (savings: number) => {
    const equivalentKm = Math.round(savings * 4); // 1 kg CO2 ≈ 4 km driving
    const equivalentTrees = Number((savings / 50).toFixed(2)); // 1 tree absorbs ~50 kg CO2/year
    return { km: equivalentKm, trees: equivalentTrees };
  };

  const calculateSavings = () => {
    const weightNum = parseFloat(weight) || 0;
    const quantityNum = parseInt(quantity) || 1;
    const data = SAVINGS_FACTORS[selectedMaterial];
    
    const totalSavings = weightNum * data.savings * quantityNum;
    
    // Calculate equivalent
    let equivalent = '';
    if (totalSavings < 0.5) {
      equivalent = `${Math.round(totalSavings * 1000)}g = ${Math.round(totalSavings * 100)} smartphone charges`;
    } else if (totalSavings < 5) {
      equivalent = `${totalSavings.toFixed(2)} kg = ${Math.round(totalSavings * 10)} hours of LED lighting`;
    } else if (totalSavings < 50) {
      equivalent = `${totalSavings.toFixed(1)} kg = ${Math.round(totalSavings / 2)} km not driven`;
    } else {
      equivalent = `${(totalSavings / 10).toFixed(1)} kg = ${(totalSavings / 50).toFixed(1)} trees planted`;
    }

    setResult({ savings: totalSavings, percent: data.percent, equivalent });
    setIsSaved(false);
  };

  const saveSavings = () => {
    if (result && result.savings > 0) {
      const weightNum = parseFloat(weight) || 0;
      const quantityNum = parseInt(quantity) || 1;
      addSavings(selectedMaterial, weightNum, quantityNum, result.savings);
      setIsSaved(true);
      Alert.alert('Saved!', 'Your carbon savings have been added to your dashboard.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plastic': return '#3B82F6';
      case 'metal': return '#6B7280';
      case 'paper': return '#92400E';
      case 'glass': return '#14B8A6';
      case 'organic': return '#10B981';
      case 'ewaste': return '#8B5CF6';
      default: return '#10B981';
    }
  };

  const selectedData = SAVINGS_FACTORS[selectedMaterial];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <TouchableOpacity
          className="flex-row items-center py-2"
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-xl text-primary font-semibold mr-1">←</Text>
          <Text className="text-base font-semibold text-primary">BACK</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Hero Card - Total Savings */}
        <View className="bg-primary rounded-2xl p-6 items-center mb-5 shadow-lg shadow-primary/20 elevation-4">
          <Text className="text-4xl mb-2">🌱</Text>
          <Text className="text-sm text-white/80 mb-1">Total CO2 Saved</Text>
          <Text className="text-[42px] font-bold text-white mb-4">{contextTotalSavings.toFixed(1)} kg</Text>
          <View className="flex-row gap-6">
            <View className="flex-row items-center">
              <Text className="text-lg mr-1.5">🚗</Text>
              <Text className="text-sm text-white/90">{calculateEquivalents(contextTotalSavings).km} km</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg mr-1.5">🌳</Text>
              <Text className="text-sm text-white/90">{calculateEquivalents(contextTotalSavings).trees} trees</Text>
            </View>
          </View>
        </View>

        {/* Calculator Section */}
        <View className="bg-card rounded-2xl p-5 mb-5 shadow-sm shadow-black/5 elevation-2">
          <Text className="text-lg font-semibold text-textPrimary mb-1.5">Calculate Your Savings</Text>
          <Text className="text-xs text-textSecondary mb-4 leading-[18px]">
            Enter material and weight to see how much CO2 you save by recycling
          </Text>

          {/* Material Selector */}
          <Text className="text-xs font-medium text-textSecondary mb-2">Select Material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {MATERIALS.map((material) => (
                <TouchableOpacity
                  key={material}
                  className={`px-3 py-2 rounded-full ${selectedMaterial === material ? '' : 'bg-background border border-border'}`}
                  style={selectedMaterial === material ? { backgroundColor: getCategoryColor(SAVINGS_FACTORS[material].category) } : {}}
                  onPress={() => setSelectedMaterial(material)}
                >
                  <Text className={`text-xs ${selectedMaterial === material ? 'text-white font-semibold' : 'text-textSecondary'}`}>
                    {material}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text className="text-xs text-primary font-medium mb-4">
            Savings: {selectedData.savings} kg CO2/kg ({selectedData.percent}% savings)
          </Text>

          {/* Input Section */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-xs font-medium text-textSecondary mb-1.5">Weight (kg)</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3.5 text-sm border border-border"
                placeholder="0.0"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium text-textSecondary mb-1.5">Quantity</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3.5 text-sm border border-border"
                placeholder="1"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity className="bg-primary rounded-xl py-4 items-center" onPress={calculateSavings} activeOpacity={0.9}>
            <Text className="text-base font-semibold text-white">Calculate Savings</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {result && result.savings > 0 && (
          <TouchableOpacity 
            className={`rounded-xl py-4 items-center mb-5 ${isSaved ? 'bg-primaryLight border border-primary' : 'bg-primary'}`}
            onPress={saveSavings}
            disabled={isSaved}
            activeOpacity={0.9}
          >
            <Text className={`text-base font-semibold ${isSaved ? 'text-primaryDark' : 'text-white'}`}>
              {isSaved ? '✓ Saved to Dashboard' : 'Save to Dashboard'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Result Card */}
        {result && result.savings > 0 && (
          <View className="bg-primaryLight rounded-2xl p-5 items-center mb-5 border-2 border-primary">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">🎉</Text>
              <Text className="text-base font-semibold text-primaryDark">Great Job!</Text>
            </View>
            <Text className="text-[36px] font-bold text-primary mb-1">+{result.savings.toFixed(3)} kg CO2</Text>
            <Text className="text-sm text-primaryDark mb-3">That is {result.percent}% savings!</Text>
            <View className="bg-card rounded-xl p-3 w-full mb-3">
              <Text className="text-xs text-textSecondary text-center">
                Equivalent to: {result.equivalent}
              </Text>
            </View>
            <View className="bg-primary rounded-xl p-3 w-full">
              <Text className="text-xs text-white text-center">
                Keep recycling! Every item makes a difference for our planet. 🌍
              </Text>
            </View>
          </View>
        )}

        {/* Monthly Progress */}
        <View className="bg-card rounded-xl p-4 shadow-sm shadow-black/5 elevation-2">
          <Text className="text-base font-semibold text-textPrimary mb-3">Monthly Progress</Text>
          <View className="h-3 bg-background rounded-full overflow-hidden mb-2">
            <View className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
          </View>
          <Text className="text-xs text-textSecondary">65% toward this month goal</Text>
        </View>

        {/* Bottom Spacer */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
