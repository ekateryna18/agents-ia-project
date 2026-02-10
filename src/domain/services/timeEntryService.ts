import { ValidationError } from '../errors/ValidationError';
import { NotFoundError } from '../errors/NotFoundError';
import { DatabaseError } from '../errors/DatabaseError';

// Simple UUID validation regex (permissive for test UUIDs)
function isUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

interface DatabaseAdapter {
  query(sql: string, params: unknown[]): Promise<Record<string, unknown>[]>;
}

let dbAdapter: DatabaseAdapter | null = null;

export function setDatabaseAdapter(adapter: DatabaseAdapter): void {
  dbAdapter = adapter;
}

export async function calculateProjectHours(projectId: string): Promise<number> {
  if (!projectId) {
    throw new ValidationError('projectId is required');
  }

  if (!isUUID(projectId)) {
    throw new ValidationError('projectId must be valid UUID');
  }

  if (!dbAdapter) {
    throw new DatabaseError('Database adapter not configured');
  }

  try {
    const projectCheck = await dbAdapter.query(
      'SELECT id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectCheck.length === 0) {
      throw new NotFoundError('Project not found');
    }

    const result = await dbAdapter.query(
      `SELECT COALESCE(SUM(hours), 0) as total
       FROM time_entries
       WHERE project_id = $1
         AND status = $2
         AND deleted_at IS NULL`,
      [projectId, 'approved']
    );

    const total = parseFloat(String(result[0].total));
    return Math.round(total * 100) / 100;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Database query failed', error as Error);
  }
}
