import * as SQLite from 'expo-sqlite';

// Initialize database
const db = SQLite.openDatabaseSync('user_profile.db');

export interface UserProfile {
  id: number;
  age: number;
  income: number;
  familyStatus: string;
  dependents: number;
  healthStatus: string;
  financialGoals: string;
  riskTolerance: string;
  currentBenefits: string;
  debtAmount: number;
  savingsAmount: number;
  emergencyFund: number;
  investmentExperience: string;
  retirementPlanning: string;
  insuranceNeeds: string;
  educationGoals: string;
  homeownershipStatus: string;
  employmentType: string;
  workLocation: string;
  benefitsPriority: string;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  async initDatabase(): Promise<void> {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          age INTEGER,
          income REAL,
          family_status TEXT,
          dependents INTEGER,
          health_status TEXT,
          financial_goals TEXT,
          risk_tolerance TEXT,
          current_benefits TEXT,
          debt_amount REAL,
          savings_amount REAL,
          emergency_fund REAL,
          investment_experience TEXT,
          retirement_planning TEXT,
          insurance_needs TEXT,
          education_goals TEXT,
          homeownership_status TEXT,
          employment_type TEXT,
          work_location TEXT,
          benefits_priority TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('Database init error:', error);
      throw error;
    }
  }

  async saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      // First, check if profile exists
      const existingProfile = db.getFirstSync('SELECT id FROM user_profile LIMIT 1');
      
      if (existingProfile) {
        // Update existing profile
        db.runSync(
          `UPDATE user_profile SET 
            age = ?, income = ?, family_status = ?, dependents = ?,
            health_status = ?, financial_goals = ?, risk_tolerance = ?,
            current_benefits = ?, debt_amount = ?, savings_amount = ?,
            emergency_fund = ?, investment_experience = ?, retirement_planning = ?,
            insurance_needs = ?, education_goals = ?, homeownership_status = ?,
            employment_type = ?, work_location = ?, benefits_priority = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
          [
            profile.age, profile.income, profile.familyStatus, profile.dependents,
            profile.healthStatus, profile.financialGoals, profile.riskTolerance,
            profile.currentBenefits, profile.debtAmount, profile.savingsAmount,
            profile.emergencyFund, profile.investmentExperience, profile.retirementPlanning,
            profile.insuranceNeeds, profile.educationGoals, profile.homeownershipStatus,
            profile.employmentType, profile.workLocation, profile.benefitsPriority,
            existingProfile.id
          ]
        );
      } else {
        // Insert new profile
        db.runSync(
          `INSERT INTO user_profile (
            age, income, family_status, dependents, health_status, financial_goals,
            risk_tolerance, current_benefits, debt_amount, savings_amount, emergency_fund,
            investment_experience, retirement_planning, insurance_needs, education_goals,
            homeownership_status, employment_type, work_location, benefits_priority
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            profile.age, profile.income, profile.familyStatus, profile.dependents,
            profile.healthStatus, profile.financialGoals, profile.riskTolerance,
            profile.currentBenefits, profile.debtAmount, profile.savingsAmount,
            profile.emergencyFund, profile.investmentExperience, profile.retirementPlanning,
            profile.insuranceNeeds, profile.educationGoals, profile.homeownershipStatus,
            profile.employmentType, profile.workLocation, profile.benefitsPriority
          ]
        );
      }
    } catch (error) {
      console.error('Save profile error:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const row = db.getFirstSync('SELECT * FROM user_profile LIMIT 1');
      
      if (row) {
        return {
          id: row.id,
          age: row.age,
          income: row.income,
          familyStatus: row.family_status,
          dependents: row.dependents,
          healthStatus: row.health_status,
          financialGoals: row.financial_goals,
          riskTolerance: row.risk_tolerance,
          currentBenefits: row.current_benefits,
          debtAmount: row.debt_amount,
          savingsAmount: row.savings_amount,
          emergencyFund: row.emergency_fund,
          investmentExperience: row.investment_experience,
          retirementPlanning: row.retirement_planning,
          insuranceNeeds: row.insurance_needs,
          educationGoals: row.education_goals,
          homeownershipStatus: row.homeownership_status,
          employmentType: row.employment_type,
          workLocation: row.work_location,
          benefitsPriority: row.benefits_priority,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async deleteUserProfile(): Promise<void> {
    try {
      db.runSync('DELETE FROM user_profile');
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      return profile !== null && profile.age !== null && profile.income !== null;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }
}

export default new DatabaseService();
