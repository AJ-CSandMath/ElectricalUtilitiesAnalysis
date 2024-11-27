import { Router } from "../deps.ts";
import type { RouterContext } from "../deps.ts";
import { readCSV } from "../utils/csv.ts";
import { join } from "../deps.ts";
import type { Coverage, ServiceArea, Utility } from "../types/utility.ts";

const router = new Router();

// Cache for CSV data
let utilitiesData: Utility[] = [];
let serviceAreasData: ServiceArea[] = [];

// Load CSV data
async function loadData() {
  try {
    const iouCsvPath = join(Deno.cwd(), "data", "iou_zipcodes_2020.csv");
    const nonIouCsvPath = join(Deno.cwd(), "data", "non_iou_zipcodes_2020.csv");

    const iouData = await readCSV(iouCsvPath);
    const nonIouData = await readCSV(nonIouCsvPath);
    const combinedData = [...iouData, ...nonIouData];

    // Transform CSV data to proper types
    utilitiesData = combinedData.map((row): Utility => ({
      eiaid: parseInt(row.eiaid),
      utility_name: row.utility_name,
      ownership: row.ownership,
      service_type: row.service_type,
    }));

    serviceAreasData = combinedData.map((row): ServiceArea => ({
      eiaid: parseInt(row.eiaid),
      zip: row.zip,
      state: row.state,
      comm_rate: parseFloat(row.comm_rate) || 0,
      ind_rate: parseFloat(row.ind_rate) || 0,
      res_rate: parseFloat(row.res_rate) || 0,
      is_iou: row.is_iou || false,
    }));
  } catch (error) {
    console.error("Error loading CSV data:", error);
  }
}

// Load data on startup
loadData();

router
  .get("/api/utilities", (ctx: RouterContext<"/api/utilities">) => {
    ctx.response.body = {
      message: "Utilities data",
      data: utilitiesData,
    };
  })
  .get("/api/service-areas", (ctx: RouterContext<"/api/service-areas">) => {
    ctx.response.body = {
      message: "Service areas data",
      data: serviceAreasData,
    };
  })
  .get(
    "/api/utilities/coverage",
    (ctx: RouterContext<"/api/utilities/coverage">) => {
      console.log("Processing coverage request...");
      console.log("Total service areas:", serviceAreasData.length);

      if (serviceAreasData.length === 0) {
        ctx.response.status = 500;
        ctx.response.body = { error: "No service area data available" };
        return;
      }

      // Create a Map to track unique utilities per state
      const stateUtilities = new Map();

      // Aggregate coverage data by state
      const coverage = serviceAreasData.reduce(
        (acc: Record<string, Coverage[string]>, area) => {
          // Initialize state data if not exists
          if (!acc[area.state]) {
            acc[area.state] = {
              utilities: 0,
              avgRates: {
                residential: 0,
                commercial: 0,
                industrial: 0,
              },
              weightedRate: 0,
            };
            stateUtilities.set(area.state, new Set());
          }

          // Only count unique utilities per state
          const stateSet = stateUtilities.get(area.state);
          if (!stateSet.has(area.eiaid)) {
            stateSet.add(area.eiaid);
            acc[area.state].utilities = stateSet.size;
          }

          // Calculate weighted average rate
          const weightedRate = (
            (0.5 * Number(area.res_rate)) +
            (0.3 * Number(area.comm_rate)) +
            (0.2 * Number(area.ind_rate))
          ) || 0;

          // Add rates (will average later)
          acc[area.state].avgRates.residential += Number(area.res_rate) || 0;
          acc[area.state].avgRates.commercial += Number(area.comm_rate) || 0;
          acc[area.state].avgRates.industrial += Number(area.ind_rate) || 0;
          acc[area.state].weightedRate = (acc[area.state].weightedRate || 0) +
            weightedRate;

          return acc;
        },
        {},
      );

      // Calculate true averages for each state
      Object.entries(coverage).forEach(([state, data]) => {
        const numUtilities = stateUtilities.get(state).size;
        if (numUtilities > 0) {
          data.weightedRate = Number(
            (data.weightedRate / numUtilities).toFixed(4),
          );
          data.avgRates.residential = Number(
            (data.avgRates.residential / numUtilities).toFixed(4),
          );
          data.avgRates.commercial = Number(
            (data.avgRates.commercial / numUtilities).toFixed(4),
          );
          data.avgRates.industrial = Number(
            (data.avgRates.industrial / numUtilities).toFixed(4),
          );
        }
        console.log(
          `State ${state}: ${numUtilities} utilities, rates:`,
          data.avgRates,
        );
      });

      ctx.response.body = coverage;
    },
  );

export default router;
