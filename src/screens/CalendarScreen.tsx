import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const CalendarIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2"/>
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2"/>
  </Svg>
);

const ClockIcon = ({ size = 16, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill={color}/>
    <Path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2"/>
  </Svg>
);

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = [
    {
      id: 1,
      title: 'Team Meeting',
      time: '09:00 AM',
      date: '2024-01-15',
      type: 'meeting',
      color: '#2196F3',
    },
    {
      id: 2,
      title: 'Ticket Review',
      time: '11:30 AM',
      date: '2024-01-15',
      type: 'task',
      color: '#4CAF50',
    },
    {
      id: 3,
      title: 'System Maintenance',
      time: '02:00 PM',
      date: '2024-01-15',
      type: 'maintenance',
      color: '#FF9800',
    },
    {
      id: 4,
      title: 'Customer Call',
      time: '04:00 PM',
      date: '2024-01-15',
      type: 'call',
      color: '#9C27B0',
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const EventItem = ({ event }) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={[styles.eventColor, { backgroundColor: event.color }]} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventTime}>
          <ClockIcon size={14} color="#666" />
          <Text style={styles.eventTimeText}>{event.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18l-6-6 6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <Text style={styles.monthText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Days of week header */}
          <View style={styles.daysHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.dayHeaderText}>{day}</Text>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {getDaysInMonth(selectedDate).map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day && isToday(day) && styles.todayCell,
                ]}
                disabled={!day}
              >
                {day && (
                  <Text style={[
                    styles.dayText,
                    isToday(day) && styles.todayText,
                  ]}>
                    {day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Events */}
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Today's Events</Text>
          {events.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  todayCell: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventsContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
});

export default CalendarScreen;