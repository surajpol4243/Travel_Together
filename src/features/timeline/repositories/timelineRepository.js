import { getAll, initializeDatabase, runQuery } from '../../../database/db';

const createTimelineId = () =>
  `timeline_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const mapTimelineRow = (row) => ({
  id: row.id,
  tripId: row.trip_id,
  type: row.type,
  title: row.title,
  description: row.description,
  occurredAt: row.occurred_at,
  createdAt: row.created_at,
});

export async function addTimelineEvent({
  tripId,
  type,
  title,
  description,
  occurredAt,
}) {
  await initializeDatabase();

  const id = createTimelineId();

  await runQuery(
    `INSERT INTO timeline (id, trip_id, type, title, description, occurred_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      id,
      tripId,
      type,
      title,
      description || null,
      occurredAt || new Date().toISOString(),
    ]
  );

  return id;
}

export async function getTimelineByTripId(tripId) {
  await initializeDatabase();

  const rows = await getAll(
    `SELECT id, trip_id, type, title, description, occurred_at, created_at
     FROM timeline
     WHERE trip_id = ?
     ORDER BY occurred_at DESC, created_at DESC;`,
    [tripId]
  );

  return rows.map(mapTimelineRow);
}
