import { getFirst, initializeDatabase } from '../database/db';

const emptyWalletSummary = {
  totalContributions: 0,
  totalExpenses: 0,
  remainingBalance: 0,
};

const normalizeAmount = (value) => Number(value) || 0;

export async function getWalletSummary() {
  await initializeDatabase();

  const [contributionRow, expenseRow] = await Promise.all([
    getFirst('SELECT COALESCE(SUM(amount), 0) AS total FROM contributions;'),
    getFirst('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses;'),
  ]);

  const totalContributions = normalizeAmount(contributionRow?.total);
  const totalExpenses = normalizeAmount(expenseRow?.total);

  return {
    totalContributions,
    totalExpenses,
    remainingBalance: totalContributions - totalExpenses,
  };
}

export function createEmptyWalletSummary() {
  return emptyWalletSummary;
}
