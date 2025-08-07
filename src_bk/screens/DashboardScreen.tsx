import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';

const { width } = Dimensions.get('window');

// Assuming User interface is defined in a shared file like App.tsx or types.ts
// For this example, I'm including it here for clarity, but it should ideally be imported.
interface User {
  user_id: number; // Changed from 'id' to 'user_id' for consistency
  name: string;
  mobile: string;
  email?: string;
  client_id?: string;
  abbreviation?: string;
  role?: string;
  agent_type?: string;
  user_name?: string; // Added for consistency with TicketsScreen
}

interface DashboardScreenProps {
  userInfo: User;
}

// New interface for the API response for counts
interface ApiTicketCountsResponseData {
  totalCount: number;
  openCount: number;
  closedCount: number;
  inProgressCount: number;
  noResponseCount: number;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ userInfo }) => {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardCounts, setDashboardCounts] = useState<ApiTicketCountsResponseData | null>(null);

  const handleQuickAction = (action: string) => {
    Alert.alert('Quick Action', `${action} feature will be implemented soon!`);
  };

  const fetchDashboardCounts = async () => {
    if (!userInfo.user_id) {
      console.warn('User ID not available to fetch dashboard counts.');
      return;
    }
    setLoadingCounts(true);
    try {
      const countsApiUrl = `https://api.ataichatbot.mcndhanore.co.in/public/api/tickets/counts?agentId=${userInfo.user_id}`;
      console.log('Fetching dashboard counts from:', countsApiUrl);
      const response = await axios.get(countsApiUrl, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Dashboard Counts API Response:', response.data);
      if (response.data && response.data.status && response.data.data) {
        setDashboardCounts(response.data.data);
      } else {
        console.log('No dashboard counts data received');
        setDashboardCounts(null);
      }
    } catch (error) {
      console.error('Dashboard Counts API Error:', error);
      Alert.alert('Error', 'Failed to load dashboard counts.');
      setDashboardCounts(null);
    } finally {
      setLoadingCounts(false);
    }
  };

  const fetchActivities = async () => {
    if (!userInfo.user_id) { // Use user_id for consistency
      console.warn('User ID not available to fetch activities.');
      return;
    }
    setLoadingActivities(true);
    try {
      const res = await axios.get(`https://api.ataichatbot.mcndhanore.co.in/public/api/search-ticket-activity?createdby=${userInfo.user_id}`); // Use user_id
      setActivities(res.data?.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load activities');
    }
    setLoadingActivities(false);
  };

  const initializeData = async () => {
    await Promise.all([
      fetchDashboardCounts(),
      fetchActivities()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    initializeData();
  }, [userInfo.user_id]); // Re-fetch if user_id changes

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    initializeData();
  };

  // Calculate percentages for charts
  const getPercentage = (count: number) => {
    if (!dashboardCounts || dashboardCounts.totalCount === 0) return 0;
    return Math.round((count / dashboardCounts.totalCount) * 100);
  };

  // Render user info section similar to TicketsScreen
  const renderUserInfo = () => {
    if (!userInfo) return null;

    return (
      <View style={styles.userInfoContainer}>
        <View style={styles.userInfoHeader}>
          <Text style={styles.userInfoTitle}>👤 Agent Information</Text>
        </View>
        <View style={styles.userInfoContent}>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Name:</Text>
            <Text style={styles.userInfoValue}>{userInfo.user_name || userInfo.name || 'Agent'}</Text>
          </View>
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Mobile:</Text>
            <Text style={styles.userInfoValue}>{userInfo.mobile || 'Not Available'}</Text>
          </View>
          {userInfo.email && (
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Email:</Text>
              <Text style={styles.userInfoValue}>{userInfo.email}</Text>
            </View>
          )}
          <View style={styles.userInfoRow}>
            <Text style={styles.userInfoLabel}>Agent ID:</Text>
            <Text style={styles.userInfoValue}>{userInfo.user_id}</Text>
          </View>
          {userInfo.agent_type && (
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Type:</Text>
              <Text style={styles.userInfoValue}>{userInfo.agent_type}</Text>
            </View>
          )}
          {userInfo.role && (
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Role:</Text>
              <Text style={styles.userInfoValue}>{userInfo.role}</Text>
            </View>
          )}
          {userInfo.client_id && (
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Client ID:</Text>
              <Text style={styles.userInfoValue}>{userInfo.client_id}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render bar chart for ticket insights
  const renderTicketInsightsChart = () => {
    if (!dashboardCounts) return null;

    const maxCount = Math.max(
      dashboardCounts.openCount,
      dashboardCounts.inProgressCount,
      dashboardCounts.closedCount,
      dashboardCounts.noResponseCount,
      1
    );

    const chartData = [
      { label: 'Open', count: dashboardCounts.openCount, color: '#007AFF' },
      { label: 'In-Progress', count: dashboardCounts.inProgressCount, color: '#FF9500' },
      { label: 'Resolved', count: dashboardCounts.closedCount, color: '#34C759' },
      { label: 'No-Response', count: dashboardCounts.noResponseCount, color: '#8E8E93' },
    ];

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>📊 Ticket Insights</Text>
        <View style={styles.chartContainer}>
          <View style={styles.barChart}>
            {chartData.map((item, index) => {
              const height = maxCount > 0 ? (item.count / maxCount) * 120 : 0;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <Text style={styles.barCount}>{item.count}</Text>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: Math.max(height, 4),
                          backgroundColor: item.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // Render ticket summary with visual indicators
  const renderTicketSummary = () => {
    if (!dashboardCounts) return null;

    const summaryData = [
      {
        icon: '🔵',
        label: 'Open',
        count: dashboardCounts.openCount,
        percentage: getPercentage(dashboardCounts.openCount),
        color: '#007AFF'
      },
      {
        icon: '🔄',
        label: 'In-Progress',
        count: dashboardCounts.inProgressCount,
        percentage: getPercentage(dashboardCounts.inProgressCount),
        color: '#FF9500'
      },
      {
        icon: '✅',
        label: 'Resolved',
        count: dashboardCounts.closedCount,
        percentage: getPercentage(dashboardCounts.closedCount),
        color: '#34C759'
      },
      {
        icon: '⚪',
        label: 'No-Response',
        count: dashboardCounts.noResponseCount,
        percentage: getPercentage(dashboardCounts.noResponseCount),
        color: '#8E8E93'
      },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Ticket Summary</Text>
        <View style={styles.summaryGrid}>
          {summaryData.map((item, index) => (
            <View key={index} style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>{item.icon}</Text>
              <Text style={[styles.summaryLabel, { color: item.color }]}>
                {item.label}
              </Text>
              <Text style={styles.summaryCount}>{item.count}</Text>
              <Text style={styles.summaryPercentage}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Dynamically create statsData based on fetched counts
  const statsData = [
    { title: 'Total Tickets', value: dashboardCounts?.totalCount ?? 0, icon: '🎫', color: '#007AFF' },
    { title: 'Open Tickets', value: dashboardCounts?.openCount ?? 0, icon: '🔓', color: '#FF6B35' },
    { title: 'Resolved', value: dashboardCounts?.closedCount ?? 0, icon: '✅', color: '#28CA42' },
    { title: 'Pending', value: dashboardCounts?.inProgressCount ?? 0, icon: '⏳', color: '#FFCC02' }, // Assuming inProgressCount maps to Pending
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {userInfo.name}!</Text>
        </View>

        {/* User Info Section */}
        {renderUserInfo()}

        {/* Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Ticket Overview</Text>
          {loadingCounts ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
          ) : (
            <View style={styles.statsContainer}>
              {statsData.map((stat, index) => (
                <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Ticket Insights Chart */}
        {!loadingCounts && renderTicketInsightsChart()}

        {/* Ticket Summary */}
        {!loadingCounts && renderTicketSummary()}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleQuickAction('Create Ticket')}
            >
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Create Ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleQuickAction('View Reports')}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>View Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => handleQuickAction('Contact Support')}
            >
              <Text style={styles.quickActionIcon}>📞</Text>
              <Text style={styles.quickActionText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕒 Recent Activities</Text>
          {loadingActivities ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
          ) : (
            <View style={styles.activitiesContainer}>
              {activities.length > 0 ? (
                activities.map((activity: any) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIconContainer}>
                      <Text style={styles.activityIcon}>
                        {activity.status === 'OPN' ? '🟢' :
                          activity.status === 'CLSD' ? '✅' : 'ℹ️'}
                      </Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>
                        {activity.description || `Ticket ID #${activity.ticketId}`}
                      </Text>
                      <Text style={styles.activityTime}>
                        Status: {activity.status}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noActivitiesText}>No recent activities found.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // User Info Styles
  userInfoContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  userInfoHeader: {
    backgroundColor: '#007AFF',
    padding: 15,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfoContent: {
    padding: 15,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  userInfoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  // Insights Chart Styles
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 130,
  },
  barCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  bar: {
    width: 25,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  // Summary Grid Styles
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#fff',
    width: (width - 60) / 2,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    // Removed padding from here as it's now in the section
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  activitiesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingIndicator: {
    marginTop: 20,
    marginBottom: 20,
  },
  noActivitiesText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 14,
  },
});

export default DashboardScreen;