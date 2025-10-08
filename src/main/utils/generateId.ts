// src/main/utils/generateId.ts
// Purpose: UUID generation utility for the main process

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique identifier using UUID v4
 * @returns A unique string identifier
 */
export function generateId(): string {
  return uuidv4();
}
