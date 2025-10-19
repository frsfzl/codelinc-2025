import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View, Animated, Image, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';

const ARTICLE_MARKDOWN = `# Budgeting Basics: The Foundation of Financial Freedom

Budgeting isn't about restricting your life—it's about **understanding and taking control of your money**. A budget is a plan that shows you how much money is coming in, how much is going out, and what's left to save or invest. Whether you're a student just starting to earn or an adult looking to build financial stability, budgeting is the first step toward financial independence.

A simple way to think about budgeting is like a **GPS for your money**. Without it, your finances can feel lost and directionless. But with a budget, you know exactly where your money should go—and why.

## Step 1: Understanding Your Income and Expenses

The first step in building a budget is knowing how much money you make (income) and how much you spend (expenses).
Your **income** might include your salary, side hustles, allowance, or other earnings.
Your **expenses** include everything you pay for—like rent, transportation, groceries, entertainment, and subscriptions.

It's important to **track your spending for at least one month** to get an accurate picture of where your money goes. Many people are surprised when they see how small purchases—like coffee or snacks—add up over time.

**Quick Tip:** Use a budgeting app or a spreadsheet to list your income and categorize your expenses.

---

**QUESTION1**<!--insert-->
## Step 2: Creating a Spending Plan

Once you know where your money is going, the next step is to create a **spending plan**. One popular approach is the **50/30/20 rule**:
- 50% of your income goes to needs (like rent, groceries, transportation)
- 30% goes to wants (like eating out or streaming services)
- 20% goes to savings and debt repayment

This rule isn't set in stone—it's a starting point to help guide your decisions.

---

**QUESTION2**<!--insert-->
## Step 3: Emergency Savings

Life is unpredictable. That's why an **emergency fund** is crucial. It's money set aside for unexpected expenses, like medical bills, car repairs, or job loss.
Most experts recommend saving **3 to 6 months of living expenses** in an easily accessible account.

Your emergency fund gives you **financial security** and protects you from going into debt when life throws surprises your way.

---

**QUESTION3**<!--insert-->
## Step 4: Managing Debt Wisely

Debt isn't always bad—but it must be managed carefully. Student loans, credit cards, and personal loans can be helpful when used responsibly. But **high-interest debt**, like credit card balances you don't pay off, can quickly spiral out of control.

Two common methods to pay off debt are:
- **Snowball method:** Pay off the smallest debt first, then move to the next.
- **Avalanche method:** Pay off the highest-interest debt first to save more on interest.

Both methods work—the key is to **choose the one that keeps you consistent**.

---

**QUESTION4**<!--insert-->
## Step 5: Setting Financial Goals

Budgeting isn't just about paying bills—it's about **creating a roadmap to your dreams**. Maybe you want to save for a vacation, buy a car, build a business, or retire comfortably one day.

To make your goals real, follow the **SMART framework**:
- **S**pecific
- **M**easurable
- **A**chievable
- **R**elevant
- **T**ime-bound

Breaking your goals into smaller steps makes them less intimidating and more achievable.

---

**QUESTION5**<!--insert-->
## Step 6: Review and Adjust Regularly

A budget isn't something you set once and forget. Life changes—so should your budget. Review it at least once a month to see what's working and what isn't. Maybe you got a raise, your rent increased, or your priorities changed. Adjust your budget accordingly.

Think of budgeting as a **flexible tool**, not a strict rulebook. The goal isn't perfection—it's progress.

---

## Final Thoughts

Budgeting is the foundation of financial literacy. It gives you control, reduces stress, and sets you up for long-term success. Start today—your future self will thank you.
`;

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

const QUESTIONS: Question[] = [
  {
    id: 'QUESTION1',
    prompt: 'What is the first step in building a budget?',
    options: [
      'Choosing a savings account',
      'Tracking your income and expenses',
      'Buying budgeting software',
      'Cutting all entertainment costs',
    ],
    correctIndex: 1,
    explanation: 'You must know how much you earn and where you spend before creating a plan.',
  },
  {
    id: 'QUESTION2',
    prompt: 'Which rule splits income into needs, wants, and savings (50/30/20)?',
    options: ['50/30/20 rule', '70/20/10 rule', '30/50/20 rule', 'Budget-first rule'],
    correctIndex: 0,
    explanation: 'The 50/30/20 rule assigns 50% needs, 30% wants, 20% savings/debt.',
  },
  {
    id: 'QUESTION3',
    prompt: 'How many months of living expenses do experts recommend saving in an emergency fund?',
    options: ['1–2 months', '3–6 months', '7–10 months', '12 months'],
    correctIndex: 1,
    explanation: '3–6 months of living expenses is the typical recommendation.',
  },
  {
    id: 'QUESTION4',
    prompt: 'Which debt repayment strategy focuses on paying the highest-interest debt first?',
    options: ['Snowball method', 'Avalanche method', 'Waterfall method', 'Interest stacking'],
    correctIndex: 1,
    explanation: 'The avalanche method attacks highest-interest balances first to minimize interest paid.',
  },
  {
    id: 'QUESTION5',
    prompt: 'Why should you review your budget regularly?',
    options: [
      'To compare with your friends\' budget',
      'To make sure it still fits your current situation',
      'To impress your bank',
      'To increase your credit score automatically',
    ],
    correctIndex: 1,
    explanation: 'Budgets should adapt as your income, expenses, and priorities change.',
  },
];

function renderMarkdownToNodes(md: string) {
  const cleaned = md.replace(/<!--\s*insert\s*-->/g, '');
  const lines = cleaned.split('\n');
  const nodes: Array<{ type: string; content?: string; level?: number }> = [];
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (buffer.length) {
      nodes.push({ type: 'paragraph', content: buffer.join('\n').trim() });
      buffer = [];
    }
  };

  for (let rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('# ')) {
      flushBuffer();
      nodes.push({ type: 'heading', level: 1, content: line.replace(/^#\s*/, '') });
      continue;
    }
    if (line.startsWith('## ')) {
      flushBuffer();
      nodes.push({ type: 'heading', level: 2, content: line.replace(/^##\s*/, '') });
      continue;
    }
    if (line.startsWith('### ')) {
      flushBuffer();
      nodes.push({ type: 'heading', level: 3, content: line.replace(/^###\s*/, '') });
      continue;
    }

    if (line === '---') {
      flushBuffer();
      nodes.push({ type: 'hr' });
      continue;
    }

    if (line.includes('**QUESTION')) {
      const m = line.match(/\*\*QUESTION(\d+)\*\*/);
      if (m) {
        flushBuffer();
        nodes.push({ type: 'question', content: `QUESTION${m[1]}` });
        const remainder = line.replace(m[0], '').trim();
        if (remainder) buffer.push(remainder);
        continue;
      }
    }

    buffer.push(line);
  }

  flushBuffer();
  return nodes;
}

function InlineMarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^\*]+\*\*)/g).filter(Boolean);
  return (
    <ThemedText style={styles.paragraphText}>
      {parts.map((part, i) => {
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) {
          return (
            <ThemedText key={i} style={styles.boldText}>
              {boldMatch[1]}
            </ThemedText>
          );
        }
        return <ThemedText key={i}>{part}</ThemedText>;
      })}
    </ThemedText>
  );
}

function QuestionCard({
  question,
  qIndex,
  userAnswer,
  setUserAnswer,
  showReview,
}: {
  question: Question;
  qIndex: number;
  userAnswer: number | null;
  setUserAnswer: (idx: number) => void;
  showReview: boolean;
}) {
  return (
    <View style={styles.questionCard}>
      <ThemedText style={styles.questionPrompt}>
        {qIndex + 1}. {question.prompt}
      </ThemedText>

      {question.options.map((opt, idx) => {
        const selected = userAnswer === idx;
        const correct = question.correctIndex === idx;
        const showCorrect = showReview && correct;
        const showIncorrect = showReview && selected && !correct;

        return (
          <TouchableOpacity
            key={idx}
            style={[ 
              styles.optionButton,
              selected && styles.optionSelected,
              showCorrect && styles.optionCorrect,
              showIncorrect && styles.optionIncorrect,
            ]}
            onPress={() => {
              if (userAnswer === null) setUserAnswer(idx);
            }}
            disabled={userAnswer !== null}
          >
            <View style={styles.optionLabel}>
              <ThemedText style={styles.optionLabelText}>{String.fromCharCode(65 + idx)}</ThemedText>
            </View>
            <ThemedText style={styles.optionText}>{opt}</ThemedText>
            {showCorrect && (
              <ThemedText style={styles.optionBadge}>Correct</ThemedText>
            )}
            {showIncorrect && (
              <ThemedText style={styles.optionBadgeIncorrect}>Incorrect</ThemedText>
            )}
          </TouchableOpacity>
        );
      })}

      {userAnswer !== null && !showReview && (
        <View style={styles.feedbackRow}>
          {userAnswer === question.correctIndex ? (
            <ThemedText style={styles.correctText}>✅ Correct — {question.explanation}</ThemedText>
          ) : (
            <ThemedText style={styles.incorrectText}>❌ Incorrect — {question.explanation}</ThemedText>
          )}
        </View>
      )}
    </View>
  );
}

export default function BudgetingBasicsScreen() {
  const colorScheme = useColorScheme();
  const nodes = useMemo(() => renderMarkdownToNodes(ARTICLE_MARKDOWN), []);
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
  );
  const [showReview] = useState(false);
  const [coins, setCoins] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const coinAnimValue = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const { reset } = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      // Only reset if explicitly marked for reset
      if (reset === 'true') {
        setCoins(0);
        setAnswers(QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: null }), {}));
        router.setParams({ reset: undefined });
      }
      
      // Scroll to top when screen comes into focus
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
      return () => clearTimeout(timer);
    }, [reset])
  );

  const handleBackPress = () => {
    if (coins > 0) {
      Alert.alert(
        'Leave Activity?',
        'You will lose all your coins if you leave. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              setCoins(0);
              setAnswers(QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: null }), {}));
              router.push('/(tabs)/learning');
            }
          }
        ]
      );
    } else {
      router.push('/(tabs)/learning');
    }
  };

  const setUserAnswer = (qid: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
    
    // Only award coins if answer is correct
    const question = QUESTIONS.find(q => q.id === qid);
    if (question && idx === question.correctIndex) {
      setCoins(prev => prev + 500);
      setShowCoinAnimation(true);
      
      // Animate coin counter
      coinAnimValue.setValue(0);
      Animated.sequence([
        Animated.timing(coinAnimValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(coinAnimValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowCoinAnimation(false);
      });
    }
  };

  const score = Object.values(answers).reduce((sum, a, i) => {
    const q = QUESTIONS[i];
    if (a === null) return sum;
    return sum + (a === q.correctIndex ? 1 : 0);
  }, 0);

  const answeredQuestions = Object.values(answers).filter(a => a !== null).length;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Budgeting Basics</ThemedText>
          
          <View style={styles.coinContainer}>
            <Image source={require('@/assets/images/penny.png')} style={styles.pennyIcon} />
            <ThemedText style={styles.coinText}>{coins}</ThemedText>
            {showCoinAnimation && (
              <Animated.View 
                style={[
                  styles.coinAnimation,
                  {
                    opacity: coinAnimValue,
                    transform: [{
                      translateY: coinAnimValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={styles.coinAnimationText}>+500</ThemedText>
              </Animated.View>
            )}
          </View>
        </View>

        <ScrollView ref={scrollViewRef} style={styles.scroll} contentContainerStyle={{ padding: 24 }}>
          {nodes.map((node, idx) => {
            if (node.type === 'heading') {
              const headingStyle = node.level === 1 ? styles.h1 : node.level === 2 ? styles.h2 : styles.h3;
              return (
                <ThemedText key={idx} style={headingStyle}>
                  {node.content}
                </ThemedText>
              );
            }
            if (node.type === 'hr') {
              return <View key={idx} style={styles.hr} />;
            }
            if (node.type === 'paragraph') {
              return (
                <View key={idx} style={styles.paragraphContainer}>
                  <InlineMarkdownText text={node.content!} />
                </View>
              );
            }
            if (node.type === 'question') {
              const qId = node.content as string;
              const qIndex = QUESTIONS.findIndex(q => q.id === qId);
              if (qIndex === -1) return null;
              const q = QUESTIONS[qIndex];
              return (
                <QuestionCard
                  key={idx}
                  question={q}
                  qIndex={qIndex}
                  userAnswer={answers[q.id]}
                  setUserAnswer={(choice) => setUserAnswer(q.id, choice)}
                  showReview={showReview}
                />
              );
            }

            return null;
          })}

          <View style={{ height: 20 }} />

          <View style={styles.footer}>
            <ThemedText style={styles.scoreText}>
              Score: {score} / {QUESTIONS.length}
            </ThemedText>

            <TouchableOpacity
              style={styles.activityButton}
              onPress={() => router.push({ pathname: '/(tabs)/activity', params: { coins: coins.toString() } })}
            >
              <ThemedText style={styles.activityButtonText}>
                {answeredQuestions === 0 ? 'Begin Activity' : 'Finish Activity'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#0F1720' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', flex: 1 },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  pennyIcon: {
    width: 22,
    height: 22,
    marginRight: 4,
  },
  coinText: {
    color: '#CD7F32',
    fontSize: 18,
    fontWeight: '700',
  },
  coinAnimation: {
    position: 'absolute',
    right: -10,
    top: -25,
  },
  coinAnimationText: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  h1: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
    marginTop: 24,
    textAlign: 'left',
    lineHeight: 40,
  },
  h2: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 20,
  },
  h3: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  paragraphContainer: {
    marginBottom: 16,
  },
  paragraphText: {
    color: '#E6EEF4',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'left',
  },
  boldText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  hr: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },

  questionCard: {
    marginVertical: 10,
    padding: 14,
    backgroundColor: '#0F1726',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  questionPrompt: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 10 },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111623',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  optionSelected: { borderColor: '#7DD3FC' },
  optionCorrect: { borderColor: '#34D399', backgroundColor: '#052f26' },
  optionIncorrect: { borderColor: '#FB7185', backgroundColor: '#2c0b0e' },

  optionLabel: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0B1220',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabelText: { color: '#fff', fontWeight: '800' },

  optionText: { color: '#E6EEF4', flex: 1, fontSize: 15 },
  optionBadge: { color: '#34D399', fontWeight: '700', marginLeft: 8 },
  optionBadgeIncorrect: { color: '#FB7185', fontWeight: '700', marginLeft: 8 },

  feedbackRow: { marginTop: 8 },
  correctText: { color: '#A7F3D0' },
  incorrectText: { color: '#FECACA' },

  footer: {
    marginTop: 20,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  scoreText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  activityButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  activityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
