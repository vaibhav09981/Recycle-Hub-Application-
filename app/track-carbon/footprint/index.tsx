import { useCarbon } from '@/context/CarbonContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Colors from UI/UX Guide
const COLORS = {
  primary: '#10B981',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  plastic: '#3B82F6',
  metal: '#6B7280',
  paper: '#92400E',
  glass: '#14B8A6',
  organic: '#10B981',
  ewaste: '#8B5CF6',
  white: '#FFFFFF',
};

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
      case 'plastic': return COLORS.plastic;
      case 'metal': return COLORS.metal;
      case 'paper': return COLORS.paper;
      case 'glass': return COLORS.glass;
      case 'organic': return COLORS.organic;
      case 'ewaste': return COLORS.ewaste;
      default: return COLORS.primary;
    }
  };

  const selectedData = EMISSION_FACTORS[selectedMaterial as keyof typeof EMISSION_FACTORS];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🏭</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Calculate Emissions</Text>
            <Text style={styles.infoText}>
              Enter the material type and weight to calculate potential carbon emissions if thrown away.
            </Text>
          </View>
        </View>

        {/* Material Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {MATERIALS.slice(0, 8).map((material) => (
                <TouchableOpacity
                  key={material}
                  style={[
                    styles.chip,
                    selectedMaterial === material && { backgroundColor: getCategoryColor(EMISSION_FACTORS[material as keyof typeof EMISSION_FACTORS].category) },
                  ]}
                  onPress={() => setSelectedMaterial(material)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedMaterial === material && styles.chipTextActive,
                  ]}>
                    {material}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.selectedInfo}>
            Emission factor: {selectedData.factor} kg CO₂/kg
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Details</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity style={styles.calculateButton} onPress={calculateFootprint} activeOpacity={0.9}>
          <Text style={styles.calculateButtonText}>Calculate Footprint</Text>
        </TouchableOpacity>

        {/* Save Button */}
        {result && result.emissions > 0 && (
          <TouchableOpacity 
            style={[styles.saveButton, isSaved && styles.saveButtonSaved]} 
            onPress={saveFootprint}
            disabled={isSaved}
            activeOpacity={0.9}
          >
            <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextSaved]}>
              {isSaved ? '✓ Saved to Dashboard' : 'Save to Dashboard'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Result Card */}
        {result && result.emissions > 0 && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Estimated Emissions</Text>
            <Text style={styles.resultValue}>{result.emissions.toFixed(3)} kg CO₂</Text>
            <Text style={styles.resultEquivalent}>
              Equivalent to: {result.equivalent}
            </Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Recycle this item to save up to {((result.emissions * 0.7)).toFixed(3)} kg CO₂!
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Custom Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    lineHeight: 18,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  // Material Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Input Section
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: 'Poppins',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Calculate Button
  calculateButton: {
    backgroundColor: COLORS.warning,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  // Result Card
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.warning,
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  resultEquivalent: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDark,
    fontFamily: 'Poppins',
  },
  // Save Button
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonSaved: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  saveButtonTextSaved: {
    color: COLORS.primaryDark,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
