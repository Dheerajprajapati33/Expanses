import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { getCategoryConfig, formatCurrency } from '../utils/helper';

const PieChart = ({ transactions = [], isDonut = true }) => {
  // 1. Filter expenses
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // 2. Sum by category
  const categorySums = {};
  let totalExpense = 0;

  expenses.forEach(t => {
    const cat = t.category || 'Others';
    const amt = parseFloat(t.amount) || 0;
    categorySums[cat] = (categorySums[cat] || 0) + amt;
    totalExpense += amt;
  });

  // 3. Prepare data for react-native-chart-kit
  const categoriesList = Object.keys(categorySums);
  
  let chartData = [];
  if (categoriesList.length === 0) {
    // Empty state fallback data
    chartData = [
      {
        name: 'No Expenses',
        population: 1,
        color: '#ECEFF1',
        legendFontColor: '#78909C',
        legendFontSize: 12
      }
    ];
  } else {
    chartData = categoriesList.map(cat => {
      const config = getCategoryConfig(cat, 'expense');
      return {
        name: cat,
        population: categorySums[cat],
        color: config.iconColor || '#757575',
        legendFontColor: '#4A4A4A',
        legendFontSize: 12
      };
    }).sort((a, b) => b.population - a.population); // Sort descending
  }

  const screenWidth = Dimensions.get('window').width - 48; // Account for margins

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <RNPieChart
          data={chartData}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[0, 0]}
          absolute={true} // Shows absolute value on legend, we'll handle percentage if needed
          hasLegend={false} // We will draw our own custom legends to match the design perfectly!
        />

        {/* Donut central text overlay */}
        {isDonut && (
          <View style={styles.donutCenter}>
            <Text style={styles.donutAmount}>
              {formatCurrency(totalExpense).split('.')[0]}
            </Text>
            <Text style={styles.donutLabel}>Total</Text>
          </View>
        )}
      </View>

      {/* Custom side legend */}
      <View style={styles.legendContainer}>
        {chartData.map((item, index) => {
          if (item.name === 'No Expenses') return null;
          
          const percentage = totalExpense > 0 
            ? ((item.population / totalExpense) * 100).toFixed(0) 
            : 0;

          return (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.legendName}>{item.name}</Text>
              </View>
              <Text style={styles.legendValue}>
                {formatCurrency(item.population).split('.')[0]} ({percentage}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  chartWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
    width: '100%',
  },
  donutCenter: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Subtly elevate the center card
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  donutAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  donutLabel: {
    fontSize: 11,
    color: '#828282',
    marginTop: 2,
  },
  legendContainer: {
    width: '100%',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendName: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
});

export default PieChart;
