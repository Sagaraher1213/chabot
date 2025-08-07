import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { ticketApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Example icon library

const screenWidth = Dimensions.get('window').width;

const TicketInsightsScreen = () => {
  const { user } = useAuth();
  const [ticketCounts, setTicketCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming user.clientId is available after login
        const clientId = user?.client_id;
        if (!clientId) {
          setError('Client ID not found. Please log in again.');
          setLoading(false);
          return;
        }
        const response = await ticketApi.getTicketCountsByClient(clientId);
        if (response.data.status) {
          setTicketCounts(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch ticket counts.');
        }
      } catch (err) {
        console.error('Error fetching ticket counts:', err.response?.data || err.message);
        setError('Error fetching ticket counts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketCounts();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!ticketCounts) {
    return (
      <View style={styles.centered}>
        <Text>No ticket data available.</Text>
      </View>
    );
  }

  const barChartData = {
    labels: ['Open', 'In-Progress', 'Resolved', 'No-Response'],
    datasets: [
      {
        data: [
          ticketCounts.openCount || 0,
          ticketCounts.inProgressCount || 0,
          ticketCounts.resolvedCount || 0,
          ticketCounts.noResponseCount || 0,
        ],
        colors: [
          (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, // Blue for Open
          (opacity = 1) => `rgba(108, 117, 125, ${opacity})`, // Gray for In-Progress
          (opacity = 1) => `rgba(40, 167, 69, ${opacity})`, // Green for Resolved
          (opacity = 1) => `rgba(220, 53, 69, ${opacity})`, // Red for No-Response
        ],
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Open',
      population: ticketCounts.openCount || 0,
      color: '#007bff',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'In-Progress',
      population: ticketCounts.inProgressCount || 0,
      color: '#6c757d',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Resolved',
      population: ticketCounts.resolvedCount || 0,
      color: '#28a745',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'No-Response',
      population: ticketCounts.noResponseCount || 0,
      color: '#dc3545',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0, // no decimal places for counts
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Ticket Insights</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ticket Counts by Status</Text>
        <BarChart
          data={barChartData}
          width={screenWidth - 40} // from padding
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
          showValuesOnTopOfBars={true}
          style={styles.chart}
        />
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Ticket Summary</Text>
          <View style={styles.summaryItem}>
            <Icon name="folder-open" size={20} color="#007bff" />
            <Text style={styles.summaryText}>Open</Text>
            <Text style={styles.summaryCount}>{ticketCounts.openCount || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="progress-wrench" size={20} color="#6c757d" />
            <Text style={styles.summaryText}>In-Progress</Text>
            <Text style={styles.summaryCount}>{ticketCounts.inProgressCount || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="check-circle" size={20} color="#28a745" />
            <Text style={styles.summaryText}>Resolved</Text>
            <Text style={styles.summaryCount}>{ticketCounts.resolvedCount || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="alert-circle" size={20} color="#dc3545" />
            <Text style={styles.summaryText}>No-Response</Text>
            <Text style={styles.summaryCount}>{ticketCounts.noResponseCount || 0}</Text>
          </View>
        </View>

        <View style={styles.pieChartCard}>
          <Text style={styles.cardTitle}>Total Tickets</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth / 2 - 30} // Half screen width minus padding
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute // Show absolute values in tooltip
          />
          <Text style={styles.totalTicketsText}>
            {ticketCounts.totalCount || 0} Total Tickets
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    color: '#555',
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pieChartCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalTicketsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
});

export default TicketInsightsScreen;
