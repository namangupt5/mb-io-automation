import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

/**
 * DataLoader - Utility for loading external JSON-based test data.
 * Supports typed data loading with caching for performance.
 */
export class DataLoader {
  private static cache: Map<string, unknown> = new Map();
  private static testDataDir = path.resolve(process.cwd(), 'src/test-data');

  /**
   * Load test data from a JSON file in the test-data directory.
   * @param fileName - Name of the JSON file (with or without .json extension)
   * @returns Parsed JSON data
   */
  static load<T>(fileName: string): T {
    const normalizedName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

    // Return cached data if available
    if (this.cache.has(normalizedName)) {
      logger.debug(`Loading cached test data: ${normalizedName}`);
      return this.cache.get(normalizedName) as T;
    }

    const filePath = path.join(this.testDataDir, normalizedName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }

    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawData) as T;
      this.cache.set(normalizedName, data);
      logger.info(`Test data loaded: ${normalizedName}`);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse test data file ${normalizedName}: ${errorMessage}`);
    }
  }

  /**
   * Load a specific key from a test data file.
   */
  static loadKey<T>(fileName: string, key: string): T {
    const data = this.load<Record<string, unknown>>(fileName);
    if (!(key in data)) {
      throw new Error(`Key "${key}" not found in test data file "${fileName}"`);
    }
    return data[key] as T;
  }

  /**
   * Clear the data cache.
   */
  static clearCache(): void {
    this.cache.clear();
    logger.debug('Test data cache cleared');
  }

  /**
   * Get all keys from a test data file.
   */
  static getKeys(fileName: string): string[] {
    const data = this.load<Record<string, unknown>>(fileName);
    return Object.keys(data);
  }
}
