// Format number to currency style dynamically based on currencyCode
export const getCurrencySymbol = (code = 'INR') => {
  switch (code) {
    case 'USD':
      return '$';
    case 'RUB':
      return '₽';
    case 'CAD':
      return 'C$';
    case 'NPR':
      return '₨';
    case 'CNY':
      return '¥';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'INR':
    default:
      return '₹';
  }
};

export const formatCurrency = (amount, currencyCode = 'INR') => {
  const symbol = getCurrencySymbol(currencyCode);
  if (amount === undefined || amount === null) return `${symbol} 0.00`;
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return `${symbol} 0.00`;
  
  let res = '';
  if (currencyCode === 'INR' || currencyCode === 'NPR') {
    // Custom manual formatting for Indian/Nepalese style: xx,xx,xxx.xx
    const parts = parsed.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherNumbers = parts[0].substring(0, parts[0].length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + "." + parts[1];
  } else {
    // Standard western style: xxx,xxx.xx
    res = parsed.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  
  return `${symbol} ${res}`;
};

// Format Date object or string to "DD MMM YYYY"
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Group transactions by date: Today, Yesterday, and others
export const groupTransactionsByDate = (transactions) => {
  const groups = {};
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const formatDateString = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const todayStr = formatDateString(today);
  const yesterdayStr = formatDateString(yesterday);
  
  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) return;
    
    const txDateStr = formatDateString(txDate);
    let title = formatDate(tx.date);
    
    if (txDateStr === todayStr) {
      title = 'Today';
    } else if (txDateStr === yesterdayStr) {
      title = 'Yesterday';
    }
    
    if (!groups[title]) {
      groups[title] = [];
    }
    groups[title].push(tx);
  });
  
  // Sort sections: we want sections in reverse chronological order
  // To do that, we'll return an array of { title, data }
  const sectionArray = Object.keys(groups).map((title) => {
    // Determine a timestamp for sorting
    const sampleDateStr = groups[title][0].date;
    const timestamp = new Date(sampleDateStr).getTime();
    
    // Sort transactions in each group by ID or time descending
    const sortedData = [...groups[title]].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      title,
      timestamp,
      data: sortedData
    };
  });
  
  return sectionArray.sort((a, b) => b.timestamp - a.timestamp);
};

// Helper for UI details by transaction category
export const getCategoryConfig = (category, type) => {
  const cat = String(category).toLowerCase();
  
  if (type === 'income') {
    switch (cat) {
      case 'salary':
        return {
          icon: 'wallet-outline',
          iconColor: '#2E7D32', // Deep green
          bgColor: '#E8F5E9', // Light green
        };
      case 'business':
        return {
          icon: 'briefcase-outline',
          iconColor: '#1565C0', // Blue
          bgColor: '#E3F2FD',
        };
      case 'freelance':
        return {
          icon: 'laptop',
          iconColor: '#00838F', // Teal
          bgColor: '#E0F7FA',
        };
      case 'investment':
        return {
          icon: 'trending-up',
          iconColor: '#EF6C00', // Orange
          bgColor: '#FFF3E0',
        };
      default:
        return {
          icon: 'cash-outline',
          iconColor: '#4CAF50',
          bgColor: '#E8F5E9',
        };
    }
  } else {
    // Expense categories
    switch (cat) {
      case 'food':
        return {
          icon: 'fast-food-outline',
          iconColor: '#FF7043', // Warm orange/red
          bgColor: '#FBE9E7',
        };
      case 'transport':
        return {
          icon: 'bus-outline',
          iconColor: '#29B6F6', // Blue
          bgColor: '#E1F5FE',
        };
      case 'shopping':
        return {
          icon: 'cart-outline',
          iconColor: '#AB47BC', // Purple
          bgColor: '#F3E5F5',
        };
      case 'bills':
        return {
          icon: 'receipt-outline',
          iconColor: '#EF5350', // Red
          bgColor: '#FFEBEE',
        };
      case 'entertainment':
        return {
          icon: 'game-controller-outline',
          iconColor: '#5C6BC0', // Indigo
          bgColor: '#E8EAF6',
        };
      default:
        return {
          icon: 'ellipsis-horizontal-circle-outline',
          iconColor: '#78909C', // Slate grey
          bgColor: '#ECEFF1',
        };
    }
  }
};
