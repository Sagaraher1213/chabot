import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const statusFilters = [
  { label: 'All', value: 'ALL', color: '#6c757d' },
  { label: 'Open', value: 'OPN', color: '#007bff' },
  { label: 'In-Progress', value: 'INP', color: '#ffc107' },
  { label: 'Resolved', value: 'CRS', color: '#28a745' },
  { label: 'No-Response', value: 'CNR', color: '#dc3545' },
];

const MyTicketsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [quickFilter, setQuickFilter] = useState('All Time'); // Not implemented in API, but for UI

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const clientId = user?.client_id;
      const agentId = user?.user_id; // Assuming agentId is user_id
      if (!clientId || !agentId) {
        Alert.alert('Error', 'User data missing. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await ticketApi.getAgentTicketsWithDetails(clientId, agentId);
      if (response.data.tickets) {
        setTickets(response.data.tickets);
        applyFilters(response.data.tickets, activeFilter, fromDate, toDate);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch tickets.');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch tickets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [user])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, [user]);

  const applyFilters = (data, statusFilter, fromDt, toDt) => {
    let tempTickets = [...data];

    // Apply status filter
    if (statusFilter !== 'ALL') {
      tempTickets = tempTickets.filter(ticket => ticket.status === statusFilter);
    }

    // Apply date filters
    if (fromDt) {
      tempTickets = tempTickets.filter(ticket => moment(ticket.createdAt).isSameOrAfter(moment(fromDt), 'day'));
    }
    if (toDt) {
      tempTickets = tempTickets.filter(ticket => moment(ticket.createdAt).isSameOrBefore(moment(toDt), 'day'));
    }

    setFilteredTickets(tempTickets);
  };

  useEffect(() => {
    applyFilters(tickets, activeFilter, fromDate, toDate);
  }, [activeFilter, fromDate, toDate, tickets]);

  const handleFilterPress = () => {
    applyFilters(tickets, activeFilter, fromDate, toDate);
  };

  const handleResetFilters = () => {
    setFromDate(null);
    setToDate(null);
    setActiveFilter('ALL');
    setQuickFilter('All Time');
    applyFilters(tickets, 'ALL', null, null);
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => navigation.navigate('TicketDetails', { ticketId: item.ticket_id })}
    >
      <View style={styles.row}>
        <Text style={styles.ticketId}>#{item.ticket_id}</Text>
        <Text style={styles.complaintDetail}>{item.complaints?.[0]?.complaint_detail || 'N/A'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.complainant}>{item.complaintname}</Text>
        <Text style={styles.remark}>{item.activity_description || 'No Remark'}</Text>
        <Text style={styles.receivedDate}>{moment(item.createdAt).format('DD/MM/YYYY')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tickets ({filteredTickets.length})</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onRefresh} style={styles.headerButton}>
            <Icon name="refresh" size={20} color="#007bff" />
            <Text style={styles.headerButtonText}>Refresh</Text>
          </TouchableOpacity>
          {/* Table/Cards view toggle not implemented as it's a FlatList */}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.dateFilterRow}>
          <TouchableOpacity onPress={() => setShowFromDatePicker(true)} style={styles.dateInput}>
            <Text>{fromDate ? moment(fromDate).format('DD-MM-YYYY') : 'From Date'}</Text>
            <Icon name="calendar" size={20} color="#666" />
          </TouchableOpacity>
          {showFromDatePicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={onFromDateChange}
            />
          )}

          <TouchableOpacity onPress={() => setShowToDatePicker(true)} style={styles.dateInput}>
            <Text>{toDate ? moment(toDate).format('DD-MM-YYYY') : 'To Date'}</Text>
            <Icon name="calendar" size={20} color="#666" />
          </TouchableOpacity>
          {showToDatePicker && (
            <DateTimePicker
              value={toDate || new Date()}
              mode="date"
              display="default"
              onChange={onToDateChange}
            />
          )}
        </View>
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
            <Icon name="filter" size={16} color="#fff" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, styles.resetButton]} onPress={handleResetFilters}>
            <Text style={styles.filterButtonText}>Reset</Text>
          </TouchableOpacity>
          {/* Quick Filter dropdown can be implemented using react-native-dropdown-picker */}
          <TextInput
            style={styles.quickFilterInput}
            value={quickFilter}
            onChangeText={setQuickFilter}
            placeholder="Quick Filter"
            editable={false} // Placeholder for now
          />
        </View>
      </View>

      <View style={styles.statusTabs}>
        {statusFilters.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.statusTab,
              activeFilter === filter.value && { backgroundColor: filter.color },
            ]}
            onPress={() => setActiveFilter(filter.value)}
          >
            <Text
              style={[
                styles.statusTabText,
                activeFilter === filter.value && { color: '#fff' },
              ]}
            >
              {filter.label} ({filter.value === 'ALL' ? tickets.length : tickets.filter(t => t.status === filter.value).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading tickets...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.ticket_id.toString()}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text>No tickets found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#e9ecef',
  },
  headerButtonText: {
    marginLeft: 5,
    color: '#007bff',
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
  quickFilterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  statusTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#e9ecef',
  },
  statusTabText: {
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  ticketItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    width: '20%',
  },
  complaintDetail: {
    fontSize: 16,
    color: '#333',
    width: '75%',
  },
  complainant: {
    fontSize: 14,
    color: '#555',
    width: '30%',
  },
  remark: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    width: '40%',
  },
  receivedDate: {
    fontSize: 14,
    color: '#555',
    width: '25%',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
});

export default MyTicketsScreen;
