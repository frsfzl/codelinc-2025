import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>About Abe Chat</ThemedText>
        <ThemedText style={styles.description}>
          Abe is your AI voice assistant powered by VAPI technology. 
          You can have natural conversations with Abe through text and voice.
        </ThemedText>
        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">← Back to Chat</ThemedText>
        </Link>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  link: {
    paddingVertical: 15,
  },
});