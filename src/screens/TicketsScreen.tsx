import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView, Modal, Alert,
  ActivityIndicator, RefreshControl, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface User {
  user_id: number;
  name: string;
  mobile: string;
  email?: string;
}

interface Ticket {
  id: number;
  complaintID: number;
  deviceID: string;
  description: string | null;
  createdBy: number;
  updatedBy: number | null;
  complainant: number;
  assignedTo?: number | null;
  activityDesc?: string | null;
  status?: string;
}

const TicketsScreen = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // Check if user is logged in and fetch profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      let user = await AsyncStorage.getItem('userData');
      
      if (!user) {
        setIsLoggedIn(false);
        setUserData(null);
        setTickets([]);
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }
      
      const parsedUser = JSON.parse(user);
      setIsLoggedIn(true);

      const response = await axios.get(
        `https://api.ataichatbot.mcndhanore.co.in/public/api/manage-user?p_user_id=${parsedUser?.user_id}`
      );

      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        const profileData = response.data.data[0];
        const completeUserData = {
          user_id: profileData.user_id || parsedUser.user_id,
          name: profileData.name || parsedUser.name,
          mobile: profileData.mobile || parsedUser.mobile,
          email: profileData.email || parsedUser.email
        };
        
        setUserData(completeUserData);
        
        // Animate content in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Fetch tickets for this user
        fetchTickets(completeUserData.user_id);
      } else {
        Alert.alert('Error', 'Unable to fetch profile');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Profile API Error:', error);
      Alert.alert('Error', 'Something went wrong while fetching profile.');
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch only current user's tickets
  const fetchTickets = async (uid: number) => {
    try {
      const res = await axios.get(
        `https://api.ataichatbot.mcndhanore.co.in/public/api/search-ticket-activity?createdby=${uid}`
      );
      
      if (Array.isArray(res.data)) {
        // Filter tickets to show only current user's tickets (created by or complainant)
        const userTickets = res.data.filter(ticket => 
          ticket.createdBy === uid || ticket.complainant === uid
        );
        setTickets(userTickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Tickets API Error:', err);
      Alert.alert('Error', 'Could not fetch your tickets');
      setTickets([]);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  // Create ticket with proper parameters
  const createTicket = async () => {
    if (!userData || !description.trim()) {
      Alert.alert('Error', 'Please enter description');
      return;
    }
    
    if (!isLoggedIn) {
      Alert.alert('Error', 'Please login to create tickets');
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.post(
        'https://api.ataichatbot.mcndhanore.co.in/public/api/create-ticket',
        {
          deviceID: "2",
          complaintID: 5,
          description: description.trim(),
          createdBy: userData.user_id,
          complainant: userData.user_id
        }
      );
      
      if (res.data.status !== false) {
        Alert.alert('Success', 'Ticket created successfully!');
        setDescription('');
        setModalVisible(false);
        // Refresh tickets after creating
        fetchTickets(userData.user_id);
      } else {
        Alert.alert('Error', res.data.message || 'Could not create ticket');
      }
    } catch (err) {
      console.error('Create Ticket Error:', err);
      Alert.alert('Error', 'Could not create ticket');
    } finally {
      setLoading(false);
    }
  };

  // Update ticket with proper parameters
  const updateTicket = async (ticket: Ticket) => {
    if (!userData || !isLoggedIn) {
      Alert.alert('Error', 'Please login to update tickets');
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.put(
        'https://api.ataichatbot.mcndhanore.co.in/public/api/update-ticket',
        {
          id: ticket.id,
          deviceID: ticket.deviceID,
          complaintID: ticket.complaintID,
          description: ticket.description || 'Updated from app',
          updatedBy: userData.user_id,
          complainant: userData.user_id
        }
      );
      
      if (res.data.status !== false) {
        Alert.alert('Updated', 'Ticket updated successfully!');
        fetchTickets(userData.user_id);
      } else {
        Alert.alert('Error', res.data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update Ticket Error:', err);
      Alert.alert('Error', 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout (you can call this from a logout button)
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setIsLoggedIn(false);
      setUserData(null);
      setTickets([]);
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  // Show login required screen
  if (!isLoggedIn && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginRequiredContainer}>
          <Text style={styles.loginRequiredTitle}>Login Required</Text>
          <Text style={styles.loginRequiredText}>
            Please login to view and manage your tickets
          </Text>
          <TouchableOpacity 
            style={styles.loginBtn}
            onPress={() => Alert.alert('Info', 'Please go to login screen to continue')}
          >
            <Text style={styles.loginBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
        <Text style={styles.heading}>My Tickets</Text>
        
        {userData && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfo}>Welcome, {userData.name || 'User'}</Text>
            <Text style={styles.userMobile}>Mobile: {userData.mobile}</Text>
            <Text style={styles.ticketCount}>
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}

        <ScrollView 
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tickets found</Text>
              <Text style={styles.emptySubText}>You haven't created any tickets yet</Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketItem}
                onPress={() => setSelectedTicket(ticket)}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
                  <Text style={[
                    styles.ticketStatus,
                    { backgroundColor: getStatusColor(ticket.status) }
                  ]}>
                    {ticket.status || 'Pending'}
                  </Text>
                </View>
                <Text style={styles.ticketText}>Complaint ID: {ticket.complaintID}</Text>
                <Text style={styles.ticketText}>Device ID: {ticket.deviceID}</Text>
                <Text style={styles.ticketDescription} numberOfLines={2}>
                  Description: {ticket.description || 'No description provided'}
                </Text>
                <Text style={styles.ticketMeta}>
                  Created by: You • ID: {ticket.createdBy}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.createBtn}
          disabled={loading || !isLoggedIn}
        >
          <Text style={styles.createBtnText}>+ Create Ticket</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Create Ticket Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modal}>
          <Text style={styles.heading}>New Ticket</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            style={styles.input}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity 
            onPress={createTicket} 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Submit</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              setModalVisible(false);
              setDescription('');
            }} 
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal visible={!!selectedTicket} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modal}>
          <Text style={styles.heading}>Ticket Details</Text>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>ID:</Text>
            <Text style={styles.detailValue}>{selectedTicket?.id}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>Complaint ID:</Text>
            <Text style={styles.detailValue}>{selectedTicket?.complaintID}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{selectedTicket?.description || 'N/A'}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>{selectedTicket?.status || 'Pending'}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              if (selectedTicket) updateTicket(selectedTicket);
              setSelectedTicket(null);
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Update</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedTicket(null)} 
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Helper function to get status color
const getStatusColor = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'resolved':
      return '#d4edda';
    case 'in progress':
    case 'assigned':
      return '#fff3cd';
    case 'pending':
    default:
      return '#e9ecef';
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
    padding: 20 
  },
  animatedContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loginRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginRequiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  loginRequiredText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginBtn: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heading: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15,
    color: '#333',
  },
  userInfoContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  userMobile: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  ticketCount: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  ticketStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#495057',
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
    fontStyle: 'italic',
  },
  ticketMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  list: { 
    flex: 1 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  ticketItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ticketText: { 
    fontSize: 14, 
    marginBottom: 4,
    color: '#333',
  },
  createBtn: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modal: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
  },
  detailContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
});

export default TicketsScreen;