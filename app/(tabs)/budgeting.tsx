import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const budgetingLessons = [
  "Let's start with the basics! Budgeting is simply tracking your income and expenses to make sure you're spending less than you earn. Think of it as a roadmap for your money.",
  "First, let's calculate your monthly income. This includes your salary, side hustles, or any other money coming in. Write down your total monthly income after taxes.",
  "Next, list your fixed expenses - these are costs that stay the same each month like rent, insurance, loan payments, and subscriptions. These are your 'must-pay' bills.",
  "Now for variable expenses - things like groceries, gas, entertainment, and dining out. These can change month to month, which is where you have control!",
  "Here's the 50/30/20 rule: 50% of income for needs (rent, groceries), 30% for wants (entertainment, dining out), and 20% for savings and debt payments.",
  "Let's talk about tracking. You can use apps, spreadsheets, or even pen and paper. The key is to record every expense for at least a month to see your spending patterns.",
  "Emergency funds are crucial! Start by saving $500-$1000 for unexpected expenses. This prevents you from going into debt when life happens.",
  "Pay yourself first! Set up automatic transfers to savings right after you get paid. Even $25/week adds up to $1,300 per year!",
  "Review and adjust monthly. Your budget isn't set in stone - life changes, and your budget should adapt. The goal is progress, not perfection!"
];

export default function BudgetingScreen() {
  const [messages, setMessages] = useState([
    { role: 'model', text: "Welcome to Budgeting Basics! I'm here to guide you step by step. How would you like to continue?" }
  ]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();

  const nextLesson = () => {
    if (currentLesson < budgetingLessons.length) {
      const lesson = { role: 'model', text: budgetingLessons[currentLesson] };
      setMessages(prev => [...prev, lesson]);
      setCurrentLesson(prev => prev + 1);
    } else {
      setMessages(prev => [...prev, { role: 'model', text: "You've completed all the lessons! 🎉" }]);
    }
  };

  const startQuiz = () => {
    setMessages(prev => [...prev, { role: 'model', text: "📝 Quiz functionality coming soon! For now, keep learning." }]);
  };

  const recommendVideo = () => {
    setMessages(prev => [...prev, { role: 'model', text: "📺 Recommended: Search 'Budgeting for Beginners' by  for great visual guides." }]);
  };

  const iHaveAQuestion = () => {
    setMessages(prev => [...prev, { role: 'model', text: "❓ Ask away! For now, this will be replaced by an AI Q&A feature later." }]);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={{ paddingVertical: 20, flexGrow: 1, justifyContent: 'flex-end' }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.message,
                msg.role === 'user' ? styles.userMessageContainer : styles.botMessageContainer
              ]}
            >
              <ThemedView
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userMessage : styles.botMessage
                ]}
              >
                <ThemedText
                  style={msg.role === 'user' ? styles.userMessageText : styles.botMessageText}
                >
                  {msg.text}
                </ThemedText>
              </ThemedView>
            </View>
          ))}
        </ScrollView>

        {/* BUTTON GROUP AT THE BOTTOM */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.quizButton]} onPress={startQuiz}>
            <Ionicons name="help-circle-outline" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>Quiz Me</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.videoButton]} onPress={recommendVideo}>
            <Ionicons name="videocam-outline" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>Recommend a Video</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.questionButton]} onPress={iHaveAQuestion}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>I Have a Question</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.nextButton]} onPress={nextLesson}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
            <ThemedText style={styles.buttonText}>Next</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  message: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    maxWidth: '85%',
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  userMessage: {
    backgroundColor: '#3A3A3A',
  },
  botMessage: {
    backgroundColor: '#1E1E1E',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  botMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 0.5,
    borderTopColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    margin: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quizButton: {
    backgroundColor: '#FF9500',
  },
  videoButton: {
    backgroundColor: '#34C759',
  },
  questionButton: {
    backgroundColor: '#5856D6',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
});
