import { getAll, getFirst, initializeDatabase, runQuery } from '../../../database/db';
import { addTimelineEvent } from '../../timeline/repositories/timelineRepository';

const createContributionId = () =>
  `contribution_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const mapContributionRow = (row) => ({
  id: row.id,
  tripId: row.trip_id,
  familyId: row.family_id,
  familyName: row.family_name,
  amount: row.amount,
  month: row.month,
  notes: row.notes,
  contributedAt: row.contributed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function createContribution({
  tripId,
  familyId,
  amount,
  month,
  notes,
}) {
  await initializeDatabase();

  const id = createContributionId();

  await runQuery(
    `INSERT INTO contributions (id, trip_id, family_id, amount, month, notes)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      id,
      tripId,
      familyId,
      Number(amount),
      month.trim(),
      notes.trim() || null,
    ]
  );

  await addTimelineEvent({
    tripId,
    type: 'contribution_added',
    title: 'Contribution added',
    description: `Amount ${Number(amount)} for ${month.trim()}`,
  });

  return id;
}

export async function getContributionsByTripId(tripId) {
  await initializeDatabase();

  const rows = await getAll(
    `SELECT
       contributions.id,
       contributions.trip_id,
       contributions.family_id,
       families.name AS family_name,
       contributions.amount,
       contributions.month,
       contributions.notes,
       contributions.contributed_at,
       contributions.created_at,
       contributions.updated_at
     FROM contributions
     INNER JOIN families ON families.id = contributions.family_id
     WHERE contributions.trip_id = ?
     ORDER BY contributions.month DESC, contributions.created_at DESC;`,
    [tripId]
  );

  return rows.map(mapContributionRow);
}

export async function getContributionTotalByTripId(tripId) {
  await initializeDatabase();

  const row = await getFirst(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM contributions
     WHERE trip_id = ?;`,
    [tripId]
  );

  return row?.total ?? 0;
}
