export interface PowerUsage {
  current: number; // kW
  daily: number; // kWh
  monthly: number; // kWh
}

export interface BillingPeriod {
  start: string;
  end: string;
}

export interface UtilityCost {
  currentBill: number;
  projectedBill: number;
  billingPeriod: BillingPeriod;
}

export interface Utility {
  eiaid: number;
  utility_name: string;
  ownership: string;
  service_type: string;
  ferc_id?: string;
  holding_company?: string;
  regulatory_status?: string;
}

export interface ServiceArea {
  id?: number;
  eiaid: number;
  zip: string;
  state: string;
  comm_rate: number;
  ind_rate: number;
  res_rate: number;
  is_iou: boolean;
}

export interface Coverage {
  [state: string]: {
    utilities: number;
    avgRates: {
      residential: number;
      commercial: number;
      industrial: number;
    };
    weightedRate: number;
  };
}
