import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getTimelineByTripId } from '../repositories/timelineRepository';

const eventLabels = {
  trip_created: 'Trip',
  family_added: 'Family',
  contribution_added: 'Contribution',
  expense_added: 'Expense',
};

export function TimelineScreen({ route }) {
  const { tripId } = route.params;
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTimeline = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedEvents = await getTimelineByTripId(tripId);
      setEvents(savedEvents);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadTimeline();
    }, [loadTimeline])
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
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={events.length ? styles.list : styles.emptyList}
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <View style={styles.dotColumn}>
              <View style={styles.dot} />
              <View style={styles.line} />
            </View>

            <View style={styles.eventCard}>
              <Text style={styles.eventType}>{eventLabels[item.type] || item.type}</Text>
              <Text style={styles.eventTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.eventDescription}>{item.description}</Text>
              ) : null}
              <Text style={styles.eventDate}>
                {new Date(item.occurredAt).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyText}>
              Trip activity will appear after families, contributions, or expenses are added.
            </Text>
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  list: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dotColumn: {
    alignItems: 'center',
    width: 18,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16a34a',
    marginTop: 18,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#dbeafe',
  },
  eventCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    padding: 16,
  },
  eventType: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  eventTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  eventDescription: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  eventDate: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
});
