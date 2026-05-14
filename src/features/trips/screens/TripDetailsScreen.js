import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ROUTES } from '../../../navigation/routes';
import { getTripById } from '../repositories/tripRepository';

export function TripDetailsScreen({ navigation, route }) {
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTrip() {
      try {
        const savedTrip = await getTripById(route.params.tripId);

        if (isMounted) {
          setTrip(savedTrip);
        }
      } catch (error) {
        console.error('Failed to load trip:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTrip();

    return () => {
      isMounted = false;
    };
  }, [route.params.tripId]);

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyTitle}>Trip not found</Text>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate(ROUTES.TRIP_LIST)}
        >
          <Text style={styles.buttonText}>Back to Trips</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerCard}>
        <Text style={styles.destination}>{trip.destination}</Text>
        <Text style={styles.title}>{trip.tripName}</Text>
        <Text style={styles.dateRange}>Trip date: {trip.startDate}</Text>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow label="Trip name" value={trip.tripName} />
        <DetailRow label="Destination" value={trip.destination} />
        <DetailRow label="Trip date" value={trip.startDate} />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate(ROUTES.FAMILIES, { tripId: trip.id })}
      >
        <Text style={styles.buttonText}>Manage Families</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate(ROUTES.CONTRIBUTIONS, { tripId: trip.id })
        }
      >
        <Text style={styles.buttonText}>Manage Contributions</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate(ROUTES.EXPENSES, { tripId: trip.id })}
      >
        <Text style={styles.buttonText}>Manage Expenses</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate(ROUTES.SETTLEMENTS, { tripId: trip.id })
        }
      >
        <Text style={styles.buttonText}>View Settlements</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate(ROUTES.TIMELINE, { tripId: trip.id })}
      >
        <Text style={styles.buttonText}>View Timeline</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate(ROUTES.TRIP_LIST)}
      >
        <Text style={styles.secondaryButtonText}>View All Trips</Text>
      </Pressable>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  headerCard: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
    marginBottom: 16,
    padding: 20,
  },
  destination: {
    color: '#dbeafe',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  dateRange: {
    marginTop: 10,
    color: '#dbeafe',
    fontSize: 15,
    fontWeight: '700',
  },
  detailsCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginBottom: 16,
    padding: 16,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 12,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    marginTop: 4,
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '800',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
});
