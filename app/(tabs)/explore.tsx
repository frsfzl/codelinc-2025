import ProfileSettings from '@/components/profile-settings';
import database from '@/services/database';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
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
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Management</Text>
            </View>
            
            {hasProfile ? (
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => setShowProfileSettings(true)}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionIconText}>👤</Text>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionButtonText}>Edit Profile</Text>
                    <Text style={styles.optionDescription}>Update your personal and financial information</Text>
                  </View>
                  <Text style={styles.optionArrow}>›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.optionButton, styles.dangerButton]}
                  onPress={resetProfile}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionIconText}>🗑️</Text>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionButtonText, styles.dangerButtonText]}>Reset Profile</Text>
                    <Text style={styles.optionDescription}>Delete your profile and start over</Text>
                  </View>
                  <Text style={styles.optionArrow}>›</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noProfileContainer}>
                <Text style={styles.noProfileIcon}>📝</Text>
                <Text style={styles.noProfileText}>No profile found</Text>
                <Text style={styles.noProfileDescription}>
                  Complete the onboarding questionnaire to create your profile
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>App Information</Text>
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>App Name</Text>
                <Text style={styles.infoValue}>Abe - AI Financial Assistant</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Powered by</Text>
                <Text style={styles.infoValue}>Lincoln Financial</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#98012E',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#231F20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#98012E',
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#231F20',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#5f6368',
  },
  optionArrow: {
    fontSize: 18,
    color: '#5f6368',
    fontWeight: '300',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
  },
  dangerButtonText: {
    color: '#ea4335',
  },
  noProfileContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  noProfileIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  noProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#231F20',
    marginBottom: 4,
  },
  noProfileDescription: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoContainer: {
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  infoLabel: {
    fontSize: 14,
    color: '#5f6368',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#231F20',
    fontWeight: '500',
  },
});