import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { SummaryCard } from '../../../components/SummaryCard';
import { getExpensesByTripId } from '../../expenses/repositories/expenseRepository';
import { getFamiliesByTripId } from '../../families/repositories/familyRepository';
import { calculateSettlements } from '../../../utils/settlementCalculator';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export function SettlementScreen({ route }) {
  const { tripId } = route.params;
  const [settlement, setSettlement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettlements = useCallback(async () => {
    try {
      setIsLoading(true);
      const [families, expenses] = await Promise.all([
        getFamiliesByTripId(tripId),
        getExpensesByTripId(tripId),
      ]);

      setSettlement(calculateSettlements(families, expenses));
    } catch (error) {
      console.error('Failed to calculate settlements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useFocusEffect(
    useCallback(() => {
      loadSettlements();
    }, [loadSettlements])
  );

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  const familyBalances = settlement?.familyBalances ?? [];
  const transactions = settlement?.transactions ?? [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.summaryGrid}>
        <SummaryCard
          label="Total expenses"
          value={formatCurrency(settlement?.totalExpenses)}
          helperText="Trip spending"
          accentColor="#2563eb"
        />
        <SummaryCard
          label="Equal share"
          value={formatCurrency(settlement?.equalShare)}
          helperText="Per family"
          accentColor="#16a34a"
        />
      </View>

      <Text style={styles.sectionTitle}>Family balances</Text>
      <View style={styles.cardList}>
        {familyBalances.length ? (
          familyBalances.map((family) => (
            <View key={family.familyId} style={styles.balanceCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.familyName}>{family.familyName}</Text>
                <Text
                  style={[
                    styles.status,
                    family.status === 'receive' ? styles.receiveText : null,
                    family.status === 'pay' ? styles.payText : null,
                  ]}
                >
                  {family.status === 'receive'
                    ? 'Receive'
                    : family.status === 'pay'
                      ? 'Pay'
                      : 'Settled'}
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Paid</Text>
                <Text style={styles.balanceValue}>{formatCurrency(family.paid)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Share</Text>
                <Text style={styles.balanceValue}>{formatCurrency(family.share)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>
                  {family.balance >= 0 ? 'Receive amount' : 'Pay amount'}
                </Text>
                <Text
                  style={[
                    styles.balanceValue,
                    family.balance >= 0 ? styles.receiveText : styles.payText,
                  ]}
                >
                  {formatCurrency(Math.abs(family.balance))}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyCard title="No families yet" text="Add families and expenses to calculate settlements." />
        )}
      </View>

      <Text style={styles.sectionTitle}>Settlement summary</Text>
      <View style={styles.cardList}>
        {transactions.length ? (
          transactions.map((transaction) => (
            <View
              key={`${transaction.fromFamilyId}-${transaction.toFamilyId}-${transaction.amount}`}
              style={styles.transactionCard}
            >
              <Text style={styles.transactionText}>
                {transaction.whoShouldPay} should pay {transaction.whoShouldReceive}
              </Text>
              <Text style={styles.transactionAmount}>
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))
        ) : (
          <EmptyCard title="All settled" text="No settlement transactions are required." />
        )}
      </View>
    </ScrollView>
  );
}

function EmptyCard({ title, text }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  cardList: {
    gap: 12,
    marginBottom: 22,
  },
  balanceCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  familyName: {
    color: '#111827',
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  status: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
  },
  balanceLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  balanceValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  receiveText: {
    color: '#16a34a',
  },
  payText: {
    color: '#2563eb',
  },
  transactionCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#eff6ff',
    padding: 16,
  },
  transactionText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  transactionAmount: {
    color: '#16a34a',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  emptyCard: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
