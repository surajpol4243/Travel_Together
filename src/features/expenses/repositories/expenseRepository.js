import { getAll, initializeDatabase, runQuery } from '../../../database/db';
import { addTimelineEvent } from '../../timeline/repositories/timelineRepository';

const createExpenseId = () =>
  `expense_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const mapExpenseRow = (row) => ({
  id: row.id,
  tripId: row.trip_id,
  paidBy: row.family_id,
  paidByName: row.paid_by_name,
  title: row.title,
  amount: row.amount,
  category: row.category,
  date: row.paid_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function createExpense({
  tripId,
  title,
  amount,
  category,
  paidBy,
  date,
}) {
  await initializeDatabase();

  const id = createExpenseId();

  await runQuery(
    `INSERT INTO expenses (id, trip_id, family_id, title, amount, category, paid_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      tripId,
      paidBy,
      title.trim(),
      Number(amount),
      category,
      date.trim(),
    ]
  );

  await addTimelineEvent({
    tripId,
    type: 'expense_added',
    title: 'Expense added',
    description: `${title.trim()} - ${category} - ${Number(amount)}`,
    occurredAt: date.trim(),
  });

  return id;
}

export async function getExpensesByTripId(tripId) {
  await initializeDatabase();

  const rows = await getAll(
    `SELECT
       expenses.id,
       expenses.trip_id,
       expenses.family_id,
       families.name AS paid_by_name,
       expenses.title,
       expenses.amount,
       expenses.category,
       expenses.paid_at,
       expenses.created_at,
       expenses.updated_at
     FROM expenses
     LEFT JOIN families ON families.id = expenses.family_id
     WHERE expenses.trip_id = ?
     ORDER BY expenses.paid_at DESC, expenses.created_at DESC;`,
    [tripId]
  );

  return rows.map(mapExpenseRow);
}

export async function deleteExpense(expenseId) {
  await initializeDatabase();

  return runQuery('DELETE FROM expenses WHERE id = ?;', [expenseId]);
}
