import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

interface HelpScreenProps {
  userInfo: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface HelpItem {
  id: number;
  title: string;
  icon: string;
  action: string;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ userInfo }) => {
  const helpItems: HelpItem[] = [
    { id: 1, title: 'Getting Started', icon: '🚀', action: 'getting_started' },
    { id: 2, title: 'How to Create Tickets', icon: '🎫', action: 'create_tickets' },
    { id: 3, title: 'Dashboard Overview', icon: '📊', action: 'dashboard' },
    { id: 4, title: 'FAQ', icon: '❓', action: 'faq' },
    { id: 5, title: 'Contact Support', icon: '📞', action: 'contact' },
    { id: 6, title: 'Report a Bug', icon: '🐛', action: 'report_bug' },
  ];

  const handleHelpPress = (action: string): void => {
    switch (action) {
      case 'getting_started':
        Alert.alert('Getting Started', 'Welcome to ChatBot! This guide will help you get started with the ticket management system.');
        break;
      case 'create_tickets':
        Alert.alert('Create Tickets', 'Learn how to create and manage support tickets efficiently.');
        break;
      case 'dashboard':
        Alert.alert('Dashboard', 'Understand your dashboard metrics and how to interpret the data.');
        break;
      case 'faq':
        Alert.alert('FAQ', 'Frequently Asked Questions about the ChatBot system.');
        break;
      case 'contact':
        Alert.alert('Contact Support', 'Email: support@chatbot.com\nPhone: +1-234-567-8900');
        break;
      case 'report_bug':
        Alert.alert('Report Bug', 'Found a bug? Please report it to help us improve the app.');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeIcon}>👋</Text>
          <Text style={styles.welcomeTitle}>Hello {userInfo?.name}!</Text>
          <Text style={styles.welcomeText}>
            How can we help you today? Browse through our help topics or contact support directly.
          </Text>
        </View>

        {/* Help Items */}
        <View style={styles.helpSection}>
          {helpItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.helpItem}
              onPress={() => handleHelpPress(item.action)}
            >
              <View style={styles.helpLeft}>
                <Text style={styles.helpIcon}>{item.icon}</Text>
                <Text style={styles.helpTitle}>{item.title}</Text>
              </View>
              <Text style={styles.helpArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Chat', 'Live chat support coming soon!')}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Email', 'Email support: support@chatbot.com')}
            >
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={styles.actionText}>Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>App Information</Text>
          <Text style={styles.appInfoText}>Version: 1.0.0</Text>
          <Text style={styles.appInfoText}>Build: 2024.01.01</Text>
          <Text style={styles.appInfoText}>© 2024 ChatBot Inc.</Text>
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  helpTitle: {
    fontSize: 16,
    color: '#333',
  },
  helpArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
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
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  appInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  appInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default HelpScreen;