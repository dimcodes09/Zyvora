import type { FilterQuery } from 'mongoose';
import type { IProduct } from '../models/Product.js';

// ─── Raw query string params from Express req.query ───────────
export interface ProductQueryParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: string;
  limit?: string;
}

// ─── Parsed, validated pagination values ──────────────────────
export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

// ─── Final shape returned to the controller ───────────────────
export interface ProductFilterResult {
  filter: FilterQuery<IProduct>;
  pagination: PaginationOptions;
}

// ─── Shape of the paginated API response ──────────────────────
export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: T[];
}