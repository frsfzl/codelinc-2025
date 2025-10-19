import database, { UserProfile } from '@/services/database';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ProfileSettingsProps {
  onBack: () => void;
}

export default function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    familyStatus: '',
    dependents: '',
    healthStatus: '',
    financialGoals: '',
    riskTolerance: '',
    currentBenefits: '',
    debtAmount: '',
    savingsAmount: '',
    emergencyFund: '',
    investmentExperience: '',
    retirementPlanning: '',
    insuranceNeeds: '',
    educationGoals: '',
    homeownershipStatus: '',
    employmentType: '',
    workLocation: '',
    benefitsPriority: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await database.getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          age: userProfile.age?.toString() || '',
          income: userProfile.income?.toString() || '',
          familyStatus: userProfile.familyStatus || '',
          dependents: userProfile.dependents?.toString() || '',
          healthStatus: userProfile.healthStatus || '',
          financialGoals: userProfile.financialGoals || '',
          riskTolerance: userProfile.riskTolerance || '',
          currentBenefits: userProfile.currentBenefits || '',
          debtAmount: userProfile.debtAmount?.toString() || '',
          savingsAmount: userProfile.savingsAmount?.toString() || '',
          emergencyFund: userProfile.emergencyFund?.toString() || '',
          investmentExperience: userProfile.investmentExperience || '',
          retirementPlanning: userProfile.retirementPlanning || '',
          insuranceNeeds: userProfile.insuranceNeeds || '',
          educationGoals: userProfile.educationGoals || '',
          homeownershipStatus: userProfile.homeownershipStatus || '',
          employmentType: userProfile.employmentType || '',
          workLocation: userProfile.workLocation || '',
          benefitsPriority: userProfile.benefitsPriority || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedProfile: Partial<UserProfile> = {
        age: parseInt(formData.age) || 0,
        income: parseFloat(formData.income) || 0,
        familyStatus: formData.familyStatus,
        dependents: parseInt(formData.dependents) || 0,
        healthStatus: formData.healthStatus,
        financialGoals: formData.financialGoals,
        riskTolerance: formData.riskTolerance,
        currentBenefits: formData.currentBenefits,
        debtAmount: parseFloat(formData.debtAmount) || 0,
        savingsAmount: parseFloat(formData.savingsAmount) || 0,
        emergencyFund: parseFloat(formData.emergencyFund) || 0,
        investmentExperience: formData.investmentExperience,
        retirementPlanning: formData.retirementPlanning,
        insuranceNeeds: formData.insuranceNeeds,
        educationGoals: formData.educationGoals,
        homeownershipStatus: formData.homeownershipStatus,
        employmentType: formData.employmentType,
        workLocation: formData.workLocation,
        benefitsPriority: formData.benefitsPriority,
      };

      await database.saveUserProfile(updatedProfile);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const renderField = (key: string, label: string, type: 'text' | 'number' | 'select', options?: string[], required: boolean = false) => {
    const value = formData[key as keyof typeof formData];

    if (type === 'select' && options) {
      return (
        <View key={key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{label} {required ? '*' : ''}</Text>
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  value === option && styles.selectedOption
                ]}
                onPress={() => updateFormData(key, option)}
              >
                <Text style={[
                  styles.optionText,
                  value === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View key={key} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label} {required ? '*' : ''}
        </Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={(text) => updateFormData(key, text)}
          placeholder={`Enter ${label.toLowerCase()}`}
          keyboardType={type === 'number' ? 'numeric' : 'default'}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <View style={styles.fieldRow}>
              {renderField('age', 'Age', 'number', undefined, true)}
              {renderField('familyStatus', 'Family Status', 'select', ['Single', 'Married', 'Divorced', 'Widowed', 'Domestic Partnership'], true)}
            </View>
            <View style={styles.fieldRow}>
              {renderField('dependents', 'Dependents', 'number', undefined, true)}
              {renderField('income', 'Annual Income', 'number', undefined, true)}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Financial Information</Text>
            </View>
            <View style={styles.fieldRow}>
              {renderField('debtAmount', 'Total Debt', 'number')}
              {renderField('savingsAmount', 'Current Savings', 'number')}
            </View>
            <View style={styles.fieldRow}>
              {renderField('emergencyFund', 'Emergency Fund', 'number')}
              {renderField('financialGoals', 'Financial Goals', 'select', ['Build Emergency Fund', 'Pay Off Debt', 'Save for Retirement', 'Buy a Home', 'Investment Growth'], true)}
            </View>
            {renderField('riskTolerance', 'Risk Tolerance', 'select', ['Conservative', 'Moderate', 'Aggressive'], true)}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Health & Benefits</Text>
            </View>
            <View style={styles.fieldRow}>
              {renderField('healthStatus', 'Health Status', 'select', ['Excellent', 'Good', 'Fair', 'Poor', 'Prefer not to say'], true)}
              {renderField('currentBenefits', 'Current Benefits', 'select', ['None', 'Basic', 'Comprehensive', 'Premium'], true)}
            </View>
            <View style={styles.fieldRow}>
              {renderField('benefitsPriority', 'Benefits Priority', 'select', ['Health Insurance', 'Dental/Vision', 'Retirement', 'Life Insurance'], true)}
              {renderField('insuranceNeeds', 'Insurance Needs', 'select', ['Life Insurance', 'Disability Insurance', 'Long-term Care', 'Auto Insurance', 'All of the above'], true)}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
            </View>
            <View style={styles.fieldRow}>
              {renderField('investmentExperience', 'Investment Experience', 'select', ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'], true)}
              {renderField('retirementPlanning', 'Retirement Planning', 'select', ['Not Started', 'Just Started', 'In Progress', 'Well Planned', 'Already Retired'], true)}
            </View>
            <View style={styles.fieldRow}>
              {renderField('educationGoals', 'Education Goals', 'select', ['No Education Goals', 'Professional Development', 'Degree Completion', 'Certification', 'Skills Training'], true)}
              {renderField('homeownershipStatus', 'Homeownership', 'select', ['Renting', 'Own Home', 'Planning to Buy', 'Planning to Sell', 'Not Interested'], true)}
            </View>
            <View style={styles.fieldRow}>
              {renderField('employmentType', 'Employment Type', 'select', ['Full-time Employee', 'Part-time Employee', 'Contractor', 'Self-employed', 'Unemployed', 'Student'], true)}
              {renderField('workLocation', 'Work Location', 'select', ['Office', 'Remote', 'Hybrid', 'Field Work', 'Multiple Locations'], true)}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#5f6368',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
  },
  placeholder: {
    width: 40,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
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
    color: '#202124',
  },
  fieldRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5f6368',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#ffffff',
    color: '#202124',
  },
  optionsContainer: {
    maxHeight: 120,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: '#ffffff',
  },
  selectedOption: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  optionText: {
    fontSize: 14,
    color: '#202124',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
