import database, { UserProfile } from './database';

// AWS Bedrock Knowledge Base Chat Service
const AWS_REGION = 'us-east-1';
const KNOWLEDGE_BASE_ID = 'OQEBEL880T';
const MODEL_ARN = 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0';

// For now, we'll use a simple proxy endpoint or direct API call
// You'll need to set up AWS credentials or use a backend proxy
const BEDROCK_PROXY_ENDPOINT = 'https://dsniwxccj3.execute-api.us-east-1.amazonaws.com/teststage/search';

class BedrockKBChat {
  /**
   * Format user profile data for context
   */
  private formatUserProfile(profile: UserProfile | null): string {
    if (!profile) return '';
    
    const context = [
      `User Profile:`,
      `- Age: ${profile.age}`,
      `- Family Status: ${profile.familyStatus}`,
      `- Dependents: ${profile.dependents}`,
      `- Annual Income: $${profile.income?.toLocaleString()}`,
      `- Financial Goals: ${profile.financialGoals}`,
      `- Risk Tolerance: ${profile.riskTolerance}`,
      `- Health Status: ${profile.healthStatus}`,
      `- Current Benefits: ${profile.currentBenefits}`,
      `- Benefits Priority: ${profile.benefitsPriority}`,
    ];
    
    if (profile.debtAmount && profile.debtAmount > 0) {
      context.push(`- Total Debt: $${profile.debtAmount.toLocaleString()}`);
    }
    if (profile.savingsAmount && profile.savingsAmount > 0) {
      context.push(`- Current Savings: $${profile.savingsAmount.toLocaleString()}`);
    }
    if (profile.emergencyFund && profile.emergencyFund > 0) {
      context.push(`- Emergency Fund: $${profile.emergencyFund.toLocaleString()}`);
    }
    
    return context.join('\n');
  }

  /**
   * Chat with the Bedrock knowledge base
   */
  async chat(query: string): Promise<string> {
    try {
      console.log('Sending query to Bedrock KB:', query);
      
      // Get user profile data
      const userProfile = await database.getUserProfile();
      const profileContext = this.formatUserProfile(userProfile);
      
      // Create enhanced query with user context
      const enhancedQuery = profileContext 
        ? `${query}\n\nUser Context:\n${profileContext}`
        : query;
      
      console.log('Enhanced query with user context:', enhancedQuery);
      
      // For now, using the Lambda proxy, but this should be replaced with direct Bedrock calls
      const response = await fetch(BEDROCK_PROXY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: enhancedQuery }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bedrock KB error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed JSON data:', data);
        
        // Handle API Gateway Lambda response format
        let finalResponse = '';
        if (data.body) {
          // Lambda returns the actual content in the body field
          console.log('Found body field:', data.body);
          finalResponse = data.body;
        } else {
          // Fallback to other possible formats
          finalResponse = data.result || data.answer || data.message || JSON.stringify(data);
        }
        
            console.log('Final response before processing:', finalResponse);
            
            // Smart response processing - keep relevant info but make it more readable
            if (finalResponse.length > 800) {
              // Split by paragraphs first
              const paragraphs = finalResponse.split('\n\n');
              let processedResponse = '';
              
              // Take first 2 paragraphs if they exist
              if (paragraphs.length >= 2) {
                processedResponse = paragraphs.slice(0, 2).join('\n\n');
              } else {
                // If no clear paragraphs, split by sentences
                const sentences = finalResponse.split('. ');
                processedResponse = sentences.slice(0, 4).join('. ') + '.';
              }
              
              // If still too long, truncate more intelligently
              if (processedResponse.length > 600) {
                const sentences = processedResponse.split('. ');
                processedResponse = sentences.slice(0, 3).join('. ') + '.';
              }
              
              return processedResponse;
            }
            
            return finalResponse;
      } catch (parseError) {
        console.log('Response is not JSON, returning as text:', responseText);
        return responseText;
      }
    } catch (error) {
      console.error('Error querying Bedrock KB:', error);
      throw error;
    }
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chat('Hello, are you working?');
      return response && response.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default new BedrockKBChat();
