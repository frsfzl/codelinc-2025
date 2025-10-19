import ProfileSettings from '@/components/profile-settings';
import database from '@/services/database';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const hasCompleted = await database.hasCompletedOnboarding();
      setHasProfile(hasCompleted);
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

  const resetProfile = async () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to delete your profile? You will need to complete the onboarding questionnaire again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.deleteUserProfile();
              setHasProfile(false);
              Alert.alert('Success', 'Profile has been reset.');
            } catch (error) {
              console.error('Error resetting profile:', error);
              Alert.alert('Error', 'Failed to reset profile.');
            }
          }
        }
      ]
    );
  };

  if (showProfileSettings) {
    return <ProfileSettings onBack={() => setShowProfileSettings(false)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Management</Text>
        
        {hasProfile ? (
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => setShowProfileSettings(true)}
            >
              <Text style={styles.optionButtonText}>Edit Profile</Text>
              <Text style={styles.optionDescription}>Update your personal and financial information</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionButton, styles.dangerButton]}
              onPress={resetProfile}
            >
              <Text style={[styles.optionButtonText, styles.dangerButtonText]}>Reset Profile</Text>
              <Text style={styles.optionDescription}>Delete your profile and start over</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noProfileContainer}>
            <Text style={styles.noProfileText}>No profile found</Text>
            <Text style={styles.noProfileDescription}>
              Complete the onboarding questionnaire to create your profile
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Abe - AI Financial Assistant</Text>
          <Text style={styles.infoText}>Powered by Lincoln Financial</Text>
          <Text style={styles.infoText}>Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
  },
  dangerButtonText: {
    color: '#e53e3e',
  },
  noProfileContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noProfileDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});