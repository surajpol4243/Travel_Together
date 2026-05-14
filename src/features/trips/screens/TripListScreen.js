import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ROUTES } from '../../../navigation/routes';
import { getTrips } from '../repositories/tripRepository';

export function TripListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedTrips = await getTrips();
      setTrips(savedTrips);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  const renderTrip = ({ item }) => (
    <Pressable
      style={styles.tripCard}
      onPress={() => navigation.navigate(ROUTES.TRIP_DETAILS, { tripId: item.id })}
    >
      <View>
        <Text style={styles.tripName}>{item.tripName}</Text>
        <Text style={styles.destination}>{item.destination}</Text>
      </View>
      <Text style={styles.dateRange}>Trip date: {item.startDate}</Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Trips</Text>
          <Text style={styles.subtitle}>Manage every planned group trip.</Text>
        </View>

        <Pressable
          style={styles.createButton}
          onPress={() => navigation.navigate(ROUTES.CREATE_TRIP)}
        >
          <Text style={styles.createButtonText}>New</Text>
        </Pressable>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        contentContainerStyle={trips.length ? styles.list : styles.emptyList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>Create your first trip to start tracking travel money.</Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => navigation.navigate(ROUTES.CREATE_TRIP)}
            >
              <Text style={styles.emptyButtonText}>Create Trip</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 14,
  },
  createButton: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  tripCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 14,
    padding: 16,
  },
  tripName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  destination: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  dateRange: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyButton: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
