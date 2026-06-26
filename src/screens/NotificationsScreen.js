import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';

const NotificationsScreen = ({ navigation }) => {
  const { 
    user, 
    notifications, 
    markAllAsRead, 
    clearNotifications 
  } = useExpense();

  // Filter for the logged-in user and sort by timestamp descending
  const userNotifications = notifications
    .filter(n => n.userEmail === user?.email)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const hasUnread = userNotifications.some(n => !n.read);

  const getRelativeTime = (timestamp) => {
    try {
      const now = new Date();
      const past = new Date(timestamp);
      const diffMs = now - past;
      
      if (isNaN(diffMs)) return 'Some time ago';
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // Fallback format
      return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const getNotifIconInfo = (type) => {
    switch (type) {
      case 'budget_critical':
        return { name: 'alert-circle', color: '#D32F2F', bg: '#FFEBEE' };
      case 'budget_warning':
        return { name: 'warning', color: '#E65100', bg: '#FFF3E0' };
      case 'high_expense':
        return { name: 'trending-down', color: '#1565C0', bg: '#E3F2FD' };
      case 'system':
      default:
        return { name: 'notifications', color: '#00875A', bg: '#E8F5E9' };
    }
  };

  const renderItem = ({ item }) => {
    const iconInfo = getNotifIconInfo(item.type);
    
    return (
      <View style={[styles.notifRow, !item.read && styles.unreadRow]}>
        <View style={[styles.iconBg, { backgroundColor: iconInfo.bg }]}>
          <Icon name={iconInfo.name} size={22} color={iconInfo.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !item.read && styles.unreadText]}>
              {item.title}
            </Text>
            <Text style={styles.notifTime}>{getRelativeTime(item.timestamp)}</Text>
          </View>
          <Text style={styles.notifMessage}>{item.message}</Text>
        </View>
        {!item.read && <View style={styles.unreadBadge} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Back Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* Top Quick Actions Bar */}
      {userNotifications.length > 0 && (
        <View style={styles.actionsBar}>
          <TouchableOpacity 
            onPress={markAllAsRead} 
            disabled={!hasUnread}
            style={styles.actionBtn}
          >
            <Text style={[styles.actionBtnText, !hasUnread && styles.disabledText]}>
              Mark all as read
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearNotifications} style={styles.actionBtn}>
            <Text style={[styles.actionBtnText, styles.dangerActionText]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main List / Empty State */}
      {userNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="notifications-off-outline" size={42} color="#00875A" />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            You have no notifications at the moment. We will alert you about your budget limits here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={userNotifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  rightPlaceholder: {
    width: 32,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00875A',
  },
  disabledText: {
    color: '#BDBDBD',
  },
  dangerActionText: {
    color: '#D32F2F',
  },
  listContent: {
    paddingBottom: 24,
  },
  notifRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
    alignItems: 'center',
    position: 'relative',
  },
  unreadRow: {
    backgroundColor: '#FAFDFB', // Very soft green tint for unread
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
  },
  unreadText: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  notifTime: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  notifMessage: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00875A',
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
