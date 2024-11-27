import { Database } from 'sqlite3';
import { join } from 'path';
import { readCSV } from '../../src/utils/csv.ts';

interface ValidationError extends Error {
  code: string;
}

function validateDataBeforeInsertion(row: any): boolean {
  if (!row.eiaid || !row.utility_name || !row.state) {
    const error = new Error('Missing required fields') as ValidationError;
    error.code = 'INVALID_DATA';
    throw error;
  }

  // Validate rates are numbers or can be converted to numbers
  const rates = [row.comm_rate, row.ind_rate, row.res_rate];
  for (const rate of rates) {
    if (rate && isNaN(parseFloat(rate))) {
      const error = new Error('Invalid rate value') as ValidationError;
      error.code = 'INVALID_RATE';
      throw error;
    }
  }

  return true;
}

async function loadDataIntoDatabase() {
  const dbPath = join(Deno.cwd(), 'data', 'utilities.db');
  const iouCsvPath = join(Deno.cwd(), 'data', 'iou_zipcodes_2020.csv');
  const nonIouCsvPath = join(Deno.cwd(), 'data', 'non_iou_zipcodes_2020.csv');

  console.log('Loading database from:', dbPath);
  console.log('Reading IOU CSV from:', iouCsvPath);
  console.log('Reading non-IOU CSV from:', nonIouCsvPath);

  const db = new Database(dbPath);

  try {
    // Load both CSV files
    const iouData = await readCSV(iouCsvPath);
    const nonIouData = await readCSV(nonIouCsvPath);
    console.log(
      `Loaded ${iouData.length} IOU records and ${nonIouData.length} non-IOU records`,
    );

    // Insert utilities data (unique utilities only)
    const insertUtility = db.prepare(`
      INSERT OR IGNORE INTO utilities (
        eiaid, utility_name, ownership, service_type
      ) VALUES (?, ?, ?, ?)
    `);

    // Use Set to track unique EIAIDs
    const processedEiaids = new Set();

    // Process IOU data
    for (const row of iouData) {
      try {
        if (
          validateDataBeforeInsertion(row) && !processedEiaids.has(row.eiaid)
        ) {
          insertUtility.run([
            row.eiaid,
            row.utility_name,
            row.ownership,
            row.service_type,
          ]);
          processedEiaids.add(row.eiaid);
        }
      } catch (error) {
        console.error(
          `Skipping invalid row for utility ${row.utility_name}:`,
          error,
        );
        continue;
      }
    }

    // Process non-IOU data
    for (const row of nonIouData) {
      try {
        if (
          validateDataBeforeInsertion(row) && !processedEiaids.has(row.eiaid)
        ) {
          insertUtility.run([
            row.eiaid,
            row.utility_name,
            row.ownership,
            row.service_type,
          ]);
          processedEiaids.add(row.eiaid);
        }
      } catch (error) {
        console.error(
          `Skipping invalid row for utility ${row.utility_name}:`,
          error,
        );
        continue;
      }
    }

    // Insert service areas data
    const insertServiceArea = db.prepare(`
      INSERT INTO utility_service_areas (
        eiaid, zip, state, comm_rate, ind_rate, res_rate, is_iou
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert IOU service areas
    for (const row of iouData) {
      insertServiceArea.run([
        row.eiaid,
        row.zip,
        row.state,
        row.comm_rate,
        row.ind_rate,
        row.res_rate,
        true, // is_iou flag
      ]);
    }

    // Insert non-IOU service areas
    for (const row of nonIouData) {
      insertServiceArea.run([
        row.eiaid,
        row.zip,
        row.state,
        row.comm_rate,
        row.ind_rate,
        row.res_rate,
        false, // is_iou flag
      ]);
    }

    console.log('Data loaded successfully');
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  } finally {
    db.close();
  }
}

if (import.meta.main) {
  await loadDataIntoDatabase();
}

export { loadDataIntoDatabase };
