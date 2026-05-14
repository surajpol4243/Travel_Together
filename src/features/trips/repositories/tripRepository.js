import { getAll, getFirst, initializeDatabase, runQuery } from '../../../database/db';
import { addTimelineEvent } from '../../timeline/repositories/timelineRepository';

const createTripId = () =>
  `trip_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const mapTripRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    tripName: row.name,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export async function createTrip({ tripName, destination, startDate }) {
  await initializeDatabase();

  const id = createTripId();

  await runQuery(
    `INSERT INTO trips (id, name, destination, start_date, end_date)
     VALUES (?, ?, ?, ?, ?);`,
    [
      id,
      tripName.trim(),
      destination.trim(),
      startDate.trim(),
      null,
    ]
  );

  await addTimelineEvent({
    tripId: id,
    type: 'trip_created',
    title: 'Trip created',
    description: `${tripName.trim()} to ${destination.trim()}`,
  });

  return getTripById(id);
}

export async function getTrips() {
  await initializeDatabase();

  const rows = await getAll(
    `SELECT id, name, destination, start_date, end_date, created_at, updated_at
     FROM trips
     ORDER BY start_date ASC, created_at DESC;`
  );

  return rows.map(mapTripRow);
}

export async function getTripById(id) {
  await initializeDatabase();

  const row = await getFirst(
    `SELECT id, name, destination, start_date, end_date, created_at, updated_at
     FROM trips
     WHERE id = ?
     LIMIT 1;`,
    [id]
  );

  return mapTripRow(row);
}
