import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// SVG Icon Components
const RobotIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C13.1 2 14 2.9 14 4s-.9 2-2 2-2-.9-2-2 .9-2 2-2ZM21 9V7L15 1H9V3H7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2v2H7v7c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-7h-2v-2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-2V1h6v8Z"
      fill={color}
    />
  </Svg>
);

const ClockIcon = ({ size = 24, color = '#4CAF50' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const CheckIcon = ({ size = 24, color = '#9E9E9E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChartIcon = ({ size = 24, color = '#673AB7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3v18h18M9 9l3-3 4 4 5-5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MenuIcon = ({ size = 24, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5" cy="12" r="2" fill={color} />
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Circle cx="19" cy="12" r="2" fill={color} />
  </Svg>
);

// Simple Circle Chart Component
const CircleChart = ({ data, size = 180 }) => {
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
            />
          );
        })}
      </Svg>
      
      {/* Center content */}
      <View style={styles.circleChartCenter}>
        <Text style={styles.totalNumber}>{data.reduce((sum, item) => sum + item.count, 0)}</Text>
        <Text style={styles.totalLabel}>Total Tickets</Text>
      </View>
    </View>
  );
};

const HomeScreen = ({ userInfo, onLogout, navigation }) => {
  // Chart data with actual numbers
  const ticketData = {
    open: 25,
    inProgress: 9,
    resolved: 46,
    noResponse: 0
  };
  
  const totalTickets = ticketData.open + ticketData.inProgress + ticketData.resolved + ticketData.noResponse;
  
  const chartData = [
    { 
      percentage: (ticketData.open / totalTickets) * 100, 
      color: '#4CAF50', 
      label: 'Open',
      count: ticketData.open
    },
    { 
      percentage: (ticketData.inProgress / totalTickets) * 100, 
      color: '#2196F3', 
      label: 'In Progress',
      count: ticketData.inProgress
    },
    { 
      percentage: (ticketData.resolved / totalTickets) * 100, 
      color: '#9E9E9E', 
      label: 'Resolved',
      count: ticketData.resolved
    },
    { 
      percentage: (ticketData.noResponse / totalTickets) * 100, 
      color: '#FF5722', 
      label: 'No Response',
      count: ticketData.noResponse
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <RobotIcon size={24} color="#666" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Chatbot</Text>
            <Text style={styles.headerSubtitle}>Tickets Insights</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation?.navigate('Notifications')}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation?.navigate('Calendar')}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3Z" stroke="#666" strokeWidth="2" fill="none"/>
              <Path d="M16 2V6M8 2V6M3 10H21" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
            </Svg>
          </TouchableOpacity>
        </View>
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pie Chart */}
        <View style={styles.chartContainer}>
          <CircleChart data={chartData} size={180} />
        </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Open ({ticketData.open})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.legendText}>In Progress ({ticketData.inProgress})</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#9E9E9E' }]} />
                <Text style={styles.legendText}>Resolved ({ticketData.resolved})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
                <Text style={styles.legendText}>No Response ({ticketData.noResponse})</Text>
              </View>
            </View>
          </View>


        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <ClockIcon size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statNumber}>{ticketData.open}</Text>
              <Text style={styles.statLabel}>Opened</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <RefreshIcon size={24} color="#2196F3" />
              </View>
              <Text style={styles.statNumber}>{ticketData.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <CheckIcon size={24} color="#9E9E9E" />
              </View>
              <Text style={styles.statNumber}>{ticketData.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke="#FF5722" strokeWidth="2" fill="none"/>
                  <Path d="M15 9L9 15M9 9L15 15" stroke="#FF5722" strokeWidth="2" strokeLinecap="round"/>
                </Svg>
              </View>
              <Text style={styles.statNumber}>{ticketData.noResponse}</Text>
              <Text style={styles.statLabel}>No Response</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  },
  circleChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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

  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
    padding: 20,
    alignItems: 'center', 
    marginHorizontal: 7.5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4,
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
});

export default HomeScreen;