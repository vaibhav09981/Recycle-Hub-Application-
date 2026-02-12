import { useCarbon } from '@/context/CarbonContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Material emission factors (kg CO2 per kg)
const EMISSION_FACTORS = {
  'PET (Plastic bottles)': { factor: 3.4, category: 'plastic' },
  'HDPE (Milk jugs)': { factor: 1.9, category: 'plastic' },
  'PVC': { factor: 2.2, category: 'plastic' },
  'Plastic bags': { factor: 2.0, category: 'plastic' },
  'Styrofoam': { factor: 3.6, category: 'plastic' },
  'Aluminum (cans)': { factor: 9.0, category: 'metal' },
  'Steel (tin cans)': { factor: 2.3, category: 'metal' },
  'Cardboard': { factor: 0.9, category: 'paper' },
  'Mixed paper': { factor: 1.1, category: 'paper' },
  'Newspaper': { factor: 0.7, category: 'paper' },
  'Glass bottles': { factor: 0.8, category: 'glass' },
  'Food waste': { factor: 0.5, category: 'organic' },
  'Garden waste': { factor: 0.3, category: 'organic' },
  'Electronics': { factor: 150, category: 'ewaste' },
  'Batteries': { factor: 10, category: 'ewaste' },
};

const MATERIALS = Object.keys(EMISSION_FACTORS);

export default function FootprintScreen() {
  const router = useRouter();
  const { addFootprint } = useCarbon();
  const [selectedMaterial, setSelectedMaterial] = useState<string>(MATERIALS[0]);
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [result, setResult] = useState<{ emissions: number; equivalent: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const calculateFootprint = () => {
    const weightNum = parseFloat(weight) || 0;
    const quantityNum = parseInt(quantity) || 1;
    const factor = EMISSION_FACTORS[selectedMaterial as keyof typeof EMISSION_FACTORS].factor;
    
    const totalEmissions = weightNum * factor * quantityNum;
    
    // Calculate equivalent
    let equivalent = '';
    if (totalEmissions < 1) {
      equivalent = `${Math.round(totalEmissions * 1000)}g = ${Math.round(totalEmissions * 100)} smartphone charges`;
    } else if (totalEmissions < 10) {
      equivalent = `${totalEmissions.toFixed(2)} kg = ${Math.round(totalEmissions * 10)} hours of LED lighting`;
    } else if (totalEmissions < 100) {
      equivalent = `${totalEmissions.toFixed(1)} kg = ${Math.round(totalEmissions * 2)} km driven`;
    } else {
      equivalent = `${(totalEmissions / 100).toFixed(1)} kg = ${Math.round(totalEmissions / 50)} trees needed to absorb`;
    }

    setResult({ emissions: totalEmissions, equivalent });
    setIsSaved(false);
  };

  const saveFootprint = () => {
    if (result && result.emissions > 0) {
      const weightNum = parseFloat(weight) || 0;
      const quantityNum = parseInt(quantity) || 1;
      addFootprint(selectedMaterial, weightNum, quantityNum, result.emissions);
      setIsSaved(true);
      Alert.alert('Saved!', 'Your carbon footprint has been added to your dashboard.');
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

  const selectedData = EMISSION_FACTORS[selectedMaterial as keyof typeof EMISSION_FACTORS];

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
        {/* Info Card */}
        <View className="flex-row items-center bg-warningLight rounded-xl p-4 mb-5 border-2 border-amber-500">
          <Text className="text-3xl mr-3.5">🏭</Text>
          <View className="flex-1">
            <Text className="text-base font-semibold text-textPrimary mb-1">Calculate Emissions</Text>
            <Text className="text-xs text-textSecondary leading-[18px]">
              Enter the material type and weight to calculate potential carbon emissions if thrown away.
            </Text>
          </View>
        </View>

        {/* Material Selector */}
        <View className="mb-5">
          <Text className="text-base font-semibold text-textPrimary mb-3">Select Material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-2">
              {MATERIALS.slice(0, 8).map((material) => (
                <TouchableOpacity
                  key={material}
                  className={`px-3.5 py-2 rounded-full ${selectedMaterial === material ? '' : 'bg-card border border-border'}`}
                  style={selectedMaterial === material ? { backgroundColor: getCategoryColor(EMISSION_FACTORS[material as keyof typeof EMISSION_FACTORS].category) } : {}}
                  onPress={() => setSelectedMaterial(material)}
                >
                  <Text className={`text-xs ${selectedMaterial === material ? 'text-white font-semibold' : 'text-textSecondary'}`}>
                    {material}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text className="text-xs text-textSecondary mt-2 italic">
            Emission factor: {selectedData.factor} kg CO₂/kg
          </Text>
        </View>

        {/* Input Section */}
        <View className="mb-5">
          <Text className="text-base font-semibold text-textPrimary mb-3">Enter Details</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-medium text-textSecondary mb-1.5">Weight (kg)</Text>
              <TextInput
                className="bg-card rounded-xl px-4 py-3.5 text-sm border border-border"
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
                className="bg-card rounded-xl px-4 py-3.5 text-sm border border-border"
                placeholder="1"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity className="bg-amber-500 rounded-xl py-4 items-center mb-5" onPress={calculateFootprint} activeOpacity={0.9}>
          <Text className="text-base font-semibold text-white">Calculate Footprint</Text>
        </TouchableOpacity>

        {/* Save Button */}
        {result && result.emissions > 0 && (
          <TouchableOpacity 
            className={`rounded-xl py-4 items-center mb-5 ${isSaved ? 'bg-primaryLight border border-primary' : 'bg-primary'}`}
            onPress={saveFootprint}
            disabled={isSaved}
            activeOpacity={0.9}
          >
            <Text className={`text-base font-semibold ${isSaved ? 'text-primaryDark' : 'text-white'}`}>
              {isSaved ? '✓ Saved to Dashboard' : 'Save to Dashboard'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Result Card */}
        {result && result.emissions > 0 && (
          <View className="bg-card rounded-2xl p-5 items-center shadow-sm shadow-black/5 elevation-2">
            <Text className="text-sm text-textSecondary mb-2">Estimated Emissions</Text>
            <Text className="text-[36px] font-bold text-amber-500 mb-2">{result.emissions.toFixed(3)} kg CO₂</Text>
            <Text className="text-xs text-textSecondary text-center mb-4">
              Equivalent to: {result.equivalent}
            </Text>
            <View className="flex-row items-center bg-primaryLight rounded-xl p-3 w-full">
              <Text className="text-lg mr-2.5">💡</Text>
              <Text className="flex-1 text-xs text-primaryDark">
                Recycle this item to save up to {((result.emissions * 0.7)).toFixed(3)} kg CO₂!
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Spacer */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
