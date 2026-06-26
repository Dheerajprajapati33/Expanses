import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Dimensions, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';
import PieChart from '../components/PieChart';
import { formatCurrency } from '../utils/helper';

const StatisticsScreen = () => {
  const { transactions } = useExpense();

  // 1. Calculate Total Expenses
  const totalExpenses = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  }, [transactions]);

  // 2. Compute Daily Trend Data for the line chart (last 7 days)
  const lineChartData = useMemo(() => {
    const dailySums = {};
    const last7Days = [];
    const dateLabels = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate last 7 days dates starting from 26 June 2026 backwards
    const baseDate = new Date('2026-06-26');
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push(dateStr);
      
      const label = `${d.getDate()} ${months[d.getMonth()]}`;
      dateLabels.push(label);
      dailySums[dateStr] = 0;
    }

    // Populate actual expense values
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const txDate = tx.date; // e.g. '2026-06-25'
        if (dailySums[txDate] !== undefined) {
          dailySums[txDate] += parseFloat(tx.amount) || 0;
        }
      }
    });

    const datasetValues = last7Days.map(date => dailySums[date] || 0);

    return {
      labels: dateLabels,
      datasets: [
        {
          data: datasetValues,
          color: (opacity = 1) => `rgba(0, 135, 90, ${opacity})`, // Green line
          strokeWidth: 3
        }
      ],
      legend: ["Daily Trend"]
    };
  }, [transactions]);

  const screenWidth = Dimensions.get('window').width - 48;

  const lineChartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 135, 90, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(130, 130, 130, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#FFFFFF"
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Statistics</Text>
        <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7}>
          <Text style={styles.dropdownText}>This Month</Text>
          <Icon name="chevron-down" size={16} color="#828282" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Total Expense Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalExpenses)}</Text>
        </View>

        {/* Expenses by Category Section */}
        <Text style={styles.sectionTitle}>Expenses by Category</Text>
        <PieChart transactions={transactions} isDonut={true} />

        {/* Daily Trend Line Chart Section */}
        <Text style={styles.sectionTitle}>Daily Trend</Text>
        <View style={styles.chartCard}>
          <LineChart
            data={lineChartData}
            width={screenWidth}
            height={200}
            chartConfig={lineChartConfig}
            bezier
            style={styles.lineChartStyle}
            yAxisSuffix=""
            yAxisLabel="₹"
          />
        </View>
        
        {/* Extra spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1B1B',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  dropdownText: {
    fontSize: 13,
    color: '#4F4F4F',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginVertical: 12,
    flexDirection: 'column',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D32F2F',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  lineChartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default StatisticsScreen;
