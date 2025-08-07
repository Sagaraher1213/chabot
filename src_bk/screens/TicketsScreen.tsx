import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView, Modal, Alert,
  ActivityIndicator, RefreshControl, Animated, FlatList, Dimensions, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

interface User {
  user_id: number;
  name: string;
  user_name?: string;
  mobile: string;
  email?: string;
  client_id?: string;
  abbreviation?: string;
  role?: string;
  agent_type?: string;
}

interface Complaint {
  id: number;
  tkt_id: number;
  createdAt: string;
  updatedAt: string;
  deviceID: string;
  complaintID: number;
  Description: string;
  createdBy: number;
  updatedBy: number;
  appointmentDate: string;
  complaint_description: string;
  product_name?: string;
  complaint_detail: string;
  subscription_product_id?: number;
}

interface Ticket {
  id: number;
  ticket_id?: number;
  createdAt: string;
  updatedAt?: string;
  Description?: string;
  createdBy?: number;
  updatedBy?: number;
  complainant: number;
  ticket_description: string;
  complaintname: string;
  complaint_mobile?: string;
  complaintmobile?: string;
  complaintemail?: string;
  status: string;
  assignedTo?: number;
  assignedName?: string;
  assigned_to?: string[];
  activity_description?: string;
  complaints: Complaint[];
}

interface TicketCounts {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  assigned: number;
  open: number;
}

interface ApiTicketCountsResponseData {
  totalCount: number;
  openCount: number;
  closedCount: number;
  inProgressCount: number;
  noResponseCount: number;
}

const TicketsScreen = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketCounts, setTicketCounts] = useState<TicketCounts>({
    total: 0, pending: 0, inProgress: 0, completed: 0, assigned: 0, open: 0
  });
  const [apiTicketCounts, setApiTicketCounts] = useState<ApiTicketCountsResponseData>({
    totalCount: 0, openCount: 0, closedCount: 0, inProgressCount: 0, noResponseCount: 0
  });
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [updateDescription, setUpdateDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatusForUpdate, setSelectedStatusForUpdate] = useState<string>('');
  const [followUpDateForUpdate, setFollowUpDateForUpdate] = useState<string>('');

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const fetchAgentProfile = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        setIsLoggedIn(false);
        setUserData(null);
        setTickets([]);
        Alert.alert('Error', 'Agent ID not found. Please login again.');
        return;
      }
      const parsedUser = JSON.parse(userDataString);
      setUserData(parsedUser);
      setIsLoggedIn(true);
      animateContent();

      if (parsedUser.user_id) {
        await fetchTicketCountsFromAPI(parsedUser.user_id);
      } else {
        console.warn('User ID not found for fetching ticket counts.');
      }
      // Pass agentId and agentName to fetchAllTickets to filter by assigned tickets
      await fetchAllTickets(parsedUser.client_id || 94, parsedUser.user_id, parsedUser.name);
    } catch (error) {
      console.error('Agent Profile Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const animateContent = () => {
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
    ]).start();
  };

  const fetchTicketCountsFromAPI = async (agentId: number) => {
    try {
      const countsApiUrl = `https://api.ataichatbot.mcndhanore.co.in/public/api/tickets/counts?agentId=${agentId}`;
      const response = await axios.get(countsApiUrl, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.data && response.data.status && response.data.data) {
        const apiData = response.data.data as ApiTicketCountsResponseData;
        setApiTicketCounts(apiData);
        setTicketCounts(prevCounts => ({
          ...prevCounts,
          total: apiData.totalCount,
          open: apiData.openCount,
          inProgress: apiData.inProgressCount,
          completed: apiData.closedCount,
        }));
      } else {
        setApiTicketCounts({ totalCount: 0, openCount: 0, closedCount: 0, inProgressCount: 0, noResponseCount: 0 });
        setTicketCounts(prevCounts => ({
          ...prevCounts,
          total: 0, open: 0, inProgress: 0, completed: 0,
        }));
      }
    } catch (error) {
      console.error('Counts API Error:', error);
      Alert.alert('Error', 'Could not fetch ticket counts.');
      setApiTicketCounts({ totalCount: 0, openCount: 0, closedCount: 0, inProgressCount: 0, noResponseCount: 0 });
      setTicketCounts(prevCounts => ({
        ...prevCounts,
        total: 0, open: 0, inProgress: 0, completed: 0,
      }));
    }
  };

  // Modified to fetch and filter only assigned tickets
  const fetchAllTickets = async (clientId: number, agentId: number, agentName: string) => {
    try {
      const ticketApiUrl = `https://api.ataichatbot.mcndhanore.co.in/public/api/tickets-with-details/${clientId}`;
      const response = await axios.get(ticketApiUrl, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      let ticketsData: Ticket[] = [];
      if (response.data) {
        if (response.data.tickets && Array.isArray(response.data.tickets)) {
          ticketsData = response.data.tickets;
        } else if (response.data.status && response.data.data) {
          if (Array.isArray(response.data.data)) {
            ticketsData = response.data.data;
          } else {
            ticketsData = [response.data.data];
          }
        } else if (Array.isArray(response.data)) {
          ticketsData = response.data;
        } else if (typeof response.data === 'object' && (response.data.id || response.data.ticket_id)) {
          ticketsData = [response.data];
        }

        const processedTickets = ticketsData.map((ticket, index) => {
          const processedTicket: Ticket = {
            id: ticket.ticket_id || ticket.id || index + 1,
            ticket_id: ticket.ticket_id || ticket.id,
            createdAt: ticket.createdAt || new Date().toISOString(),
            updatedAt: ticket.updatedAt,
            Description: ticket.Description || ticket.ticket_description || ticket.activity_description,
            createdBy: ticket.createdBy,
            updatedBy: ticket.updatedBy,
            complainant: ticket.complainant,
            ticket_description: ticket.ticket_description || ticket.activity_description || '',
            complaintname: ticket.complaintname || 'Unknown',
            complaint_mobile: ticket.complaint_mobile || ticket.complaintmobile,
            complaintmobile: ticket.complaintmobile,
            complaintemail: ticket.complaintemail,
            status: ticket.status || 'OPN',
            assignedTo: ticket.assignedTo,
            assignedName: ticket.assignedName,
            assigned_to: ticket.assigned_to,
            activity_description: ticket.activity_description,
            complaints: ticket.complaints || []
          };
          return processedTicket;
        });

        // Filter tickets to only show those assigned to the current agent
        const agentAssignedTickets = processedTickets.filter(ticket =>
          ticket.assignedTo === agentId ||
          (ticket.assigned_to && agentName && ticket.assigned_to.includes(agentName))
        );

        setTickets(agentAssignedTickets);
        calculateTicketCounts(agentAssignedTickets); // Calculate counts based on assigned tickets
      } else {
        setTickets([]);
        calculateTicketCounts([]);
      }
    } catch (error) {
      console.error('Tickets API Error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error Response:', error.response.data);
        console.error('Error Status:', error.response.status);
      }
      await fetchTicketsWithGetAPI(agentId, agentName); // Fallback with agent filtering
    }
  };

  // Fallback: Use get-ticket API to fetch multiple tickets, then filter
  const fetchTicketsWithGetAPI = async (agentId: number, agentName: string) => {
    try {
      const ticketApiUrl = 'https://api.ataichatbot.mcndhanore.co.in/public/api/get-ticket';
      const response = await axios.get(ticketApiUrl, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      let ticketsData: Ticket[] = [];
      if (response.data) {
        if (response.data.tickets && Array.isArray(response.data.tickets)) {
          ticketsData = response.data.tickets;
        } else if (response.data.status && response.data.data) {
          if (Array.isArray(response.data.data)) {
            ticketsData = response.data.data;
          } else {
            ticketsData = [response.data.data];
          }
        } else if (Array.isArray(response.data)) {
          ticketsData = response.data;
        } else if (typeof response.data === 'object' && (response.data.id || response.data.ticket_id)) {
          ticketsData = [response.data];
        }

        const processedTickets = ticketsData.map((ticket, index) => ({
          id: ticket.ticket_id || ticket.id || index + 1,
          ticket_id: ticket.ticket_id || ticket.id,
          createdAt: ticket.createdAt || new Date().toISOString(),
          updatedAt: ticket.updatedAt,
          Description: ticket.Description || ticket.ticket_description || ticket.activity_description,
          createdBy: ticket.createdBy,
          updatedBy: ticket.updatedBy,
          complainant: ticket.complainant,
          ticket_description: ticket.ticket_description || ticket.activity_description || '',
          complaintname: ticket.complaintname || 'Unknown',
          complaint_mobile: ticket.complaint_mobile || ticket.complaintmobile,
          complaintmobile: ticket.complaintmobile,
          complaintemail: ticket.complaintemail,
          status: ticket.status || 'OPN',
          assignedTo: ticket.assignedTo,
          assignedName: ticket.assignedName,
          assigned_to: ticket.assigned_to,
          activity_description: ticket.activity_description,
          complaints: ticket.complaints || []
        }));

        // Filter tickets to only show those assigned to the current agent
        const agentAssignedTickets = processedTickets.filter(ticket =>
          ticket.assignedTo === agentId ||
          (ticket.assigned_to && agentName && ticket.assigned_to.includes(agentName))
        );

        setTickets(agentAssignedTickets);
        calculateTicketCounts(agentAssignedTickets);
      } else {
        setTickets([]);
        calculateTicketCounts([]);
      }
    } catch (error) {
      console.error('Fallback Get Ticket API Error:', error);
      Alert.alert('Error', 'Could not fetch tickets from any API');
      setTickets([]);
      calculateTicketCounts([]);
    }
  };

  // Calculate ticket counts from the fetched (already assigned) tickets
  const calculateTicketCounts = (assignedTickets: Ticket[]) => {
    if (!userData) return;

    const pending = assignedTickets.filter(ticket =>
      ticket.status === 'PEN' || ticket.status === 'PENDING'
    ).length;
    const inProgress = assignedTickets.filter(ticket =>
      ticket.status === 'INP' || ticket.status === 'IN_PROGRESS'
    ).length;
    const completed = assignedTickets.filter(ticket =>
      ticket.status === 'COM' || ticket.status === 'COMPLETED'
    ).length;
    const open = assignedTickets.filter(ticket =>
      ticket.status === 'OPN' || ticket.status === 'OPEN' ||
      (ticket.status === 'PEN' || ticket.status === 'PENDING') // Count pending as open for display
    ).length;

    setTicketCounts(prevCounts => ({
      ...prevCounts,
      total: assignedTickets.length, // Total of assigned tickets
      pending,
      inProgress,
      completed,
      open,
      assigned: assignedTickets.length, // All tickets in this list are assigned
    }));
  };

  const updateTicketStatus = async (ticket: Ticket) => {
    if (!userData || !updateDescription.trim()) {
      Alert.alert('Error', 'Please enter update description');
      return;
    }
    if (!ticket.id) {
      Alert.alert('Error', 'Invalid ticket ID');
      return;
    }
    if (!selectedStatusForUpdate) {
      Alert.alert('Error', 'Please select a status');
      return;
    }
    if (!followUpDateForUpdate) {
      Alert.alert('Error', 'Please select a follow-up date');
      return;
    }
    // New check: Ensure there are complaints to update
    if (!ticket.complaints || ticket.complaints.length === 0) {
      Alert.alert('Error', 'Cannot update ticket: No complaints found for this ticket.');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        ticketId: ticket.id,
        description: updateDescription.trim(),
        updatedBy: userData.user_id,
        complaintIDs: ticket.complaints.map(complaint => ({
          p_DC_id: complaint.id,
          description: updateDescription.trim(),
          followUpDate: followUpDateForUpdate, // Use selected follow-up date (now consistently YYYY-MM-DD)
          assignedTo: userData.user_id,
          status: selectedStatusForUpdate // Use selected status
        }))
      };

      const response = await axios.put(
        'https://api.ataichatbot.mcndhanore.co.in/public/api/update-ticket',
        updateData,
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.status !== false) {
        Alert.alert('Success', 'Ticket updated successfully!');
        setUpdateDescription('');
        setSelectedStatusForUpdate('');
        setFollowUpDateForUpdate('');
        setModalVisible(false);
        setSelectedTicket(null);
        await fetchAgentProfile();
      } else {
        // More specific error message if the API provides one
        Alert.alert('Error', response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update Ticket Error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        Alert.alert('Error', error.response.data.message || 'Update failed due to network or server issue.');
      } else {
        Alert.alert('Error', 'Update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentProfile();
  }, []); // Empty dependency array means it runs once on mount [^3]

  const onRefresh = () => {
    setRefreshing(true);
    fetchAgentProfile();
  };

  const getFilteredTickets = () => {
    if (!userData) return [];
    let filtered = tickets; // 'tickets' now only contains assigned tickets

    switch (activeFilter) {
      case 'pending':
        filtered = tickets.filter(ticket =>
          ticket.status === 'PEN' || ticket.status === 'PENDING'
        );
        break;
      case 'inProgress':
        filtered = tickets.filter(ticket =>
          ticket.status === 'INP' || ticket.status === 'IN_PROGRESS'
        );
        break;
      case 'completed':
        filtered = tickets.filter(ticket =>
          ticket.status === 'COM' || ticket.status === 'COMPLETED'
        );
        break;
      case 'open':
        // For assigned tickets, 'Pending' is displayed as 'Open', so filter for both
        filtered = tickets.filter(ticket =>
          ticket.status === 'OPN' || ticket.status === 'OPEN' ||
          (ticket.status === 'PEN' || ticket.status === 'PENDING') // Display pending as open if assigned
        );
        break;
      case 'assigned': // 'assigned' filter will show all tickets in the 'tickets' state
      case 'all':
      default:
        filtered = tickets;
        break;
    }
    return filtered;
  };

  const renderAgentInfo = () => {
    if (!userData) return null;
    return (
      <View style={styles.agentInfoContainer}>
        <Text style={styles.agentName}>Agent: {userData.user_name || userData.name || 'Agent'}</Text>
        <Text style={styles.agentMobile}>
          Mobile: {userData.mobile ? userData.mobile : 'Not Available'}
        </Text>
        {userData.email && (
          <Text style={styles.agentEmail}>Email: {userData.email}</Text>
        )}
        {userData.agent_type && (
          <Text style={styles.agentType}>Type: {userData.agent_type}</Text>
        )}
        {/* Removed Agent ID and Client ID as requested */}
      </View>
    );
  };

  const renderTicketCounts = () => {
    return (
      <View style={styles.countsMainContainer}>
        <View style={styles.countsTopRow}>
          <TouchableOpacity
            style={[styles.countItemLarge, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={styles.countNumberLarge}>{ticketCounts.total}</Text>
            <Text style={styles.countLabelLarge}>Total Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.countItemMedium, activeFilter === 'open' && styles.activeFilter]}
            onPress={() => setActiveFilter('open')}
          >
            <Text style={styles.countNumberMedium}>{ticketCounts.open}</Text>
            <Text style={styles.countLabelMedium}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.countItemMedium, activeFilter === 'assigned' && styles.activeFilter]}
            onPress={() => setActiveFilter('assigned')}
          >
            <Text style={styles.countNumberMedium}>{ticketCounts.assigned}</Text>
            <Text style={styles.countLabelMedium}>Assigned</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.countsBottomRow}>
          <TouchableOpacity
            style={[styles.countItemSmall, activeFilter === 'pending' && styles.activeFilter]}
            onPress={() => setActiveFilter('pending')}
          >
            <Text style={styles.countNumberSmall}>{ticketCounts.pending}</Text>
            <Text style={styles.countLabelSmall}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.countItemSmall, activeFilter === 'inProgress' && styles.activeFilter]}
            onPress={() => setActiveFilter('inProgress')}
          >
            <Text style={styles.countNumberSmall}>{ticketCounts.inProgress}</Text>
            <Text style={styles.countLabelSmall}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.countItemSmall, activeFilter === 'completed' && styles.activeFilter]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text style={styles.countNumberSmall}>{ticketCounts.completed}</Text>
            <Text style={styles.countLabelSmall}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTicketItem = ({ item: ticket }: { item: Ticket }) => {
    const isAssignedToAgent = ticket.assignedTo === userData?.user_id ||
      (ticket.assigned_to && userData?.name && ticket.assigned_to.includes(userData.name)); // Check if agent's name is in assigned_to array

    // Determine display status based on assignment rule
    const displayStatus = isAssignedToAgent && (ticket.status === 'PEN' || ticket.status === 'PENDING')
      ? 'OPN' // Display as Open if assigned and pending
      : ticket.status;

    return (
      <TouchableOpacity
        style={[
          styles.ticketItem,
          isAssignedToAgent && styles.assignedTicketItem
        ]}
        onPress={() => {
          setSelectedTicket(ticket);
          // Initialize update modal states when opening detail modal
          setUpdateDescription(ticket.Description || ticket.ticket_description || ticket.activity_description || '');
          setSelectedStatusForUpdate(ticket.status);
          
          // Default follow-up date to today if not available, or the first complaint's appointment date
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          let initialFollowUpDate = today;
          if (ticket.complaints?.[0]?.appointmentDate) {
            // Replace slashes with hyphens for consistent parsing
            const dateString = ticket.complaints[0].appointmentDate.replace(/\//g, '-');
            const dateObj = new Date(dateString);
            if (!isNaN(dateObj.getTime())) { // Check if date is valid
              initialFollowUpDate = dateObj.toISOString().split('T')[0];
            }
          }
          setFollowUpDateForUpdate(initialFollowUpDate);
        }}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
          <View style={styles.statusContainer}>
            {isAssignedToAgent && (
              <Text style={styles.assignedBadge}>Assigned to You</Text>
            )}
            <Text style={[
              styles.ticketStatus,
              { backgroundColor: getStatusColor(displayStatus) } // Use displayStatus for color
            ]}>
              {getStatusText(displayStatus)} {/* Use displayStatus for text */}
            </Text>
          </View>
        </View>
        <Text style={styles.ticketText}>Customer: {ticket.complaintname}</Text>
        <Text style={styles.ticketText}>
          Mobile: {ticket.complaint_mobile || ticket.complaintmobile || 'N/A'}
        </Text>
        {ticket.complaintemail && (
          <Text style={styles.ticketText}>Email: {ticket.complaintemail}</Text>
        )}
        <Text style={styles.ticketDescription} numberOfLines={2}>
          Description: {ticket.Description || ticket.ticket_description || ticket.activity_description || 'No description'}
        </Text>
        {ticket.assignedName && (
          <Text style={styles.ticketText}>Assigned to: {ticket.assignedName}</Text>
        )}
        {ticket.assigned_to && ticket.assigned_to.length > 0 && (
          <Text style={styles.ticketText}>
            Assigned to: {ticket.assigned_to.join(', ')}
          </Text>
        )}
        <View style={styles.ticketMetaContainer}>
          <Text style={styles.ticketMeta}>
            Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
          {ticket.updatedAt && (
            <Text style={styles.ticketMeta}>
              Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
            </Text>
          )}
          <Text style={styles.ticketMeta}>
            Complaints: {ticket.complaints?.length || 0}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isLoggedIn && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginRequiredContainer}>
          <Text style={styles.loginRequiredTitle}>Agent Login Required</Text>
          <Text style={styles.loginRequiredText}>
            Please login as an agent to view tickets
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

  const filteredTickets = getFilteredTickets();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>My Assigned Tickets</Text>
          <Text style={styles.subHeading}>
            Showing: {filteredTickets.length} of {ticketCounts.total} tickets
          </Text>
        </View>
        {renderAgentInfo()}
        {renderTicketCounts()}
        <FlatList
          data={filteredTickets}
          renderItem={renderTicketItem}
          keyExtractor={(item, index) => {
            return item.id ? item.id.toString() : `ticket-${index}`;
          }}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tickets found</Text>
              <Text style={styles.emptySubText}>
                {activeFilter === 'all'
                  ? 'No assigned tickets available'
                  : `No ${activeFilter} assigned tickets found`}
              </Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={onRefresh}
              >
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Animated.View>

      {/* Ticket Detail Modal */}
      <Modal visible={!!selectedTicket} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modal}>
          <Text style={styles.heading}>Ticket Details</Text>
          <ScrollView style={styles.detailScrollView}>
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Ticket ID:</Text>
              <Text style={styles.detailValue}>{selectedTicket?.id}</Text>
            </View>
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Customer:</Text>
              <Text style={styles.detailValue}>{selectedTicket?.complaintname}</Text>
            </View>
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Mobile:</Text>
              <Text style={styles.detailValue}>
                {selectedTicket?.complaint_mobile || selectedTicket?.mobile || 'N/A'}
              </Text>
            </View>
            {selectedTicket?.complaintemail && (
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedTicket.complaintemail}</Text>
              </View>
            )}
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>
                {selectedTicket?.Description || selectedTicket?.ticket_description || selectedTicket?.activity_description || 'No description'}
              </Text>
            </View>
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, { color: getStatusTextColor(selectedTicket?.status) }]}>
                {getStatusText(selectedTicket?.status)}
              </Text>
            </View>
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Assigned Name:</Text>
              <Text style={styles.detailValue}>{selectedTicket?.assignedName || 'N/A'}</Text>
            </View>
            {selectedTicket?.assigned_to && selectedTicket.assigned_to.length > 0 && (
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>Assigned To:</Text>
                <Text style={styles.detailValue}>{selectedTicket.assigned_to.join(', ')}</Text>
              </View>
            )}
            <View style={styles.detailContainer}>
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {selectedTicket?.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'N/A'}
              </Text>
            </View>
            {selectedTicket?.updatedAt && (
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>Updated:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedTicket.updatedAt).toLocaleString()}
                </Text>
              </View>
            )}
            {/* Complaints Details */}
            {selectedTicket?.complaints && selectedTicket.complaints.length > 0 && (
              <View style={styles.complaintsSection}>
                <Text style={styles.sectionTitle}>Complaints Details:</Text>
                {selectedTicket.complaints.map((complaint, index) => (
                  <View key={complaint.id || index} style={styles.complaintItem}>
                    <Text style={styles.complaintTitle}>Complaint {index + 1}:</Text>
                    <Text style={styles.complaintDetail}>Detail: {complaint.complaint_detail || 'No details'}</Text>
                    <Text style={styles.complaintDesc}>Description: {complaint.complaint_description || 'No description'}</Text>
                    <Text style={styles.complaintDesc}>Product: {complaint.product_name || 'N/A'}</Text>
                    <Text style={styles.complaintDesc}>
                      Appointment: {complaint.appointmentDate ? new Date(complaint.appointmentDate).toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text style={styles.complaintDesc}>
                      Updated: {complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleString() : 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          {/* Only show update button if ticket is assigned to current agent */}
          {(selectedTicket?.assignedTo === userData?.user_id ||
            (selectedTicket?.assigned_to && userData?.name && selectedTicket.assigned_to.includes(userData.name))) && (
              <TouchableOpacity
                style={styles.updateBtn}
                onPress={() => setModalVisible(true)}
                disabled={loading}
              >
                <Text style={styles.btnText}>Update Ticket</Text>
              </TouchableOpacity>
            )}
          <TouchableOpacity
            onPress={() => setSelectedTicket(null)}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Update Ticket Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modal}>
          <Text style={styles.heading}>Update Ticket</Text>

          <Text style={styles.updateLabel}>Update Description:</Text>
          <TextInput
            value={updateDescription}
            onChangeText={setUpdateDescription}
            placeholder="Enter update description"
            style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.updateLabel}>Status:</Text>
          <View style={styles.statusPickerContainer}>
            {['OPN', 'INP', 'COM', 'PEN'].map(statusKey => (
              <TouchableOpacity
                key={statusKey}
                style={[
                  styles.statusOption,
                  selectedStatusForUpdate === statusKey && styles.statusOptionActive
                ]}
                onPress={() => setSelectedStatusForUpdate(statusKey)}
              >
                <Text style={[
                  styles.statusOptionText,
                  selectedStatusForUpdate === statusKey && styles.statusOptionTextActive
                ]}>
                  {getStatusText(statusKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.updateLabel}>Follow-up Date (YYYY-MM-DD):</Text>
          <TextInput
            value={followUpDateForUpdate}
            onChangeText={setFollowUpDateForUpdate}
            placeholder="e.g., 2025-08-06"
            style={styles.input}
            keyboardType={Platform.OS === 'ios' ? 'datetime' : 'default'}
            // For a native date picker, you would typically use a library like @react-native-community/datetimepicker
            // and trigger it on focus or button press. Example:
            // onFocus={() => { /* show date picker */ }}
          />

          <TouchableOpacity
            onPress={() => selectedTicket && updateTicketStatus(selectedTicket)}
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Submit Update</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setUpdateDescription('');
              setSelectedStatusForUpdate('');
              setFollowUpDateForUpdate('');
            }}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Helper functions
const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case 'COM':
    case 'COMPLETED':
      return '#d4edda'; // Light green
    case 'INP':
    case 'IN_PROGRESS':
      return '#fff3cd'; // Light yellow
    case 'OPN':
    case 'OPEN':
      return '#e0e7ff'; // Light blue (for assigned pending/open)
    case 'PEN':
    case 'PENDING':
    default:
      return '#f8d7da'; // Light red
  }
};

const getStatusText = (status: string | undefined) => {
  switch (status) {
    case 'COM':
    case 'COMPLETED':
      return 'Completed';
    case 'INP':
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'OPN':
    case 'OPEN':
      return 'Open';
    case 'PEN':
    case 'PENDING':
    default:
      return 'Pending';
  }
};

const getStatusTextColor = (status: string | undefined) => {
  switch (status) {
    case 'COM':
    case 'COMPLETED':
      return '#28a745'; // Green
    case 'INP':
    case 'IN_PROGRESS':
      return '#ffc107'; // Yellow
    case 'OPN':
    case 'OPEN':
      return '#3b82f6'; // Blue
    case 'PEN':
    case 'PENDING':
    default:
      return '#dc3545'; // Red
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fa',
  },
  animatedContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subHeading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  agentInfoContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  agentMobile: {
    fontSize: 14,
    marginTop: 4,
    color: '#444',
  },
  agentEmail: {
    fontSize: 14,
    color: '#444',
  },
  agentType: {
    fontSize: 14,
    color: '#444',
  },
  // Removed agentId style as the Text components are removed

  countsMainContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  countsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countItemLarge: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginRight: 8,
  },
  countItemMedium: {
    flex: 0.45,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginLeft: 4,
  },
  countItemSmall: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#e0e7ff',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  countNumberLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  countLabelLarge: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '600',
  },
  countNumberMedium: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 2,
  },
  countLabelMedium: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  countNumberSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 2,
  },
  countLabelSmall: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: '500',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  ticketItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  assignedTicketItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketId: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignedBadge: {
    fontSize: 10,
    backgroundColor: '#28a745',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ticketStatus: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#222',
    overflow: 'hidden',
  },
  ticketText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  ticketDescription: {
    fontSize: 13,
    marginTop: 4,
    color: '#666',
  },
  ticketMetaContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketMeta: {
    fontSize: 12,
    color: '#888',
    marginRight: 12,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  emptySubText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    marginBottom: 20,
  },
  refreshBtn: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modal: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  detailScrollView: {
    flex: 1,
  },
  detailContainer: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  complaintsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  complaintItem: {
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  complaintTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#444',
  },
  complaintDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  complaintDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  updateBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#f8d7da',
  },
  cancelBtnText: {
    color: '#721c24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'top',
    minHeight: 50, // Adjusted for single line inputs
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
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
    paddingHorizontal: 24,
  },
  loginRequiredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d9534f',
  },
  loginRequiredText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    minWidth: (width - 32 - 20) / 4, // Roughly 4 items per row with spacing
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  statusOptionText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
});

export default TicketsScreen;