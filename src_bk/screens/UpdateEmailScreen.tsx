import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface UpdateEmailScreenProps {
  userInfo: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

const UpdateEmailScreen: React.FC<UpdateEmailScreenProps> = ({ userInfo }) => {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !confirmEmail) {
      Alert.alert('Error', 'Please fill in both email fields');
      return;
    }

    if (!validateEmail(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (newEmail !== confirmEmail) {
      Alert.alert('Error', 'Email addresses do not match');
      return;
    }

    if (newEmail === userInfo.email) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setLoading(true);
    
    try {
      // API call to update email
      const response = await fetch('/api/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.id,
          newEmail: newEmail,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Email updated successfully');
        setNewEmail('');
        setConfirmEmail('');
      } else {
        Alert.alert('Error', 'Failed to update email');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.currentEmailContainer}>
        <Text style={styles.label}>Current Email:</Text>
        <Text style={styles.currentEmail}>{userInfo.email}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Email Address:</Text>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="Enter new email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Email:</Text>
        <TextInput
          style={styles.input}
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          placeholder="Confirm new email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdateEmail}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Email</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: You may need to verify your new email address before the change takes effect.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  currentEmailContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  currentEmail: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default UpdateEmailScreen;