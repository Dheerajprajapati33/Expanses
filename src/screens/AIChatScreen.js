import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import { getCurrencySymbol } from '../utils/helper';

const AIChatScreen = ({ navigation }) => {
  const { user, transactions } = useExpense();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm SpendWise AI, your personal financial assistant. 🌟\n\nAsk me anything about your spending habits, budget limits, or how to optimize your savings!`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  // 1. Gather Context Details for the AI
  const financeContext = React.useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};

    transactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpenses += amt;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      }
    });

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const monthlyExpenses = transactions
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      })
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

    const budget = user?.budget || 50000;
    const currency = user?.currency || 'INR';

    // Format list of recent transactions
    const recentList = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(t => `${t.date}: ${t.type === 'income' ? 'Income' : 'Expense'} under ${t.category} - ${getCurrencySymbol(currency)}${t.amount} (${t.description})`);

    return {
      userName: user?.name || 'User',
      currency,
      monthlyBudget: budget,
      currentMonthExpenses: monthlyExpenses,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryTotals,
      recentTransactions: recentList
    };
  }, [transactions, user]);

  // 2. Offline / Local Fallback Response Engine
  const generateLocalResponse = (query) => {
    const q = query.toLowerCase();
    
    // Check if whole word exists to avoid matching substrings like "hi" in "high"
    const hasAnyWord = (text, words) => {
      return words.some(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
    };

    const symbol = getCurrencySymbol(financeContext.currency);
    const budget = financeContext.monthlyBudget;
    const spent = financeContext.currentMonthExpenses;
    const balance = financeContext.balance;

    if (hasAnyWord(q, ['hello', 'hi', 'hey', 'yo', 'greetings']) || q.includes('who are you')) {
      return `Hello! I am SpendWise AI, analyzing your transactions locally. You can ask me questions like:\n\n• "How much did I spend this month?"\n• "What is my remaining budget?"\n• "Where is my money going?"\n• "Give me tips to save money"`;
    }

    if (hasAnyWord(q, ['spend', 'spent', 'spending', 'expense', 'expenses', 'transaction', 'transactions', 'cost', 'costs', 'food', 'shopping', 'bills', 'transport', 'others'])) {
      const categoriesText = Object.keys(financeContext.categoryTotals).length > 0
        ? Object.entries(financeContext.categoryTotals)
            .map(([cat, amt]) => `• ${cat}: ${symbol}${amt.toLocaleString()}`)
            .join('\n')
        : 'No expense records found.';

      const budgetStatus = spent >= budget 
        ? '⚠️ Warning: You have exceeded your budget limit!' 
        : spent >= budget * 0.8 
        ? '⚠️ Warning: You have crossed 80% of your budget limit!' 
        : '✅ You are safely within your budget limits.';

      return `Here is your spending analysis:\n\nTotal overall expenses: **${symbol}${financeContext.totalExpenses.toLocaleString()}**\nExpenses this month: **${symbol}${spent.toLocaleString()}**\n\n**Category-wise spending:**\n${categoriesText}\n\n${budgetStatus}`;
    }

    if (hasAnyWord(q, ['budget', 'limit', 'save', 'saving', 'savings', 'advisor', 'tips', 'tip'])) {
      const diff = budget - spent;
      const pct = ((spent / budget) * 100).toFixed(1);
      
      let advice = 'You have no expenses recorded. Great job keeping your spending to zero!';
      if (spent > 0) {
        // Find highest spending category
        const highestCategoryEntry = Object.entries(financeContext.categoryTotals)
          .sort((a, b) => b[1] - a[1])[0];
        
        if (highestCategoryEntry) {
          advice = `Your highest spending category is **${highestCategoryEntry[0]}** (${symbol}${highestCategoryEntry[1].toLocaleString()}). To save, try set a weekly spending cap for ${highestCategoryEntry[0]} and look for cheaper alternatives.`;
        } else {
          advice = 'Set budget alerts and log expenses regularly to understand your trends.';
        }
      }

      return `**Budget Summary:**\n• Monthly Budget: ${symbol}${budget.toLocaleString()}\n• Used: ${pct}% (${symbol}${spent.toLocaleString()})\n• Remaining: ${diff >= 0 ? `${symbol}${diff.toLocaleString()} left` : `⚠️ Over budget by ${symbol}${Math.abs(diff).toLocaleString()}!`}\n\n💡 **Savings Advisor Tip:**\n${advice}`;
    }

    if (hasAnyWord(q, ['balance', 'income', 'salary', 'money', 'active'])) {
      return `**Balance Breakdown:**\n• Total Income Logged: ${symbol}${financeContext.totalIncome.toLocaleString()}\n• Total Expenses Logged: ${symbol}${financeContext.totalExpenses.toLocaleString()}\n• Net Active Balance: **${symbol}${balance.toLocaleString()}**`;
    }

    // Default guidance returning a snapshot of finances
    const diff = budget - spent;
    return `I am currently in Local Offline Mode. Here is a snapshot of your finances to help you out:\n\n• **Income**: ${symbol}${financeContext.totalIncome.toLocaleString()}\n• **Expenses**: ${symbol}${financeContext.totalExpenses.toLocaleString()}\n• **Active Balance**: ${symbol}${balance.toLocaleString()}\n• **Remaining Monthly Budget**: ${diff >= 0 ? `${symbol}${diff.toLocaleString()}` : `⚠️ Over budget by ${symbol}${Math.abs(diff).toLocaleString()}!`}`;
  };




  // 3. Send Message Handler
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newUserMsg = {
      id: `user_${Date.now()}`,
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    let apiKey = user?.geminiApiKey;

    try {
      if (apiKey && apiKey.startsWith('AIzaSy')) {
        // CALL REAL GEMINI API
        const systemPrompt = `You are SpendWise AI, a personal financial advisor chatbot built into an Expense Tracker app.
Analyze the user's transaction details and answer their query concisely, offering smart, encouraging, and actionable financial feedback. 
Format numerical values and costs using the user's currency: ${financeContext.currency}. 
Keep paragraphs short and use bullet points where helpful.

USER PROFILE:
- Name: ${financeContext.userName}
- Monthly Budget: ${financeContext.currency} ${financeContext.monthlyBudget}
- Total Income: ${financeContext.currency} ${financeContext.totalIncome}
- Total Expenses: ${financeContext.currency} ${financeContext.totalExpenses}
- Month-to-date Expenses: ${financeContext.currency} ${financeContext.currentMonthExpenses}
- Net Balance: ${financeContext.currency} ${financeContext.balance}

CATEGORY SPENDING totals:
${JSON.stringify(financeContext.categoryTotals, null, 2)}

RECENT TRANSACTIONS:
${financeContext.recentTransactions.join('\n')}

USER QUESTION: "${userMessage}"`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemPrompt }
                  ]
                }
              ]
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed response from Gemini API');
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
          setMessages(prev => [...prev, {
            id: `ai_${Date.now()}`,
            text: responseText.trim(),
            sender: 'ai',
            timestamp: new Date()
          }]);
        } else {
          throw new Error('Empty response');
        }

      } else {
        // Fallback to local rule-based response
        setTimeout(() => {
          const responseText = generateLocalResponse(userMessage);
          setMessages(prev => [...prev, {
            id: `ai_${Date.now()}`,
            text: responseText,
            sender: 'ai',
            timestamp: new Date()
          }]);
        }, 800);
      }
    } catch (err) {
      console.log('Gemini Chat error:', err);
      // Fallback message
      setMessages(prev => [...prev, {
        id: `ai_err_${Date.now()}`,
        text: `⚠️ Oops, I encountered an issue reaching the cloud AI services. I will answer locally instead:\n\n${generateLocalResponse(userMessage)}`,
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        text: `Chat cleared! I'm ready for new questions. 🌟\n\nAsk me about your categories, budgets, or savings.`,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>SpendWise AI</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {user?.geminiApiKey && user.geminiApiKey.startsWith('AIzaSy') ? 'Gemini Mode' : 'Local Mode'}
            </Text>


          </View>
        </View>

        <TouchableOpacity 
          style={styles.clearBtn}
          onPress={handleClearChat}
          activeOpacity={0.7}
        >
          <Icon name="trash-outline" size={20} color="#828282" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages List */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View 
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userRow : styles.aiRow
              ]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Icon name="sparkles" size={14} color="#FFFFFF" />
                </View>
              )}
              
              <View 
                style={[
                  styles.bubble,
                  msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text 
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userText : styles.aiText
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.aiAvatar}>
                <Icon name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#7E57C2" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about spending, budget, savings..."
            placeholderTextColor="#9E9E9E"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Icon name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00875A',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#828282',
    fontWeight: '600',
  },
  clearBtn: {
    padding: 6,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  aiRow: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7E57C2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    flexShrink: 1,
  },

  userBubble: {
    backgroundColor: '#00875A', // Match theme Green
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#333333',
  },
  inputArea: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F2',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1A1A1A',
    outlineStyle: 'none', // Remove web outline
    ...Platform.select({
      web: {
        outlineWidth: 0,
      }
    })
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7E57C2', // Violet for AI actions
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1C4E9',
    shadowOpacity: 0,
    elevation: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  }
});

export default AIChatScreen;

