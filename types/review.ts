// Review types for the reviews management system

export interface Review {
  id: number;
  booking_id: number;
  user_id: number;
  comment: string | null;
  rating: number;
  blocked_at: string | null;
  created_at: string;
  booking: {
    id: number;
    listing_id: number;
    host_id: number;
    guest_id: number;
    start_date: string;
    end_date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    currency: string;
    price: number;
    total_price: number;
    final_total_price: number;
    final_price_for_host: number;
    commission: number;
    service_fees: number;
    message: string;
    adults_count: number;
    children_count: number;
    infants_count: number;
    pets_count: number;
    host_notes: string | null;
    admin_notes: string | null;
    created_at: string;
    listing: {
      id: number;
      host_id: number;
      title: {
        ar: string;
        en: string | null;
      };
      description: {
        ar: string;
        en: string | null;
      };
      house_type_id: number;
      property_type: string;
      price: number;
      price_weekend: number;
      final_price: number;
      currency: string;
      commission: number;
      status: string;
      guests_count: number;
      bedrooms_count: number;
      beds_count: number;
      bathrooms_count: number;
      booking_capacity: number;
      is_contains_cameras: boolean;
      camera_locations: {
        ar: string | null;
        en: string | null;
      };
      floor_number: number;
      average_rating: number;
      reviews_count: number;
      min_booking_days: number;
      max_booking_days: number;
      is_published: number;
      vip: boolean;
      starts: string | null;
      created_at: string;
      is_favorite: boolean;
      first_image: {
        id: number;
        path: string;
        type: string;
        url: string;
        orders: number;
        imageable_id: number;
        imageable_type: string;
        created_at: string;
      } | null;
      reviews: Review[];
      radius_distance: number;
      available_dates_pro: any[];
    };
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    wallet_balance: number;
    avatar: string | null;
    avatar_url: string | null;
    email: string;
    email_verified: boolean;
    country_code: string;
    phone_number: string;
    phone_verified: boolean;
    role: string;
    id_verified: string;
    status: string;
    is_verified: boolean;
    created_at: string;
    my_listings_count: number;
  };
}

export interface ReviewResponse {
  success: boolean;
  data: Review[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReviewFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: 'all' | 'blocked' | 'active';
  rating?: number;
}
