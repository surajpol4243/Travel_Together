import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ROUTES } from '../../../navigation/routes';

export function DashboardScreen({ navigation }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TravelTogether</Text>
          <Text style={styles.title}>Trips</Text>
          <Text style={styles.subtitle}>
            Create a trip and manage families, contributions, expenses, and settlements inside it.
          </Text>
        </View>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.actionTitle}>Start planning</Text>
        <Text style={styles.actionText}>
          Each trip has its own families, wallet, contributions, expenses, and settlement summary.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate(ROUTES.CREATE_TRIP)}
        >
          <Text style={styles.primaryButtonText}>Create Trip</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate(ROUTES.TRIP_LIST)}
      >
        <Text style={styles.secondaryButtonText}>View Trips</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 16,
    lineHeight: 23,
  },
  actionCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  actionTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  actionText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '800',
  },
});
