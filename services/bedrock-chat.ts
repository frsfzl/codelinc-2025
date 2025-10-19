// AWS Bedrock Knowledge Base Chat Service
const AWS_REGION = 'us-east-1';
const KNOWLEDGE_BASE_ID = 'OQEBEL880T';
const MODEL_ARN = 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0';

// For now, we'll use a simple proxy endpoint or direct API call
// You'll need to set up AWS credentials or use a backend proxy
const BEDROCK_PROXY_ENDPOINT = 'https://dsniwxccj3.execute-api.us-east-1.amazonaws.com/teststage/search';

class BedrockKBChat {
  /**
   * Chat with the Bedrock knowledge base
   */
  async chat(query: string): Promise<string> {
    try {
      console.log('Sending query to Bedrock KB:', query);
      
      // For now, using the Lambda proxy, but this should be replaced with direct Bedrock calls
      const response = await fetch(BEDROCK_PROXY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
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
        
        console.log('Final response before shortening:', finalResponse);
        
        // Make the response shorter and more concise
        if (finalResponse.length > 400) {
          // Split by sentences and take the first 3 most relevant sentences
          const sentences = finalResponse.split('. ');
          const shortResponse = sentences.slice(0, 3).join('. ') + '.';
          
          // If still too long, truncate at word boundary
          if (shortResponse.length > 300) {
            const words = shortResponse.split(' ');
            return words.slice(0, 40).join(' ') + '...';
          }
          
          return shortResponse;
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
