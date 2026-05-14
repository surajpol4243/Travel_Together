import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getFamiliesByTripId } from '../../families/repositories/familyRepository';
import {
  createContribution,
  getContributionsByTripId,
  getContributionTotalByTripId,
} from '../repositories/contributionRepository';

const initialForm = {
  familyId: '',
  amount: '',
  month: '',
  notes: '',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export function ContributionScreen({ route }) {
  const { tripId } = route.params;
  const [families, setFamilies] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [savedFamilies, savedContributions, contributionTotal] =
        await Promise.all([
          getFamiliesByTripId(tripId),
          getContributionsByTripId(tripId),
          getContributionTotalByTripId(tripId),
        ]);

      setFamilies(savedFamilies);
      setContributions(savedContributions);
      setTotal(contributionTotal);
      setForm((currentForm) => ({
        ...currentForm,
        familyId: currentForm.familyId || savedFamilies[0]?.id || '',
      }));
    } catch (loadError) {
      console.error('Failed to load contributions:', loadError);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const updateField = (fieldName, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const validateForm = () => {
    const amount = Number(form.amount);

    if (!form.familyId) {
      return 'Select a family before adding a contribution.';
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return 'Amount must be greater than zero.';
    }

    if (!/^\d{4}-\d{2}$/.test(form.month.trim())) {
      return 'Month must use YYYY-MM format.';
    }

    return '';
  };

  const handleAddContribution = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setIsSaving(true);
      await createContribution({
        tripId,
        familyId: form.familyId,
        amount: form.amount,
        month: form.month,
        notes: form.notes,
      });
      setForm((currentForm) => ({
        ...initialForm,
        familyId: currentForm.familyId,
      }));
      await loadData();
    } catch (saveError) {
      setError('Unable to add contribution. Please try again.');
      console.error('Failed to add contribution:', saveError);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#111827" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>Contribution total</Text>
        <Text style={styles.headerAmount}>{formatCurrency(total)}</Text>
        <Text style={styles.headerMeta}>Collected from all families</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Add contribution</Text>

        <Text style={styles.label}>Family</Text>
        <View style={styles.familyOptions}>
          {families.map((family) => (
            <Pressable
              key={family.id}
              style={[
                styles.familyOption,
                form.familyId === family.id ? styles.familyOptionSelected : null,
              ]}
              onPress={() => updateField('familyId', family.id)}
            >
              <Text
                style={[
                  styles.familyOptionText,
                  form.familyId === family.id
                    ? styles.familyOptionTextSelected
                    : null,
                ]}
              >
                {family.familyName}
              </Text>
            </Pressable>
          ))}
        </View>

        {!families.length ? (
          <Text style={styles.emptyHint}>Add families before recording contributions.</Text>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={(value) => updateField('amount', value)}
            placeholder="5000"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={form.amount}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Month</Text>
          <TextInput
            keyboardType="numbers-and-punctuation"
            onChangeText={(value) => updateField('month', value)}
            placeholder="2026-06"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={form.month}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            multiline
            onChangeText={(value) => updateField('notes', value)}
            placeholder="Advance payment"
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.notesInput]}
            value={form.notes}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          disabled={isSaving || !families.length}
          style={[
            styles.addButton,
            isSaving || !families.length ? styles.disabledButton : null,
          ]}
          onPress={handleAddContribution}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.addButtonText}>Add Contribution</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Contribution history</Text>
        <Text style={styles.historyCount}>{contributions.length} records</Text>
      </View>

      <View style={styles.historyList}>
        {contributions.length ? (
          contributions.map((contribution) => (
            <View key={contribution.id} style={styles.historyCard}>
              <View>
                <Text style={styles.familyName}>{contribution.familyName}</Text>
                <Text style={styles.month}>{contribution.month}</Text>
                {contribution.notes ? (
                  <Text style={styles.notes}>{contribution.notes}</Text>
                ) : null}
              </View>
              <Text style={styles.amount}>{formatCurrency(contribution.amount)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No contributions yet</Text>
            <Text style={styles.emptyText}>Add a contribution to start the history.</Text>
          </View>
        )}
      </View>
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  headerCard: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
    marginBottom: 18,
    padding: 20,
  },
  headerLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  headerAmount: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  headerMeta: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
  },
  formCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 14,
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  familyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  familyOption: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  familyOptionSelected: {
    borderColor: '#111827',
    backgroundColor: '#2563eb',
  },
  familyOptionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  familyOptionTextSelected: {
    color: '#ffffff',
  },
  emptyHint: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
  field: {
    gap: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notesInput: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  disabledButton: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyCount: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  familyName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  month: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  notes: {
    marginTop: 6,
    color: '#475569',
    fontSize: 14,
  },
  amount: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
