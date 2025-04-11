// Interface pour les filtres de validation
export interface ValidationFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Interface pour les résultats de validation
export interface ValidationResult {
  status: string;
  score: number;
  report: string;
  detailedReport: any;
  moderatedByBot: boolean;
  revisionFeedback?: string;
} 