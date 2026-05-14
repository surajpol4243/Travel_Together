import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as yup from 'yup';

import { getFamiliesByTripId } from '../../families/repositories/familyRepository';
import { EXPENSE_CATEGORIES } from '../constants/expenseCategories';
import {
  createExpense,
  deleteExpense,
  getExpensesByTripId,
} from '../repositories/expenseRepository';

const defaultValues = {
  title: '',
  amount: '',
  category: EXPENSE_CATEGORIES[0],
  paidBy: '',
  date: '',
};

const expenseSchema = yup.object({
  title: yup.string().trim().min(2, 'Title must be at least 2 characters').required('Title is required'),
  amount: yup
    .number()
    .typeError('Amount is required')
    .positive('Amount must be greater than zero')
    .required('Amount is required'),
  category: yup.string().oneOf(EXPENSE_CATEGORIES).required('Category is required'),
  paidBy: yup.string().required('Select who paid'),
  date: yup
    .string()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .required('Date is required'),
});

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export function ExpenseScreen({ route }) {
  const { tripId } = route.params;
  const [families, setFamilies] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues,
    resolver: yupResolver(expenseSchema),
  });

  const selectedCategory = watch('category');
  const selectedPaidBy = watch('paidBy');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [savedFamilies, savedExpenses] = await Promise.all([
        getFamiliesByTripId(tripId),
        getExpensesByTripId(tripId),
      ]);

      setFamilies(savedFamilies);
      setExpenses(savedExpenses);

      if (savedFamilies.length && !selectedPaidBy) {
        setValue('paidBy', savedFamilies[0].id);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPaidBy, setValue, tripId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onSubmit = async (values) => {
    try {
      setSaveError('');
      await createExpense({
        tripId,
        ...values,
      });
      reset({
        ...defaultValues,
        paidBy: values.paidBy,
      });
      await loadData();
    } catch (error) {
      setSaveError('Unable to add expense. Please try again.');
      console.error('Failed to add expense:', error);
    }
  };

  const handleDeleteExpense = (expenseId) => {
    Alert.alert('Delete expense', 'This expense will be removed from the trip.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(expenseId);
            await loadData();
          } catch (error) {
            setSaveError('Unable to delete expense. Please try again.');
            console.error('Failed to delete expense:', error);
          }
        },
      },
    ]);
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
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Add expense</Text>

        <Controller
          control={control}
          name="title"
          render={({ field: { onBlur, onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Dinner bill"
                placeholderTextColor="#94a3b8"
                style={[styles.input, errors.title ? styles.inputError : null]}
                value={value}
              />
              {errors.title ? <Text style={styles.errorText}>{errors.title.message}</Text> : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { onBlur, onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                keyboardType="decimal-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="2500"
                placeholderTextColor="#94a3b8"
                style={[styles.input, errors.amount ? styles.inputError : null]}
                value={String(value)}
              />
              {errors.amount ? <Text style={styles.errorText}>{errors.amount.message}</Text> : null}
            </View>
          )}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionGrid}>
            {EXPENSE_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.option,
                  selectedCategory === category ? styles.optionSelected : null,
                ]}
                onPress={() => setValue('category', category, { shouldValidate: true })}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedCategory === category ? styles.optionTextSelected : null,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.category ? <Text style={styles.errorText}>{errors.category.message}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Paid by</Text>
          <View style={styles.optionGrid}>
            {families.map((family) => (
              <Pressable
                key={family.id}
                style={[
                  styles.option,
                  selectedPaidBy === family.id ? styles.optionSelected : null,
                ]}
                onPress={() => setValue('paidBy', family.id, { shouldValidate: true })}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedPaidBy === family.id ? styles.optionTextSelected : null,
                  ]}
                >
                  {family.familyName}
                </Text>
              </Pressable>
            ))}
          </View>
          {!families.length ? (
            <Text style={styles.errorText}>Add families before adding expenses.</Text>
          ) : null}
          {errors.paidBy ? <Text style={styles.errorText}>{errors.paidBy.message}</Text> : null}
        </View>

        <Controller
          control={control}
          name="date"
          render={({ field: { onBlur, onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                keyboardType="numbers-and-punctuation"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="2026-06-05"
                placeholderTextColor="#94a3b8"
                style={[styles.input, errors.date ? styles.inputError : null]}
                value={value}
              />
              {errors.date ? <Text style={styles.errorText}>{errors.date.message}</Text> : null}
            </View>
          )}
        />

        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

        <Pressable
          disabled={isSubmitting || !families.length}
          style={[
            styles.addButton,
            isSubmitting || !families.length ? styles.disabledButton : null,
          ]}
          onPress={handleSubmit(onSubmit)}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.addButtonText}>Add Expense</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Expense list</Text>
        <Text style={styles.historyCount}>{expenses.length} records</Text>
      </View>

      <View style={styles.expenseList}>
        {expenses.length ? (
          expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseCard}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <Text style={styles.expenseMeta}>
                  {expense.category} • {expense.date}
                </Text>
                <Text style={styles.expenseMeta}>
                  Paid by {expense.paidByName || 'Unknown family'}
                </Text>
              </View>

              <View style={styles.expenseActions}>
                <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteExpense(expense.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptyText}>Add expenses to track trip spending.</Text>
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
  inputError: {
    borderColor: '#dc2626',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  optionSelected: {
    borderColor: '#111827',
    backgroundColor: '#2563eb',
  },
  optionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#ffffff',
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
  expenseList: {
    gap: 12,
  },
  expenseCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  expenseMeta: {
    marginTop: 5,
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  expenseActions: {
    alignItems: 'flex-end',
    gap: 10,
  },
  expenseAmount: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '800',
  },
  deleteButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 12,
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
