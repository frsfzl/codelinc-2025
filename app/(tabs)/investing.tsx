import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getBalance } from '@/utils/storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface InvestmentOption {
  id: string;
  title: string;
  description: string;
  rate: number;
  allocation: number;
}

interface SimulationResult {
  option: InvestmentOption;
  futureValue: number;
  gains: number;
}

const INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    id: '401k',
    title: '401(k)',
    description: 'Employer-sponsored retirement account with tax benefits',
    rate: 0.07,
    allocation: 0,
  },
  {
    id: 'ira',
    title: 'IRA',
    description: 'Individual retirement account for long-term savings',
    rate: 0.065,
    allocation: 0,
  },
  {
    id: 'index',
    title: 'Index Fund',
    description: 'Diversified fund tracking market performance',
    rate: 0.07,
    allocation: 0,
  },
  {
    id: 'savings',
    title: 'High-Yield Savings',
    description: 'Safe savings account with guaranteed returns',
    rate: 0.03,
    allocation: 0,
  },
];

type Step = 'allocate' | 'years' | 'results';

export default function InvestingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const backgroundColor = useThemeColor({}, 'background');
  
  const [step, setStep] = useState<Step>('allocate');
  const [options, setOptions] = useState<InvestmentOption[]>(INVESTMENT_OPTIONS);
  const [years, setYears] = useState('');
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [balance, setBalance] = useState(0);
  
  useFocusEffect(
    React.useCallback(() => {
      const loadBalance = async () => {
        const savedBalance = await getBalance();
        setBalance(savedBalance);
      };
      loadBalance();
    }, [])
  );
  
  const totalAllocated = options.reduce((sum, option) => sum + option.allocation, 0);
  const remaining = balance - totalAllocated;

  const updateAllocation = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;
    
    setOptions(prev => prev.map(option => 
      option.id === id ? { ...option, allocation: numValue } : option
    ));
  };

  const calculateGrowth = (principal: number, rate: number, time: number): number => {
    return principal * Math.pow(1 + rate, time);
  };

  const runSimulation = () => {
    if (!years || parseInt(years) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of years');
      return;
    }

    const yearsNum = parseInt(years);
    const simulationResults: SimulationResult[] = options
      .filter(option => option.allocation > 0)
      .map(option => {
        const futureValue = calculateGrowth(option.allocation, option.rate, yearsNum);
        return {
          option,
          futureValue,
          gains: futureValue - option.allocation,
        };
      });

    // Add unallocated money (no growth)
    if (remaining > 0) {
      simulationResults.push({
        option: {
          id: 'unallocated',
          title: 'Unallocated',
          description: 'Money not invested',
          rate: 0,
          allocation: remaining,
        },
        futureValue: remaining,
        gains: 0,
      });
    }

    setResults(simulationResults);
    setStep('results');
  };

  const resetSimulation = () => {
    setStep('allocate');
    setOptions(INVESTMENT_OPTIONS);
    setYears('');
    setResults([]);
  };

  const totalFutureValue = results.reduce((sum, result) => sum + result.futureValue, 0);
  const totalGains = results.reduce((sum, result) => sum + result.gains, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Investment Simulator</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'allocate' && (
          <>
            <View style={styles.balanceSection}>
              <View style={styles.balanceRow}>
                <Image source={require('@/assets/images/penny.png')} style={styles.pennyIcon} />
                <ThemedText style={styles.balanceAmount}>{remaining}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.sectionTitle}>Allocate Your Investment</ThemedText>
            
            {options.map((option) => (
              <View key={option.id} style={[styles.optionCard, { borderColor: colors.tint }]}>
                <View style={styles.optionHeader}>
                  <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
                  <View style={styles.inputContainer}>
                    <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                    <TextInput
                      style={[styles.allocationInput, { 
                        color: colors.text, 
                        borderColor: colors.tint 
                      }]}
                      value={option.allocation.toString()}
                      onChangeText={(value) => updateAllocation(option.id, value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.icon}
                    />
                  </View>
                </View>
                <ThemedText style={styles.optionDescription}>
                  {option.description}
                </ThemedText>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.continueButton,
                { 
                  backgroundColor: totalAllocated > 0 && remaining >= 0 ? colors.tint : colors.icon,
                  opacity: totalAllocated > 0 && remaining >= 0 ? 1 : 0.5
                }
              ]}
              onPress={() => setStep('years')}
              disabled={remaining < 0}
            >
              <ThemedText style={[styles.buttonText, { color: remaining >= 0 ? 'black' : 'white' }]}>Continue</ThemedText>
            </TouchableOpacity>
          </>
        )}

        {step === 'years' && (
          <>
            <View style={styles.summarySection}>
              <ThemedText style={styles.sectionTitle}>Investment Summary</ThemedText>
              {options.filter(opt => opt.allocation > 0).map((option) => (
                <View key={option.id} style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>{option.title}</ThemedText>
                  <View style={styles.summaryValue}>
                    <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                    <ThemedText style={styles.summaryAmount}>{option.allocation}</ThemedText>
                  </View>
                </View>
              ))}
              {remaining > 0 && (
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Unallocated</ThemedText>
                  <View style={styles.summaryValue}>
                    <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                    <ThemedText style={styles.summaryAmount}>{remaining}</ThemedText>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.yearsSection}>
              <ThemedText style={styles.sectionTitle}>Investment Timeline</ThemedText>
              <ThemedText style={styles.yearsLabel}>How many years?</ThemedText>
              <TextInput
                style={[styles.yearsInput, { 
                  color: colors.text, 
                  borderColor: colors.tint 
                }]}
                value={years}
                onChangeText={setYears}
                keyboardType="numeric"
                placeholder="Enter years (e.g., 10)"
                placeholderTextColor={colors.icon}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.backButtonStyle, { borderColor: colors.tint }]}
                onPress={() => setStep('allocate')}
              >
                <ThemedText style={[styles.backButtonText, { color: colors.text }]}>Back</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.simulateButton, { backgroundColor: colors.tint }]}
                onPress={runSimulation}
              >
                <ThemedText style={[styles.buttonText, { color: 'black' }]}>Simulate Growth</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 'results' && (
          <>
            <View style={styles.resultsHeader}>
              <ThemedText style={styles.sectionTitle}>Growth Results</ThemedText>
              <ThemedText style={styles.timeframe}>After {years} years</ThemedText>
            </View>

            <View style={[styles.totalCard, { borderColor: colors.tint }]}>
              <ThemedText style={styles.totalLabel}>Total Future Value</ThemedText>
              <View style={styles.totalRow}>
                <Image source={require('@/assets/images/penny.png')} style={styles.pennyIcon} />
                <ThemedText style={styles.totalAmount}>
                  {Math.round(totalFutureValue)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.gainsText, { color: '#4CAF50' }]}>
                +{Math.round(totalGains)} gains
              </ThemedText>
            </View>

            <ThemedText style={styles.breakdownTitle}>Investment Breakdown</ThemedText>
            
            {results.map((result) => (
              <View key={result.option.id} style={[styles.resultCard, { borderColor: colors.tint }]}>
                <View style={styles.resultHeader}>
                  <ThemedText style={styles.resultTitle}>{result.option.title}</ThemedText>
                  <View style={styles.resultValue}>
                    <Image source={require('@/assets/images/penny.png')} style={styles.smallPenny} />
                    <ThemedText style={styles.resultAmount}>
                      {Math.round(result.futureValue)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.resultDetails}>
                  <ThemedText style={styles.originalAmount}>
                    Original: {result.option.allocation}
                  </ThemedText>
                  <ThemedText style={[styles.gainAmount, { color: '#4CAF50' }]}>
                    +{Math.round(result.gains)}
                  </ThemedText>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.tint }]}
              onPress={resetSimulation}
            >
              <ThemedText style={[styles.buttonText, { color: 'black' }]}>Try Again</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pennyIcon: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  balanceAmount: {
    paddingTop: 45,
    fontSize: 60,
    fontWeight: 'bold',
    color: '#CD7F32',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
    marginLeft: 8,
  },
  smallPenny: {
    width: 16,
    height: 16,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  yearsSection: {
    marginBottom: 24,
  },
  yearsLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  yearsInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButtonStyle: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  simulateButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeframe: {
    fontSize: 16,
    opacity: 0.7,
  },
  totalCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalAmount: {
    paddingTop: 20,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#CD7F32',
  },
  gainsText: {
    fontSize: 18,
    fontWeight: '600',
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  originalAmount: {
    fontSize: 14,
    opacity: 0.7,
  },
  gainAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});