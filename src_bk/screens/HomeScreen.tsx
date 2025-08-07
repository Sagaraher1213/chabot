import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

// User interface
interface User {
  user_id: number;
  name: string;
  mobile: string;
  email?: string;
  client_id?: string;
  abbreviation?: string;
  role?: string;
  agent_type?: string;
  user_name?: string;
}

// API response interface
interface ApiTicketCountsResponseData {
  totalCount: number;
  openCount: number;
  closedCount: number;
  inProgressCount: number;
  noResponseCount: number;
}

// SVG Icon Components
const RobotIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2ZM21 9V7L15 1H9V3H7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2v2H7v7c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-7h-2v-2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-2V1h6v8Z"
      fill={color}
    />
  </Svg>
);

// Icon for 'Opened' - using a document/folder like icon
const DocumentIcon = ({ size = 24, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6" />
    <Path d="M10 9H8" />
    <Path d="M16 13H8" />
    <Path d="M16 17H8" />
  </Svg>
);

// Icon for 'In Progress' - using a gear/settings icon
const GearIcon = ({ size = 24, color = '#2196F3' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-.33 1.82z" />
  </Svg>
);

// Icon for 'Resolve' - using a checkmark in a box
const CheckSquareIcon = ({ size = 24, color = '#FFC107' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <Path d="M9 12l2 2 4-4" />
  </Svg>
);

// Icon for 'No Response' - using an alert/exclamation icon
const AlertCircleIcon = ({ size = 24, color = '#FF5722' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 8v4" />
    <Path d="M12 16h.01" />
  </Svg>
);

const RefreshIcon = ({ size = 24, color = '#2196F3' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4v6h6M20 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L4 10M3.51 15A9 9 0 0 0 18.36 18.36L20 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Simple Circle Chart Component with clickable segments
const CircleChart = ({ data, size = 180, onSegmentPress }) => {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;

  return (
    <View style={styles.circleChartContainer}>
      <Svg width={size} height={size} style={styles.circleChart}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Colored segments */}
        {data.map((item, index) => {
          if (item.percentage === 0) return null;

          const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercentage / 100 * circumference;

          cumulativePercentage += item.percentage;

          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              onPress={() => onSegmentPress && onSegmentPress(item)}
            />
          );
        })}
      </Svg>

      {/* Center content - clickable */}
      <TouchableOpacity
        style={styles.circleChartCenter}
        onPress={() => onSegmentPress && onSegmentPress({
          label: 'Total',
          count: data.reduce((sum, item) => sum + item.count, 0),
          color: '#333'
        })}
      >
        <Text style={styles.totalNumber}>{data.reduce((sum, item) => sum + item.count, 0)}</Text>
        <Text style={styles.totalLabel}>Total Tickets</Text>
      </TouchableOpacity>

      {/* Legend items positioned around the chart */}
      {data.map((item, index) => {
        // Calculate position for each legend item
        // This is a simplified calculation, adjust as needed for precise layout
        const angle = (cumulativePercentage - item.percentage / 2) * (2 * Math.PI / 100); // Mid-point of segment
        const legendRadius = radius + strokeWidth / 2 + 30; // Distance from center to legend text
        const x = size / 2 + legendRadius * Math.cos(angle);
        const y = size / 2 + legendRadius * Math.sin(angle);

        return (
          <View
            key={`legend-${index}`}
            style={[
              styles.chartLegendItem,
              {
                position: 'absolute',
                left: x - (item.label.length * 3), // Adjust based on text length
                top: y - 10, // Adjust vertically
              },
            ]}
          >
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const HomeScreen = ({ userInfo, onLogout, navigation }) => {
  const [dashboardCounts, setDashboardCounts] = useState<ApiTicketCountsResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch dashboard counts from API
  const fetchDashboardCounts = async () => {
    if (!userInfo?.user_id) {
      console.warn('User ID not available to fetch dashboard counts.');
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    if (userInfo?.user_id) {
      fetchDashboardCounts();
    }
  }, [userInfo?.user_id]);

  // Handle segment press
  const handleSegmentPress = (segmentData: any) => {
    setSelectedSegment(segmentData);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedSegment(null);
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardCounts().finally(() => setRefreshing(false));
  };

  // Use API data if available, otherwise fallback to static data
  const ticketData = dashboardCounts ? {
    open: dashboardCounts.openCount,
    inProgress: dashboardCounts.inProgressCount,
    resolved: dashboardCounts.closedCount, // Assuming closedCount maps to resolved
    noResponse: dashboardCounts.noResponseCount
  } : {
    open: 4, // Default values to match image if no API data
    inProgress: 4,
    resolved: 4,
    noResponse: 4
  };

  const totalTickets = ticketData.open + ticketData.inProgress + ticketData.resolved + ticketData.noResponse;

  // Order of chartData to match the image's segments (clockwise from top-left)
  const chartData = [
    {
      percentage: totalTickets > 0 ? (ticketData.inProgress / totalTickets) * 100 : 0,
      color: '#007bff', // Blue for In Progress
      label: 'In Progress',
      count: ticketData.inProgress
    },
    {
      percentage: totalTickets > 0 ? (ticketData.resolved / totalTickets) * 100 : 0,
      color: '#FFC107', // Yellow for Resolve
      label: 'Resolve',
      count: ticketData.resolved
    },
    {
      percentage: totalTickets > 0 ? (ticketData.noResponse / totalTickets) * 100 : 0,
      color: '#dc3545', // Red for No Response
      label: 'No Response',
      count: ticketData.noResponse
    },
    {
      percentage: totalTickets > 0 ? (ticketData.open / totalTickets) * 100 : 0,
      color: '#28a745', // Green for Open
      label: 'Open',
      count: ticketData.open
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        {userInfo && (
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back, {userInfo.name || userInfo.user_name}!</Text>
            <Text style={styles.welcomeSubtext}>Here's your ticket overview</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading ticket data...</Text>
          </View>
        )}

        {/* Data Status Indicator */}
        <View style={styles.dataStatusContainer}>
          <View style={[styles.dataStatusDot, { backgroundColor: dashboardCounts ? '#4CAF50' : '#FF9500' }]} />
          <Text style={styles.dataStatusText}>
            {dashboardCounts ? 'Live Data' : 'Sample Data'}
          </Text>
        </View>

        {/* Pie Chart with inline legend */}
        <View style={styles.chartContainer}>
          <CircleChart
            data={chartData}
            size={180}
            onSegmentPress={handleSegmentPress}
          />
          {/* Removed the separate legend section here as it's now part of CircleChart */}
        </View>

        {/* Stats Grid - Matching the image's card layout */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => handleSegmentPress({ label: 'Opened', count: ticketData.open, color: '#28a745' })}
            >
              <View style={styles.statIconContainer}>
                <DocumentIcon size={24} color="#28a745" />
              </View>
              <Text style={styles.statLabel}>Opened</Text>
              <Text style={styles.statNumber}>{ticketData.open}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => handleSegmentPress({ label: 'In Progress', count: ticketData.inProgress, color: '#007bff' })}
            >
              <View style={styles.statIconContainer}>
                <GearIcon size={24} color="#007bff" />
              </View>
              <Text style={styles.statLabel}>In Progress</Text>
              <Text style={styles.statNumber}>{ticketData.inProgress}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => handleSegmentPress({ label: 'Resolve', count: ticketData.resolved, color: '#FFC107' })}
            >
              <View style={styles.statIconContainer}>
                <CheckSquareIcon size={24} color="#FFC107" />
              </View>
              <Text style={styles.statLabel}>Resolve</Text>
              <Text style={styles.statNumber}>{ticketData.resolved}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => handleSegmentPress({ label: 'No Response', count: ticketData.noResponse, color: '#dc3545' })}
            >
              <View style={styles.statIconContainer}>
                <AlertCircleIcon size={24} color="#dc3545" />
              </View>
              <Text style={styles.statLabel}>No Response</Text>
              <Text style={styles.statNumber}>{ticketData.noResponse}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Section - Kept but placed lower */}
        {userInfo && (
          <View style={styles.userInfoSection}>
            <Text style={styles.sectionTitle}>Agent Information</Text>
            <View style={styles.userInfoCard}>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Name:</Text>
                <Text style={styles.userInfoValue}>{userInfo.user_name || userInfo.name}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Agent ID:</Text>
                <Text style={styles.userInfoValue}>{userInfo.agent_id}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Mobile:</Text>
                <Text style={styles.userInfoValue}>{userInfo.mobile}</Text>
              </View>
              {userInfo.email && (
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Email:</Text>
                  <Text style={styles.userInfoValue}>{userInfo.email}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal for segment details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedSegment && (
              <View style={styles.modalBody}>
                <View style={styles.modalSegmentInfo}>
                  <View style={[
                    styles.modalColorDot,
                    { backgroundColor: selectedSegment.color }
                  ]} />
                  <Text style={styles.modalSegmentLabel}>{selectedSegment.label}</Text>
                </View>

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatNumber}>{selectedSegment.count}</Text>
                    <Text style={styles.modalStatLabel}>Total Tickets</Text>
                  </View>

                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatNumber}>
                      {selectedSegment.percentage ? selectedSegment.percentage.toFixed(1) : '0.0'}%
                    </Text>
                    <Text style={styles.modalStatLabel}>Of Total</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      closeModal();
                      // Navigate to tickets list with filter
                      Alert.alert('Navigation', `View all ${selectedSegment.label} tickets`);
                    }}
                  >
                    <Text style={styles.modalActionText}>View All {selectedSegment.label} Tickets</Text>
                  </TouchableOpacity>

                  {selectedSegment.label !== 'Total' && (
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalSecondaryButton]}
                      onPress={() => {
                        closeModal();
                        Alert.alert('Action', `Create new ticket in ${selectedSegment.label} category`);
                      }}
                    >
                      <Text style={[styles.modalActionText, styles.modalSecondaryText]}>
                        Create New Ticket
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  content: {
    flex: 1,
    padding: 20
  },
  welcomeSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  dataStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dataStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dataStatusText: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative', // Needed for absolute positioning of legend items
  },
  circleChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    // Removed marginBottom as legend is now inside
  },
  circleChart: {
    transform: [{ rotate: '-90deg' }],
  },
  circleChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // New style for legend items positioned around the chart
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // Positioned absolutely by the CircleChart component
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  legendText: {
    fontSize: 14,
    color: '#555'
  },
  // Removed old legend styles (legend, legendRow, legendItem) as they are no longer used
  statsGrid: {
    marginBottom: 20
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 7.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statIconContainer: {
    marginBottom: 8
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  userInfoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  userInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  },
  userInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalSegmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  modalColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  modalSegmentLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  modalActions: {
    gap: 10,
  },
  modalActionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSecondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalSecondaryText: {
    color: '#333',
  },
});

export default HomeScreen;
