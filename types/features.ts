// Feature types for the features management system

export interface Feature {
  id: number;
  name: {
    ar: string;
    en: string | null;
  };
  icon: string;
  icon_url: string;
  description: {
    ar: string;
    en: string | null;
  };
  is_visible: boolean;
}

export interface FeatureResponse {
  success: boolean;
  data: Feature[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateFeatureData {
  name: {
    ar: string;
    en?: string;
  };
  description: {
    ar: string;
    en?: string;
  };
  icon: string;
  is_visible: boolean;
}

export interface UpdateFeatureData extends CreateFeatureData {
  id: number;
}

export interface FeatureFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'all' | 'visible' | 'hidden';
}

export interface ImageUploadResponse {
  success: boolean;
  image_name?: string;
  image_url?: string;
  message?: string;
}
