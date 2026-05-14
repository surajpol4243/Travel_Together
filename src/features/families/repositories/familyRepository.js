import { getAll, initializeDatabase, runQuery } from '../../../database/db';
import { addTimelineEvent } from '../../timeline/repositories/timelineRepository';

const createFamilyId = () =>
  `family_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const mapFamilyRow = (row) => ({
  id: row.id,
  tripId: row.trip_id,
  familyName: row.name,
  memberCount: row.member_count,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function createFamily({ tripId, familyName, memberCount }) {
  await initializeDatabase();

  const id = createFamilyId();

  await runQuery(
    `INSERT INTO families (id, trip_id, name, member_count)
     VALUES (?, ?, ?, ?);`,
    [id, tripId, familyName.trim(), Number(memberCount)]
  );

  await addTimelineEvent({
    tripId,
    type: 'family_added',
    title: 'Family added',
    description: `${familyName.trim()} with ${Number(memberCount)} members`,
  });

  return {
    id,
    tripId,
    familyName: familyName.trim(),
    memberCount: Number(memberCount),
  };
}

export async function getFamiliesByTripId(tripId) {
  await initializeDatabase();

  const rows = await getAll(
    `SELECT id, trip_id, name, member_count, created_at, updated_at
     FROM families
     WHERE trip_id = ?
     ORDER BY created_at DESC;`,
    [tripId]
  );

  return rows.map(mapFamilyRow);
}

export async function deleteFamily(familyId) {
  await initializeDatabase();

  return runQuery('DELETE FROM families WHERE id = ?;', [familyId]);
}
