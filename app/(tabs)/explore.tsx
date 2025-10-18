import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Settings</ThemedText>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>AI Assistant</ThemedText>
          <ThemedText style={styles.description}>
            Chat with Abe, your AI voice assistant powered by VAPI technology.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Features</ThemedText>
          <ThemedText style={styles.description}>
            • Real-time voice conversations{'\n'}
            • Text-to-speech responses{'\n'}
            • Smart AI responses{'\n'}
            • Beautiful chat interface
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
          <ThemedText style={styles.description}>
            Built with React Native, Expo, and VAPI for seamless AI voice interactions.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    color: '#7f8c8d',
    lineHeight: 20,
  },
});