import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ActivityFailedScreen() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText style={styles.title}>😞 Out of Coins!</ThemedText>
          
          <ThemedText style={styles.message}>
            You've run out of money! Don't worry - budgeting takes practice. 
            Let's go back and try the lesson again.
          </ThemedText>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              router.push('/(tabs)/budgeting-basics?reset=true');
              setTimeout(() => {
                router.push('/(tabs)/learning');
              }, 100);
            }}
          >
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
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
    marginBottom: 40,
  },
  message: {
    color: '#E6EEF4',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
