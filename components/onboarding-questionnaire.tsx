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

interface OnboardingQuestionnaireProps {
  onComplete: () => void;
}

interface FormData {
  age: string;
  income: string;
  familyStatus: string;
  dependents: string;
  healthStatus: string;
  financialGoals: string;
  riskTolerance: string;
  currentBenefits: string;
  debtAmount: string;
  savingsAmount: string;
  emergencyFund: string;
  investmentExperience: string;
  retirementPlanning: string;
  insuranceNeeds: string;
  educationGoals: string;
  homeownershipStatus: string;
  employmentType: string;
  workLocation: string;
  benefitsPriority: string;
}

export default function OnboardingQuestionnaire({ onComplete }: OnboardingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
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
    database.initDatabase();
  }, []);

  const questions = [
    {
      title: "Personal & Family Information",
      fields: [
        {
          key: 'age',
          label: 'Age',
          type: 'number',
          placeholder: 'Enter your age',
          required: true,
        },
        {
          key: 'familyStatus',
          label: 'Family Status',
          type: 'select',
          options: ['Single', 'Married', 'Divorced', 'Widowed', 'Domestic Partnership'],
          required: true,
        },
        {
          key: 'dependents',
          label: 'Number of Dependents',
          type: 'number',
          placeholder: 'How many people depend on your income?',
          required: true,
        },
        {
          key: 'income',
          label: 'Annual Income',
          type: 'number',
          placeholder: 'Enter your annual income',
          required: true,
        },
      ]
    },
    {
      title: "Financial Situation & Goals",
      fields: [
        {
          key: 'debtAmount',
          label: 'Total Debt Amount',
          type: 'number',
          placeholder: 'Enter your total debt amount (optional)',
          required: false,
        },
        {
          key: 'savingsAmount',
          label: 'Current Savings',
          type: 'number',
          placeholder: 'Enter your current savings amount (optional)',
          required: false,
        },
        {
          key: 'financialGoals',
          label: 'Primary Financial Goals',
          type: 'select',
          options: ['Build Emergency Fund', 'Pay Off Debt', 'Save for Retirement', 'Buy a Home', 'Investment Growth'],
          required: true,
        },
        {
          key: 'riskTolerance',
          label: 'Risk Tolerance',
          type: 'select',
          options: ['Conservative', 'Moderate', 'Aggressive'],
          required: true,
        },
      ]
    },
    {
      title: "Benefits & Insurance Needs",
      fields: [
        {
          key: 'healthStatus',
          label: 'Health Status',
          type: 'select',
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Prefer not to say'],
          required: true,
        },
        {
          key: 'currentBenefits',
          label: 'Current Benefits',
          type: 'select',
          options: ['None', 'Basic', 'Comprehensive', 'Premium'],
          required: true,
        },
        {
          key: 'benefitsPriority',
          label: 'Benefits Priority',
          type: 'select',
          options: ['Health Insurance', 'Dental/Vision', 'Retirement', 'Life Insurance'],
          required: true,
        },
        {
          key: 'insuranceNeeds',
          label: 'Additional Insurance Needs',
          type: 'select',
          options: ['Life Insurance', 'Disability Insurance', 'Long-term Care', 'No additional needs'],
          required: true,
        },
      ]
    },
  ];

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    const requiredFields = currentQuestion.fields.filter(field => field.required);
    
    for (const field of requiredFields) {
      if (!formData[field.key as keyof FormData]) {
        Alert.alert('Required Field', `Please fill in ${field.label}`);
        return;
      }
    }
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const profile: Partial<UserProfile> = {
        age: parseInt(formData.age),
        income: parseFloat(formData.income),
        familyStatus: formData.familyStatus,
        dependents: parseInt(formData.dependents),
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

      await database.saveUserProfile(profile);
      Alert.alert('Success', 'Profile saved successfully!', [
        { text: 'OK', onPress: onComplete }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.key as keyof FormData];

    if (field.type === 'select') {
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label} *</Text>
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {field.options.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  value === option && styles.selectedOption
                ]}
                onPress={() => updateFormData(field.key, option)}
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
      <View key={field.key} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.label} {field.required ? '*' : ''}
        </Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={(text) => updateFormData(field.key, text)}
          placeholder={field.placeholder}
          keyboardType={field.type === 'number' ? 'numeric' : 'default'}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Abe!</Text>
          <Text style={styles.subtitle}>
            Let's create your personalized financial profile
          </Text>
          <Text style={styles.progress}>
            Step {currentStep + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / questions.length) * 100}%` }
          ]} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{questions[currentStep].title}</Text>
          
          {questions[currentStep].fields.map(renderField)}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === questions.length - 1 ? 'Complete' : 'Next'}
            </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    paddingTop: 50,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  progress: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  optionsContainer: {
    maxHeight: 200,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
