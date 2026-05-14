import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  createFamily,
  deleteFamily,
  getFamiliesByTripId,
} from '../repositories/familyRepository';

const initialForm = {
  familyName: '',
  memberCount: '',
};

export function FamilyListScreen({ route }) {
  const { tripId } = route.params;
  const [families, setFamilies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadFamilies = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedFamilies = await getFamiliesByTripId(tripId);
      setFamilies(savedFamilies);
    } catch (loadError) {
      console.error('Failed to load families:', loadError);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadFamilies();
    }, [loadFamilies])
  );

  const updateField = (fieldName, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const validateForm = () => {
    const memberCount = Number(form.memberCount);

    if (!form.familyName.trim()) {
      return 'Family name is required.';
    }

    if (!Number.isInteger(memberCount) || memberCount <= 0) {
      return 'Member count must be a positive whole number.';
    }

    return '';
  };

  const handleAddFamily = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setIsSaving(true);
      await createFamily({
        tripId,
        familyName: form.familyName,
        memberCount: form.memberCount,
      });
      setForm(initialForm);
      await loadFamilies();
    } catch (saveError) {
      setError('Unable to add family. Please try again.');
      console.error('Failed to add family:', saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFamily = (familyId) => {
    Alert.alert('Delete family', 'This family will be removed from the trip.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFamily(familyId);
            await loadFamilies();
          } catch (deleteError) {
            setError('Unable to delete family. Please try again.');
            console.error('Failed to delete family:', deleteError);
          }
        },
      },
    ]);
  };

  const renderFamily = ({ item }) => (
    <View style={styles.familyCard}>
      <View>
        <Text style={styles.familyName}>{item.familyName}</Text>
        <Text style={styles.memberCount}>
          {item.memberCount} {item.memberCount === 1 ? 'member' : 'members'}
        </Text>
      </View>

      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDeleteFamily(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Families</Text>
        <Text style={styles.subtitle}>Add and manage families for this trip.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add family</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Family name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => updateField('familyName', value)}
            placeholder="Sharma family"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={form.familyName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Member count</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(value) => updateField('memberCount', value)}
            placeholder="4"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={form.memberCount}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          disabled={isSaving}
          style={[styles.addButton, isSaving ? styles.disabledButton : null]}
          onPress={handleAddFamily}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.addButtonText}>Add Family</Text>
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#111827" />
        </View>
      ) : (
        <FlatList
          data={families}
          keyExtractor={(item) => item.id}
          renderItem={renderFamily}
          contentContainerStyle={families.length ? styles.list : styles.emptyList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No families added</Text>
              <Text style={styles.emptyText}>
                Add families to start tracking contributions and expenses.
              </Text>
            </View>
          }
        />
      )}
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
    marginBottom: 18,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 15,
  },
  formCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 14,
    marginBottom: 18,
    padding: 16,
  },
  formTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  field: {
    gap: 8,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
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
  loadingState: {
    paddingVertical: 24,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  familyCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  familyName: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  memberCount: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
