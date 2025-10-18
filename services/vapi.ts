// VAPI configuration
const VAPI_API_KEY = 'd11280bb-c28a-4a43-976a-396214db773a';
const VAPI_BASE_URL = 'https://api.vapi.ai';

class VapiService {
  private assistantId: string | null = null;

  constructor() {
    // No initialization needed for REST API approach
  }

  /**
   * Use existing Abe assistant from dashboard
   */
  async createAssistant(): Promise<string> {
    // Use the existing Abe assistant ID from your dashboard
    const existingAssistantId = 'cfef47df-38fe-4955-9951-f606f1c301b7'; // Abe assistant ID
    
    this.assistantId = existingAssistantId;
    console.log('Using existing Abe assistant:', existingAssistantId);
    return existingAssistantId;
  }

  /**
   * Start a voice call
   */
  async startCall(phoneNumber?: string): Promise<string> {
    try {
      console.log('Starting call with phone number:', phoneNumber);
      
      if (!this.assistantId) {
        console.log('No assistant ID, getting one...');
        await this.getAssistantId();
      }

      const callData: any = {
        assistantId: this.assistantId,
        // Remove phoneNumberId for in-app calling
      };

      // For in-app calling, we don't need customer phone number
      // The call will happen within the app interface

      console.log('Call data:', JSON.stringify(callData, null, 2));
      console.log('Making API request to:', `${VAPI_BASE_URL}/call`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${VAPI_BASE_URL}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Call creation failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const call = await response.json();
      console.log('Call started successfully:', call.id);
      return call.id;
    } catch (error) {
      console.error('Error starting call:', error);
      if (error.name === 'AbortError') {
        throw new Error('Call request timed out. Please check your internet connection and try again.');
      }
      if (error.message.includes('fetch failed') || error.message.includes('Network request failed')) {
        throw new Error('Network error: Cannot connect to VAPI servers. Please check your internet connection and try again.');
      }
      if (error.message.includes('Connection error')) {
        throw new Error('Connection error: VAPI servers are unreachable. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Test network connectivity to VAPI
   */
  async testNetworkConnectivity(): Promise<boolean> {
    try {
      console.log('Testing network connectivity to VAPI...');
      const response = await fetch(`${VAPI_BASE_URL}/workflow`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Network test response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Network connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Start a call to the default phone number
   */
  async startCallToDefaultNumber(): Promise<string> {
    const defaultPhoneNumber = '+19896606519'; // Your provided number
    console.log('Starting call to default number:', defaultPhoneNumber);
    
    // Test network connectivity first
    const isConnected = await this.testNetworkConnectivity();
    if (!isConnected) {
      throw new Error('Network connectivity test failed. Please check your internet connection.');
    }
    
    return await this.startCall(defaultPhoneNumber);
  }

  /**
   * End a call
   */
  async endCall(callId: string): Promise<void> {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${callId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Call ended:', callId);
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }

  /**
   * Get call status
   */
  async getCallStatus(callId: string): Promise<any> {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const call = await response.json();
      return call;
    } catch (error) {
      console.error('Error getting call status:', error);
      throw error;
    }
  }

  /**
   * List all calls
   */
  async listCalls(): Promise<any[]> {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const calls = await response.json();
      return calls.data || calls;
    } catch (error) {
      console.error('Error listing calls:', error);
      throw error;
    }
  }

  /**
   * List existing workflows
   */
  async listAssistants(): Promise<any[]> {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/workflow`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const workflows = await response.json();
      return workflows.data || workflows;
    } catch (error) {
      console.error('Error listing workflows:', error);
      throw error;
    }
  }

  /**
   * Get or create assistant ID
   */
  async getAssistantId(): Promise<string> {
    if (!this.assistantId) {
      try {
        // First try to get existing assistants
        const assistants = await this.listAssistants();
        if (assistants && assistants.length > 0) {
          // Use the first available assistant
          this.assistantId = assistants[0].id;
          console.log('Using existing assistant:', this.assistantId);
          return this.assistantId;
        }
      } catch (error) {
        console.log('Could not list assistants, creating new one:', error);
      }
      
      // If no existing assistants or error, create a new one
      return await this.createAssistant();
    }
    return this.assistantId;
  }
}

export default new VapiService();
