import bedrockChat from '@/services/bedrock-chat';
import database from '@/services/database';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import OnboardingQuestionnaire from './onboarding-questionnaire';

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
  const [showPalmUp, setShowPalmUp] = useState(false);
  const [showPhoneImage, setShowPhoneImage] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = new Animated.Value(0);
  
  // Animation for crossfade between images
  const firstImageOpacity = useRef(new Animated.Value(1)).current;
  const secondImageOpacity = useRef(new Animated.Value(0)).current;
  const phoneImageOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation for slide down
  const imageSlideDown = useRef(new Animated.Value(0)).current;
  const chatSlideIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await database.hasCompletedOnboarding();
      if (!hasCompleted) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };


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
      console.log('Querying Bedrock KB with:', currentInput);
      const aiResponse = await bedrockChat.chat(currentInput);
      console.log('Bedrock KB response:', aiResponse);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      await speakText(aiResponse);

    } catch (error) {
      console.error('Error querying Bedrock KB:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble accessing my knowledge base right now. Please try again.",
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

    console.log('Starting crossfade animation...');
    setIsLoading(true);
    
    // Step 1: Crossfade to palm up image
    // First image fades out while second image fades in simultaneously
    Animated.parallel([
      Animated.timing(firstImageOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(secondImageOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      console.log('Crossfade complete, starting slide down animation...');
      
      // Step 2: Lincoln slides down out of screen while message slides in from top
      setTimeout(() => {
        // Lincoln slides down and out of screen
        Animated.timing(imageSlideDown, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start(() => {
          console.log('Slide animation complete, starting conversation...');
          
              // Step 3: Slide in the chat interface from top
              setTimeout(() => {
                try {
                  const welcomeMessage: Message = {
                    id: Date.now().toString(),
                    text: "Hi! I'm Abe, your AI assistant powered by Lincoln Financial's knowledge base. I can help you with questions about financial planning, retirement, insurance, and more. What would you like to know?",
                    isUser: false,
                    timestamp: new Date(),
                  };

                  // Start with message off-screen at the top
                  setMessages([welcomeMessage]);
                  
                  // Animate the chat sliding in from top
                  Animated.timing(chatSlideIn, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                  }).start(() => {
                    speakText(welcomeMessage.text);
                    setIsLoading(false);
                  });

                } catch (error) {
                  console.error('Error starting conversation:', error);
                  
                  const welcomeMessage: Message = {
                    id: Date.now().toString(),
                    text: "Hi! I'm Abe, your AI assistant. How can I help you today?",
                    isUser: false,
                    timestamp: new Date(),
                  };

                  setMessages([welcomeMessage]);
                  Animated.timing(chatSlideIn, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                  }).start(() => {
                    speakText(welcomeMessage.text);
                    setIsLoading(false);
                  });
                }
              }, 300); // Small delay before chat slides in
        });
      }, 800); // Delay to show the palm up image before sliding
    });
  };

  const clearConversation = () => {
    setMessages([]);
    setShowPalmUp(false);
    setShowPhoneImage(false);
    firstImageOpacity.setValue(1);
    secondImageOpacity.setValue(0);
    phoneImageOpacity.setValue(0);
    imageSlideDown.setValue(0);
    chatSlideIn.setValue(0);
    Speech.stop();
  };

  const goBackToHome = () => {
    clearConversation();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };


  const callAbe = async () => {
    // Transition to phone image
    setShowPhoneImage(true);
    Animated.timing(phoneImageOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    const phoneNumber = '+19896606519'; // Your VAPI phone number
    const phoneUrl = `tel:${phoneNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        console.log('Phone calls are not supported on this device');
      }
    } catch (error) {
      console.error('Error opening phone app:', error);
    }
  };

  const renderClickableText = (text: string, isUser: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => Linking.openURL(part)}
          >
            <Text style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
              styles.linkText
            ]}>
              {part}
            </Text>
          </TouchableOpacity>
        );
      }
      return (
        <Text key={index} style={[
          styles.messageText,
          isUser ? styles.userText : styles.assistantText,
        ]}>
          {part}
        </Text>
      );
    });
  };

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <Image 
        source={require('@/lincoln.png')}
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

  if (showOnboarding) {
    return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
            {messages.length > 0 && (
              <TouchableOpacity onPress={goBackToHome} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            )}
        <View style={styles.headerInfo}>
          <Text style={styles.headerStatus}>
            {isSpeaking ? '🔊 Speaking...' : ''}
          </Text>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.messagesContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
              <View style={styles.welcomeContainer}>
                <View style={styles.imageContainer}>
                  {/* Lincoln image - slides down */}
                  <Animated.Image 
                    source={require('@/lincoln.png')}
                    style={[
                      styles.welcomeImage,
                      { 
                        opacity: showPhoneImage ? 0 : 1,
                        transform: [
                          {
                            translateY: imageSlideDown.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 800]
                            })
                          }
                        ]
                      }
                    ]}
                  />
                  
                  {/* Lincoln phone image */}
                  <Animated.Image 
                    source={require('@/lincolnphone.png')}
                    style={[
                      styles.welcomeImage,
                      { 
                        opacity: phoneImageOpacity,
                        transform: [
                          {
                            translateY: imageSlideDown.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 800]
                            })
                          }
                        ]
                      }
                    ]}
                  />
                </View>
              
              <Animated.View style={[
                styles.buttonContainer,
                {
                  transform: [
                    {
                      translateY: imageSlideDown.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 800]
                      })
                    }
                  ]
                }
              ]}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={callAbe}
                >
                  <Text style={styles.callButtonText}>📞 Call Abe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={startConversation}
                  disabled={isLoading}
                >
                  <Text style={styles.chatButtonText}>
                    {isLoading ? 'Starting...' : '💬 Start Chat'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            ) : (
              <Animated.View style={[
                styles.chatContainer,
                {
                  transform: [
                    {
                      translateY: chatSlideIn.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 0] // Start above screen, slide down to normal position
                      })
                    }
                  ]
                }
              ]}>
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
                      source={require('@/lincoln.png')}
                      style={styles.messageAvatar}
                    />
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    {renderClickableText(message.text, message.isUser)}
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
              
                {isLoading && messages.length > 0 && <TypingIndicator />}
              </Animated.View>
            )}
        </ScrollView>
      </View>

          {/* Input Area - Only show when in chat mode */}
          {messages.length > 0 && (
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
          )}
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
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
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#34495e',
    borderRadius: 16,
    marginRight: 12,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  callBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#27ae60',
    borderRadius: 16,
    marginRight: 8,
  },
  callBtnText: {
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
  chatContainer: {
    flex: 1,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 920,
    paddingBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 350,
  },
  welcomeImage: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
    position: 'absolute',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  callButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 120,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 120,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
        width: 24,
        height: 24,
        borderRadius: 12,
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
  linkText: {
    color: '#3498db',
    textDecorationLine: 'underline',
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
