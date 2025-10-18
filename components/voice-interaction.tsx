import BeautifulChat from '@/components/beautiful-chat';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function VoiceInteraction() {
  return (
    <View style={styles.container}>
      <BeautifulChat assistantId="cfef47df-38fe-4955-9951-f606f1c301b7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});