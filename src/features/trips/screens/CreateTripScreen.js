import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as yup from 'yup';

import { CalendarPicker } from '../../../components/CalendarPicker';
import { ROUTES } from '../../../navigation/routes';
import { createTrip } from '../repositories/tripRepository';

const tripSchema = yup.object({
  tripName: yup
    .string()
    .trim()
    .min(2, 'Trip name must be at least 2 characters')
    .required('Trip name is required'),
  destination: yup
    .string()
    .trim()
    .min(2, 'Destination must be at least 2 characters')
    .required('Destination is required'),
  startDate: yup
    .string()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid date')
    .required('Start date is required'),
});

const defaultValues = {
  tripName: '',
  destination: '',
  startDate: '',
};

const textFields = [
  {
    name: 'tripName',
    label: 'Trip name',
    placeholder: 'Summer Goa trip',
    autoCapitalize: 'words',
  },
  {
    name: 'destination',
    label: 'Destination',
    placeholder: 'Goa',
    autoCapitalize: 'words',
  },
];

export function CreateTripScreen({ navigation }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibleDate, setVisibleDate] = useState(new Date());
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm({
    defaultValues,
    resolver: yupResolver(tripSchema),
  });

  const onSubmit = async (values) => {
    try {
      const trip = await createTrip(values);
      navigation.replace(ROUTES.TRIP_DETAILS, { tripId: trip.id });
    } catch (error) {
      setError('root', {
        message: 'Unable to save trip. Please try again.',
      });
      console.error('Failed to create trip:', error);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Create trip</Text>
        <Text style={styles.subtitle}>Choose a trip date, then add families and expenses.</Text>
      </View>

      <View style={styles.form}>
        {textFields.map((field) => (
          <Controller
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: { onBlur, onChange, value } }) => (
              <View style={styles.field}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  autoCapitalize={field.autoCapitalize ?? 'none'}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94a3b8"
                  style={[
                    styles.input,
                    errors[field.name] ? styles.inputError : null,
                  ]}
                  value={value}
                />
                {errors[field.name] ? (
                  <Text style={styles.errorText}>{errors[field.name].message}</Text>
                ) : null}
              </View>
            )}
          />
        ))}

        <Controller
          control={control}
          name="startDate"
          render={({ field: { onChange, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Trip date</Text>
              <Pressable
                style={[styles.dateButton, errors.startDate ? styles.inputError : null]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, !value ? styles.placeholderText : null]}>
                  {value || 'Select date'}
                </Text>
              </Pressable>

              {showDatePicker ? (
                <CalendarPicker
                  selectedDate={value}
                  visibleDate={visibleDate}
                  onChangeMonth={setVisibleDate}
                  onSelectDate={(date) => {
                    onChange(date);
                    setShowDatePicker(false);
                  }}
                />
              ) : null}

              {errors.startDate ? (
                <Text style={styles.errorText}>{errors.startDate.message}</Text>
              ) : null}
            </View>
          )}
        />

        {errors.root ? <Text style={styles.errorText}>{errors.root.message}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          style={[styles.submitButton, isSubmitting ? styles.disabledButton : null]}
          onPress={handleSubmit(onSubmit)}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Trip</Text>
          )}
        </Pressable>
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
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 16,
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
  dateButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  placeholderText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
