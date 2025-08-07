import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ticketApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const statusOptions = [
  { label: 'Open', value: 'OPN' },
  { label: 'In Progress', value: 'INP' },
  { label: 'Resolved', value: 'CRS' },
  { label: 'No Response from Client', value: 'CNR' },
  { label: 'Closed', value: 'RES' }, // Assuming RES is for closed/resolved
];

const TicketDetailsScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Update Ticket form
  const [remark, setRemark] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketApi.getTicketDetails(ticketId);
      if (response.data.status) {
        const fetchedTicket = response.data.data;
        setTicket(fetchedTicket);
        setSelectedStatus(fetchedTicket.status); // Set initial status from fetched data
        setRemark(fetchedTicket.activity_description || fetchedTicket.ticket_description || '');
        // Set follow-up date if available in complaints
        if (fetchedTicket.complaints && fetchedTicket.complaints.length > 0) {
          const firstComplaintWithFollowup = fetchedTicket.complaints.find(c => c.followup_date);
          if (firstComplaintWithFollowup) {
            setFollowUpDate(new Date(firstComplaintWithFollowup.followup_date));
          }
        }
      } else {
        setError(response.data.message || 'Failed to fetch ticket details.');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err.response?.data || err.message);
      setError('Error fetching ticket details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTicketDetails();
    }, [ticketId, user])
  );

  const handleUpdateTicket = async () => {
    if (!selectedStatus) {
      Alert.alert('Validation Error', 'Please select a status.');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedBy = user?.user_id; // Assuming updatedBy is the logged-in agent's user_id
      if (!updatedBy) {
        Alert.alert('Error', 'User ID missing for update. Please log in again.');
        setIsUpdating(false);
        return;
      }

      // Construct complaintIDs array as expected by your PHP controller
      // Assuming we are updating the first complaint's status and description for simplicity
      // You might need to iterate through all complaints if multiple are editable
      const complaintIDs = ticket.complaints.map(comp => ({
        p_DC_id: comp.id, // Assuming 'id' is the primary key for tkt_dws_complaints
        description: remark, // Apply the same remark to all complaints for this ticket
        followUpDate: followUpDate ? moment(followUpDate).format('YYYY-MM-DD') : null,
        assignedTo: ticket.assignedTo, // Keep current assignedTo or update if needed
        status: selectedStatus,
      }));

      const response = await ticketApi.updateTicket(
        ticketId,
        complaintIDs,
        remark,
        updatedBy
      );

      if (response.data.status) {
        Alert.alert('Success', response.data.message);
        fetchTicketDetails(); // Re-fetch details to show updated state
      } else {
        Alert.alert('Update Failed', response.data.message || 'Failed to update ticket.');
      }
    } catch (err) {
      console.error('Error updating ticket:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to update ticket. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const onFollowUpDateChange = (event, selectedDate) => {
    setShowFollowUpDatePicker(false);
    if (selectedDate) {
      setFollowUpDate(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading ticket details...</Text>
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

  if (!ticket) {
    return (
      <View style={styles.centered}>
        <Text>Ticket not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color="#007bff" />
        <Text style={styles.backButtonText}>Back to Tickets</Text>
      </TouchableOpacity>

      <View style={styles.ticketHeader}>
        <Text style={styles.ticketHeaderTitle}>Ticket Details</Text>
        <Text style={styles.ticketHeaderSubtitle}>
          Ticket ID: #{ticket.id} - Current Status: <Text style={styles.statusText}>{ticket.status}</Text>
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ticket Information</Text>
        <View style={styles.infoRow}>
          <Icon name="devices" size={20} color="#666" />
          <Text style={styles.infoLabel}>Device ID:</Text>
          <Text style={styles.infoValue}>{ticket.deviceID || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="package-variant" size={20} color="#666" />
          <Text style={styles.infoLabel}>Products:</Text>
          <Text style={styles.infoValue}>
            {ticket.complaints?.map(c => c.product_name).filter(Boolean).join(', ') || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#666" />
          <Text style={styles.infoLabel}>Contact:</Text>
          <Text style={styles.infoValue}>{ticket.complaint_mobile || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="account-tie" size={20} color="#666" />
          <Text style={styles.infoLabel}>Staff Remark:</Text>
          <Text style={styles.infoValue}>{ticket.activity_description || 'No additional information provided'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Issue Details</Text>
        <View style={styles.infoRow}>
          <Icon name="account" size={20} color="#666" />
          <Text style={styles.infoLabel}>Issue generated from:</Text>
          <Text style={styles.infoValue}>{ticket.complaintname || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="alert-circle" size={20} color="#dc3545" />
          <Text style={styles.infoLabel}>Issue Regarding:</Text>
          <Text style={[styles.infoValue, styles.issueText]}>
            {ticket.complaints?.map(c => c.complaint_detail).filter(Boolean).join(', ') || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Update Ticket</Text>
        <View style={styles.statusWorkflow}>
          <Text style={styles.workflowTitle}>Status Workflow</Text>
          <Text style={styles.workflowCurrentStatus}>
            Current Status: <Text style={{ fontWeight: 'bold' }}>{ticket.status}</Text>
          </Text>
          <Text style={styles.workflowDescription}>
            Available status options: Open, In Progress, Communication is going on with client, Resolved and Closed, No Response from Client or Closed.
          </Text>
        </View>

        <Text style={styles.label}>Remark *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter your detailed remark here..."
          multiline
          numberOfLines={4}
          value={remark}
          onChangeText={setRemark}
        />

        <Text style={styles.label}>Status *</Text>
        <DropDownPicker
          open={statusOpen}
          value={selectedStatus}
          items={statusOptions}
          setOpen={setStatusOpen}
          setValue={setSelectedStatus}
          placeholder="Select status"
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          zIndex={1000} // Ensure dropdown is on top
        />

        <Text style={styles.label}>Follow-Up Date</Text>
        <TouchableOpacity onPress={() => setShowFollowUpDatePicker(true)} style={styles.dateInput}>
          <Text>{followUpDate ? moment(followUpDate).format('DD-MM-YYYY') : 'dd-mm-yyyy'}</Text>
          <Icon name="calendar" size={20} color="#666" />
        </TouchableOpacity>
        {showFollowUpDatePicker && (
          <DateTimePicker
            value={followUpDate || new Date()}
            mode="date"
            display="default"
            onChange={onFollowUpDateChange}
          />
        )}

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateTicket} disabled={isUpdating}>
          {isUpdating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Ticket Status</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    marginLeft: 5,
    color: '#007bff',
    fontSize: 16,
  },
  ticketHeader: {
    marginBottom: 20,
  },
  ticketHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketHeaderSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#28a745', // Example color for 'Open'
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
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    width: 100,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  issueText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  statusWorkflow: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  workflowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  workflowCurrentStatus: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  workflowDescription: {
    fontSize: 12,
    color: '#777',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  dropdownContainer: {
    height: 50,
    marginBottom: 15,
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  updateButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TicketDetailsScreen;
