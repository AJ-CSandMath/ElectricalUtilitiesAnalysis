const API_BASE_URL = 'http://localhost:3000';

export interface Endpoints {
  utilities: string;
  serviceAreas: string;
}

export const endpoints: Endpoints = {
  utilities: `${API_BASE_URL}/api/utilities`,
  serviceAreas: `${API_BASE_URL}/api/service-areas`
}; 