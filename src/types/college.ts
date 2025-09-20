export interface College {
  college_name: string;
  score_type: string;
  seat_type: string;
  branch: string;
  sum: number;
  count: number;
  max: number;
  min: number;
  mean: number;
  "max-min": number;
  "max-mean": number;
}

export interface UserPreferences {
  percentile: number;
  seatType: string;
  branch: string;
  collegeType?: string;
  location?: string;
  maxFees?: number;
}

export interface FilteredCollege extends College {
  fitScore: number;
  isRecommended: boolean;
}