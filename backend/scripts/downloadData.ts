import { load } from 'https://deno.land/std@0.177.0/dotenv/mod.ts';
import { join } from 'https://deno.land/std@0.177.0/path/mod.ts';

const env = await load();
const DATA_DIR = './data';

interface DownloadError extends Error {
  message: string;
}

// Ensure data directory exists
try {
  await Deno.mkdir(DATA_DIR, { recursive: true });
} catch (error) {
  if (!(error instanceof Deno.errors.AlreadyExists)) {
    throw error;
  }
}

const downloadAll = async () => {
  await Promise.all([
    downloadEPA(),
    downloadNREL(),
    downloadOpenEI(),
  ]);
};

const downloadEPA = async () => {
  console.log('Downloading EPA eGRID data...');
  const year = new Date().getFullYear() - 1;
  try {
    const response = await fetch(
      `https://www.epa.gov/sites/default/files/egrid${year}_data.xlsx`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.arrayBuffer();
    await Deno.writeFile(
      join(DATA_DIR, `egrid_${year}.xlsx`),
      new Uint8Array(data),
    );
  } catch (error) {
    const err = error as DownloadError;
    console.error('Error downloading EPA data:', err.message);
  }
};

const downloadNREL = async () => {
  console.log('Downloading NREL data...');
  const API_KEY = Deno.env.get('NREL_API_KEY');
  const datasets = ['utility_rates', 'solar', 'wind'];

  for (const dataset of datasets) {
    try {
      const response = await fetch(
        `https://developer.nrel.gov/api/data/${dataset}?api_key=${API_KEY}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      await Deno.writeTextFile(
        join(DATA_DIR, `nrel_${dataset}.json`),
        JSON.stringify(data, null, 2),
      );
    } catch (error) {
      const err = error as DownloadError;
      console.error(`Error downloading NREL ${dataset} data:`, err.message);
    }
  }
};

const downloadOpenEI = async () => {
  console.log('Downloading OpenEI data...');
  const API_KEY = Deno.env.get('OPENEI_API_KEY');
  try {
    const response = await fetch(
      `https://api.openei.org/utility_rates?version=latest&api_key=${API_KEY}&format=json`,
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    await Deno.writeTextFile(
      join(DATA_DIR, 'openei_rates.json'),
      JSON.stringify(data, null, 2),
    );
  } catch (error) {
    const err = error as DownloadError;
    console.error('Error downloading OpenEI data:', err.message);
  }
};

if (import.meta.main) {
  await downloadAll();
}

export { downloadAll };
