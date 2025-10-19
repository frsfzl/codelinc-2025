import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ActivitySuccessScreen() {
  const { coins } = useLocalSearchParams();
  const finalCoins = parseInt(coins as string) || 0;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>🎉 Congratulations!</ThemedText>
          
          <ThemedText style={styles.message}>
            You successfully completed all the budgeting activities and still have money left over! The remaining coins will be added to your balance!
          </ThemedText>

          <View style={styles.coinDisplay}>
            <Image source={require('@/assets/images/penny.png')} style={styles.penny} />
            <ThemedText style={styles.coinAmount}>{finalCoins}</ThemedText>
            <ThemedText style={styles.coinLabel}>coins remaining</ThemedText>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              router.push({
                pathname: '/(tabs)/learning',
                params: { finalCoins: finalCoins.toString() }
              });
            }}
          >
            <ThemedText style={styles.continueButtonText}>Continue Learning</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#0F1720' },
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    paddingTop: 30,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 30,
  },
  message: {
    color: '#E6EEF4',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  coinDisplay: {
    alignItems: 'center',
    marginBottom: 50,
  },
  penny: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  coinAmount: {
    paddingTop: 10,
    color: '#CD7F32',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  coinLabel: {
    color: '#E6EEF4',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
