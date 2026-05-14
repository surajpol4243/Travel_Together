import { StyleSheet, Text, View } from 'react-native';

export function SummaryCard({ label, value, helperText, accentColor = '#2563eb' }) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  accent: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  label: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 8,
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  helperText: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 13,
  },
});
