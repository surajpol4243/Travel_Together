import { Pressable, StyleSheet, Text, View } from 'react-native';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (date) => date.toISOString().split('T')[0];

const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getCalendarDays = (visibleDate) => {
  const monthStart = getMonthStart(visibleDate);
  const days = [];
  const leadingEmptyDays = monthStart.getDay();
  const totalDays = new Date(
    visibleDate.getFullYear(),
    visibleDate.getMonth() + 1,
    0
  ).getDate();

  for (let index = 0; index < leadingEmptyDays; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), day));
  }

  return days;
};

export function CalendarPicker({ selectedDate, visibleDate, onChangeMonth, onSelectDate }) {
  const calendarDays = getCalendarDays(visibleDate);
  const monthTitle = visibleDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const moveMonth = (amount) => {
    onChangeMonth(new Date(visibleDate.getFullYear(), visibleDate.getMonth() + amount, 1));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable style={styles.navButton} onPress={() => moveMonth(-1)}>
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{monthTitle}</Text>
        <Pressable style={styles.navButton} onPress={() => moveMonth(1)}>
          <Text style={styles.navButtonText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekdays.map((weekday) => (
          <Text key={weekday} style={styles.weekday}>
            {weekday}
          </Text>
        ))}
      </View>

      <View style={styles.dayGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateValue = formatDate(date);
          const isSelected = selectedDate === dateValue;

          return (
            <Pressable
              key={dateValue}
              style={[styles.dayCell, isSelected ? styles.selectedDay : null]}
              onPress={() => onSelectDate(dateValue)}
            >
              <Text style={[styles.dayText, isSelected ? styles.selectedDayText : null]}>
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  navButtonText: {
    color: '#2563eb',
    fontSize: 24,
    fontWeight: '800',
  },
  monthTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    color: '#64748b',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    width: '14.2857%',
  },
  selectedDay: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  dayText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#ffffff',
  },
});
