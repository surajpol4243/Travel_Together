import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROUTES } from '../../../navigation/routes';

export function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.description}>Your trip overview will appear here.</Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate(ROUTES.CREATE_TRIP)}
      >
        <Text style={styles.primaryButtonText}>Create Trip</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          navigation.navigate(ROUTES.TRIP_DETAILS, { tripId: 'demo-trip' })
        }
      >
        <Text style={styles.secondaryButtonText}>View Demo Trip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  primaryButton: {
    minWidth: 180,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    minWidth: 180,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
  },
});
