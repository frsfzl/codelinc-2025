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
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {renderField('age', 'Age', 'number', undefined, true)}
          {renderField('familyStatus', 'Family Status', 'select', ['Single', 'Married', 'Divorced', 'Widowed', 'Domestic Partnership'], true)}
          {renderField('dependents', 'Number of Dependents', 'number', undefined, true)}
          {renderField('income', 'Annual Income', 'number', undefined, true)}

          <Text style={styles.sectionTitle}>Financial Information</Text>
          {renderField('debtAmount', 'Total Debt Amount', 'number')}
          {renderField('savingsAmount', 'Current Savings', 'number')}
          {renderField('emergencyFund', 'Emergency Fund', 'number')}
          {renderField('financialGoals', 'Primary Financial Goals', 'select', ['Build Emergency Fund', 'Pay Off Debt', 'Save for Retirement', 'Buy a Home', 'Investment Growth'], true)}
          {renderField('riskTolerance', 'Risk Tolerance', 'select', ['Conservative', 'Moderate', 'Aggressive'], true)}

          <Text style={styles.sectionTitle}>Health & Benefits</Text>
          {renderField('healthStatus', 'Health Status', 'select', ['Excellent', 'Good', 'Fair', 'Poor', 'Prefer not to say'], true)}
          {renderField('currentBenefits', 'Current Benefits', 'select', ['None', 'Basic', 'Comprehensive', 'Premium'], true)}
          {renderField('benefitsPriority', 'Benefits Priority', 'select', ['Health Insurance', 'Dental/Vision', 'Retirement', 'Life Insurance'], true)}
          {renderField('insuranceNeeds', 'Insurance Needs', 'select', ['Life Insurance', 'Disability Insurance', 'Long-term Care', 'Auto Insurance', 'All of the above'], true)}

          <Text style={styles.sectionTitle}>Additional Information</Text>
          {renderField('investmentExperience', 'Investment Experience', 'select', ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'], true)}
          {renderField('retirementPlanning', 'Retirement Planning', 'select', ['Not Started', 'Just Started', 'In Progress', 'Well Planned', 'Already Retired'], true)}
          {renderField('educationGoals', 'Education Goals', 'select', ['No Education Goals', 'Professional Development', 'Degree Completion', 'Certification', 'Skills Training'], true)}
          {renderField('homeownershipStatus', 'Homeownership Status', 'select', ['Renting', 'Own Home', 'Planning to Buy', 'Planning to Sell', 'Not Interested'], true)}
          {renderField('employmentType', 'Employment Type', 'select', ['Full-time Employee', 'Part-time Employee', 'Contractor', 'Self-employed', 'Unemployed', 'Student'], true)}
          {renderField('workLocation', 'Work Location', 'select', ['Office', 'Remote', 'Hybrid', 'Field Work', 'Multiple Locations'], true)}
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#34495e',
    borderRadius: 16,
    marginRight: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  optionsContainer: {
    maxHeight: 120,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
