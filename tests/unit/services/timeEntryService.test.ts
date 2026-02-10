// Test file for calculateProjectHours function
// Updated by TestWorker with database mocks

import { calculateProjectHours, setDatabaseAdapter } from '../../../src/domain/services/timeEntryService';
import { ValidationError } from '../../../src/domain/errors/ValidationError';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';

describe('calculateProjectHours', () => {
  // Test fixtures
  const validProjectId = '123e4567-e89b-12d3-a456-426614174000';

  // Mock database adapter
  const mockDbAdapter = {
    query: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setDatabaseAdapter(mockDbAdapter);
  });

  // Test Case 1: Happy path - sum approved entries
  it('should calculate sum of approved time entries', async () => {
    // Arrange: Mock project exists
    mockDbAdapter.query.mockResolvedValueOnce([{ id: validProjectId }]);
    // Mock 3 approved entries (2.5h, 3.0h, 1.75h) = 7.25h
    mockDbAdapter.query.mockResolvedValueOnce([{ total: '7.25' }]);

    // Act
    const result = await calculateProjectHours(validProjectId);

    // Assert
    expect(result).toBe(7.25);
    expect(mockDbAdapter.query).toHaveBeenCalledTimes(2);
  });

  // Test Case 2: Mixed statuses - only count approved
  it('should include only approved entries, exclude draft and deleted', async () => {
    // Arrange: Mock project exists
    mockDbAdapter.query.mockResolvedValueOnce([{ id: validProjectId }]);
    // Mock 2 approved (5h, 3h) = 8.00h (draft and deleted excluded by query)
    mockDbAdapter.query.mockResolvedValueOnce([{ total: '8.00' }]);

    // Act
    const result = await calculateProjectHours(validProjectId);

    // Assert
    expect(result).toBe(8.00);
  });

  // Test Case 3: No time entries
  it('should return 0 when project has no time entries', async () => {
    // Arrange: Mock project exists
    mockDbAdapter.query.mockResolvedValueOnce([{ id: validProjectId }]);
    // Mock no entries (COALESCE returns 0)
    mockDbAdapter.query.mockResolvedValueOnce([{ total: '0' }]);

    // Act
    const result = await calculateProjectHours(validProjectId);

    // Assert
    expect(result).toBe(0);
  });

  // Test Case 4: Only draft entries
  it('should return 0 when project has only draft entries', async () => {
    // Arrange: Mock project exists
    mockDbAdapter.query.mockResolvedValueOnce([{ id: validProjectId }]);
    // Mock only draft entries (query filters them out, returns 0)
    mockDbAdapter.query.mockResolvedValueOnce([{ total: '0' }]);

    // Act
    const result = await calculateProjectHours(validProjectId);

    // Assert
    expect(result).toBe(0);
  });

  // Test Case 5: Only deleted entries
  it('should return 0 when project has only deleted entries', async () => {
    // Arrange: Mock project exists
    mockDbAdapter.query.mockResolvedValueOnce([{ id: validProjectId }]);
    // Mock only deleted entries (query filters them out, returns 0)
    mockDbAdapter.query.mockResolvedValueOnce([{ total: '0' }]);

    // Act
    const result = await calculateProjectHours(validProjectId);

    // Assert
    expect(result).toBe(0);
  });

  // Test Case 6: Null projectId
  it('should throw ValidationError when projectId is null', async () => {
    // Act & Assert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(calculateProjectHours(null as any))
      .rejects
      .toThrow(ValidationError);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(calculateProjectHours(null as any))
      .rejects
      .toThrow('projectId is required');
  });

  // Test Case 7: Invalid UUID format
  it('should throw ValidationError when projectId is not valid UUID', async () => {
    // Arrange
    const invalidUuid = 'invalid-uuid';

    // Act & Assert
    await expect(calculateProjectHours(invalidUuid))
      .rejects
      .toThrow(ValidationError);

    await expect(calculateProjectHours(invalidUuid))
      .rejects
      .toThrow('projectId must be valid UUID');
  });

  // Test Case 8: Non-existent project
  it('should throw NotFoundError when project does not exist', async () => {
    // Arrange: Use a valid UUID that doesn't exist
    const validButNonExistentId = '11111111-1111-1111-1111-111111111111';
    // Mock project does NOT exist
    mockDbAdapter.query.mockResolvedValue([]); // Empty result = not found

    // Act & Assert
    await expect(calculateProjectHours(validButNonExistentId))
      .rejects
      .toThrow(NotFoundError);

    await expect(calculateProjectHours(validButNonExistentId))
      .rejects
      .toThrow('Project not found');
  });

  // Test Case 9: Decimal precision
  it('should return result with 2 decimal precision', async () => {
    // Arrange: Use a different valid project ID
    const precisionTestProjectId = '22222222-2222-2222-2222-222222222222';
    // Mock project exists
    mockDbAdapter.query.mockResolvedValueOnce([{ id: precisionTestProjectId }]);
    // Mock entries: 1.5 + 2.3 + 0.77 = 4.57
    mockDbAdapter.query.mockResolvedValueOnce([{ total: '4.57' }]);

    // Act
    const result = await calculateProjectHours(precisionTestProjectId);

    // Assert
    expect(result).toBe(4.57);
    expect(result.toString()).toMatch(/^\d+\.\d{1,2}$/); // Verify max 2 decimal places
  });
});
