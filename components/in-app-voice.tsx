import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface InAppVoiceProps {
  assistantId: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function InAppVoice({ assistantId }: InAppVoiceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = async (text: string) => {
    try {
      if (!text || typeof text !== 'string') {
        console.warn('Invalid text for speech:', text);
        return;
      }
      
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Speech error:', error);
      // Don't throw the error, just log it and continue
    } finally {
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      // Create conversation history for VAPI
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        message: msg.text,
        time: msg.timestamp.getTime() / 1000,
        secondsFromStart: (msg.timestamp.getTime() - messages[0].timestamp.getTime()) / 1000
      }));

      // Send message to VAPI using the correct chat API
      const response = await fetch('https://api.vapi.ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer d11280bb-c28a-4a43-976a-396214db773a',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistantId,
          input: currentInput,
        }),
      });

      let aiResponse = '';
      
      if (response.ok) {
        const result = await response.json();
        console.log('VAPI chat response:', result);
        
        // Extract response from VAPI chat format
        if (result.output && result.output.length > 0) {
          const lastOutput = result.output[result.output.length - 1];
          aiResponse = lastOutput.content || lastOutput.message || 'I understand your message. How can I help you further?';
        } else if (result.message) {
          aiResponse = result.message;
        } else {
          aiResponse = 'I understand your message. How can I help you further?';
        }
      } else {
        const errorText = await response.text();
        console.error('VAPI API error:', response.status, errorText);
        aiResponse = `I received your message: "${currentInput}". How can I help you with that?`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      await speakText(aiResponse);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing your message right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await speakText(errorMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    if (messages.length > 0) return; // Already started

    setIsLoading(true);
    
    try {
      // Create a new chat session with VAPI
      const response = await fetch('https://api.vapi.ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer d11280bb-c28a-4a43-976a-396214db773a',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistantId,
          input: "Hello! Start the conversation.",
        }),
      });

      let firstMessage = "Hi! I'm Abe, your AI assistant. How can I help you today?";
      
      if (response.ok) {
        const result = await response.json();
        console.log('VAPI initial chat response:', result);
        
        // Extract first message from VAPI response
        if (result.output && result.output.length > 0) {
          const lastOutput = result.output[result.output.length - 1];
          firstMessage = lastOutput.content || lastOutput.message || firstMessage;
        } else if (result.message) {
          firstMessage = result.message;
        }
      } else {
        console.error('VAPI initial chat error:', response.status);
      }

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: firstMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      await speakText(firstMessage);

    } catch (error) {
      console.error('Error starting conversation:', error);
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hi! I'm Abe, your AI assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      await speakText(welcomeMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    Speech.stop();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Chat with Abe
      </ThemedText>
      
      {messages.length === 0 && (
        <ThemedView style={styles.welcomeContainer}>
          <ThemedText style={styles.welcomeText}>
            Start a conversation with your AI assistant Abe
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, styles.startButton, isLoading && styles.disabledButton]}
            onPress={startConversation}
            disabled={isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Starting...' : '💬 Start Chat'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {messages.length > 0 && (
        <ThemedView style={styles.chatContainer}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.headerText}>Chat with Abe</ThemedText>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearConversation}
            >
              <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <ThemedView
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <ThemedText style={styles.messageText}>{message.text}</ThemedText>
                <ThemedText style={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </ThemedView>
            ))}
            
            {isLoading && (
              <ThemedView style={[styles.messageBubble, styles.assistantMessage]}>
                <ThemedText style={styles.loadingText}>Abe is typing...</ThemedText>
              </ThemedView>
            )}
          </ScrollView>

          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.disabledButton,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <ThemedText style={styles.sendButtonText}>
                {isLoading ? '...' : 'Send'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {isSpeaking && (
            <ThemedView style={styles.speakingIndicator}>
              <ThemedText style={styles.speakingText}>🔊 Abe is speaking...</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  welcomeContainer: {
    alignItems: 'center',
    gap: 20,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    opacity: 0.8,
  },
  chatContainer: {
    flex: 1,
    gap: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    maxHeight: 400,
    gap: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
    marginVertical: 4,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  speakingIndicator: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  speakingText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});