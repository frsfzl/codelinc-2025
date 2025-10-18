import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface BeautifulChatProps {
  assistantId: string;
}

export default function BeautifulChat({ assistantId }: BeautifulChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = new Animated.Value(0);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isLoading]);

  const speakText = async (text: string) => {
    try {
      if (!text || typeof text !== 'string') return;
      
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Speech error:', error);
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
    if (messages.length > 0) return;

    setIsLoading(true);
    
    try {
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

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <Image 
        source={{ uri: 'https://cdn4.iconfinder.com/data/icons/democracy/500/Political_14-512.png' }}
        style={styles.avatar}
      />
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, { opacity: typingAnimation }]}>
          <View style={styles.dot} />
        </Animated.View>
        <Animated.View style={[styles.typingDot, { opacity: typingAnimation }]}>
          <View style={styles.dot} />
        </Animated.View>
        <Animated.View style={[styles.typingDot, { opacity: typingAnimation }]}>
          <View style={styles.dot} />
        </Animated.View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with Avatar */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://cdn4.iconfinder.com/data/icons/democracy/500/Political_14-512.png' }}
          style={styles.headerAvatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Abe</Text>
          <Text style={styles.headerStatus}>
            {isSpeaking ? '🔊 Speaking...' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={clearConversation} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <Image 
              source={{ uri: 'https://cdn4.iconfinder.com/data/icons/democracy/500/Political_14-512.png' }}
              style={styles.welcomeAvatar}
            />
            <Text style={styles.welcomeTitle}>Welcome to Abe Chat!</Text>
            <Text style={styles.welcomeSubtitle}>
              Your AI assistant is ready to help you with any questions or tasks.
            </Text>
            <TouchableOpacity
              style={[styles.startButton, isLoading && styles.disabledButton]}
              onPress={startConversation}
              disabled={isLoading}
            >
              <Text style={styles.startButtonText}>
                {isLoading ? 'Starting...' : '✨ Start Conversation'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
                ]}
              >
                {!message.isUser && (
                  <Image 
                    source={{ uri: 'https://cdn4.iconfinder.com/data/icons/democracy/500/Political_14-512.png' }}
                    style={styles.messageAvatar}
                  />
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.assistantText,
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[
                    styles.timestamp,
                    message.isUser ? styles.userTimestamp : styles.assistantTimestamp,
                  ]}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {message.isUser && (
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>You</Text>
                  </View>
                )}
              </View>
            ))}
            
            {isLoading && <TypingIndicator />}
          </>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.disabledSendButton,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  headerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e74c3c',
    borderRadius: 16,
  },
  clearBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  userBubble: {
    backgroundColor: '#3498db',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 4,
    borderWidth: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#ffffff',
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: '#666666',
    textAlign: 'left',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 0,
    marginLeft: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bdc3c7',
    marginHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bdc3c7',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledSendButton: {
    backgroundColor: '#bdc3c7',
  },
});
