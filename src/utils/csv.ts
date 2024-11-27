import { parse } from "https://deno.land/std@0.177.0/encoding/csv.ts";

interface CSVRow {
  zip: string;
  eiaid: string;
  utility_name: string;
  state: string;
  service_type: string;
  ownership: string;
  comm_rate: string;
  ind_rate: string;
  res_rate: string;
  is_iou?: boolean;
}

function validateRow(row: Record<string, unknown>): CSVRow {
  // Validate required fields exist and are strings
  const requiredFields = [
    "zip",
    "eiaid",
    "utility_name",
    "state",
    "service_type",
    "ownership",
    "comm_rate",
    "ind_rate",
    "res_rate",
  ];

  for (const field of requiredFields) {
    if (typeof row[field] !== "string") {
      throw new Error(`Invalid or missing field: ${field}`);
    }
  }

  return {
    zip: row.zip as string,
    eiaid: row.eiaid as string,
    utility_name: row.utility_name as string,
    state: row.state as string,
    service_type: row.service_type as string,
    ownership: row.ownership as string,
    comm_rate: row.comm_rate as string,
    ind_rate: row.ind_rate as string,
    res_rate: row.res_rate as string,
  };
}

export async function readCSV(filepath: string): Promise<CSVRow[]> {
  try {
    const text = await Deno.readTextFile(filepath);
    const rawRows = parse(text, {
      skipFirstRow: true,
      columns: [
        "zip",
        "eiaid",
        "utility_name",
        "state",
        "service_type",
        "ownership",
        "comm_rate",
        "ind_rate",
        "res_rate",
      ],
    }) as Record<string, unknown>[];

    // Validate and transform rows
    const validatedRows = rawRows.map(validateRow);

    // Add is_iou flag
    const is_iou = filepath.includes("iou_zipcodes");
    return validatedRows.map((row) => ({
      ...row,
      is_iou,
    }));
  } catch (error) {
    console.error(`Error reading CSV file ${filepath}:`, error);
    return [];
  }
}
