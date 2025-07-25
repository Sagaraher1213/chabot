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
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface SettingsScreenProps {
  userInfo: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

interface SettingItem {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
  action: string;
}

// SVG Icon Components
const AccountIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
      fill={color}
    />
  </Svg>
);

const NotificationIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
      fill={color}
    />
  </Svg>
);

const PrivacyIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z"
      fill={color}
    />
  </Svg>
);

const ThemeIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3C16.97 3 21 7.03 21 12S16.97 21 12 21C7.03 21 3 16.97 3 12S7.03 3 12 3ZM12 19C15.86 19 19 15.86 19 12S15.86 5 12 5V19Z"
      fill={color}
    />
  </Svg>
);

const LanguageIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z"
      fill={color}
    />
  </Svg>
);

const AboutIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
      fill={color}
    />
  </Svg>
);

const LogoutIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"
      fill={color}
    />
  </Svg>
);

const ChevronRightIcon = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ userInfo, onLogout }) => {
  const settingsItems: SettingItem[] = [
    { id: 1, title: 'Account Settings', icon: AccountIcon, action: 'account' },
    { id: 2, title: 'Notifications', icon: NotificationIcon, action: 'notifications' },
    { id: 3, title: 'Privacy', icon: PrivacyIcon, action: 'privacy' },
    { id: 4, title: 'Theme', icon: ThemeIcon, action: 'theme' },
    { id: 5, title: 'Language', icon: LanguageIcon, action: 'language' },
    { id: 6, title: 'About', icon: AboutIcon, action: 'about' },
  ];

  const handleSettingPress = (action: string): void => {
    switch (action) {
      case 'account':
        Alert.alert('Account Settings', 'Account settings screen');
        break;
      case 'notifications':
        Alert.alert('Notifications', 'Notification settings screen');
        break;
      case 'privacy':
        Alert.alert('Privacy', 'Privacy settings screen');
        break;
      case 'theme':
        Alert.alert('Theme', 'Theme settings screen');
        break;
      case 'language':
        Alert.alert('Language', 'Language settings screen');
        break;
      case 'about':
        Alert.alert('About', 'ChatBot App v1.0\nTickets Insights Dashboard');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo?.name}</Text>
            <Text style={styles.userEmail}>{userInfo?.email}</Text>
            <Text style={styles.userRole}>{userInfo?.role}</Text>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index === settingsItems.length - 1 && styles.lastSettingItem
                ]}
                onPress={() => handleSettingPress(item.action)}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconContainer}>
                    <IconComponent size={20} color="#666" />
                  </View>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                </View>
                <ChevronRightIcon size={20} color="#ccc" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
<TouchableOpacity
  style={styles.logoutButton}
  onPress={() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: handleLogout },
      ]
    );
  }}
>
  {/* Replace this with your actual icon component or keep this if <LogoutIcon /> works */}
  {/* <LogoutIcon size={20} color="#fff" /> */}
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>

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
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen;