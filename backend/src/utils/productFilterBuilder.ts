import type { FilterQuery } from 'mongoose';
import type { IProduct } from '../models/Product.js';
import type {
  ProductQueryParams,
  ProductFilterResult,
  PaginationOptions,
} from '../types/productQuery.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// ─── Pagination ───────────────────────────────────────────────

const parsePagination = (
  page?: string,
  limit?: string
): PaginationOptions => {
  const parsedPage = Math.max(1, parseInt(page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const parsedLimit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

// ─── Filter Builder ───────────────────────────────────────────

export const buildProductFilter = (
  params: ProductQueryParams
): ProductFilterResult => {
  const { category, minPrice, maxPrice, search, page, limit } = params;

  const filter: FilterQuery<IProduct> = {};

  // Category — exact match (stored lowercase in schema)
  if (category?.trim()) {
    filter.category = category.trim().toLowerCase();
  }

  // Price range — build $gte / $lte only when values are valid numbers
  const min = minPrice !== undefined ? parseFloat(minPrice) : NaN;
  const max = maxPrice !== undefined ? parseFloat(maxPrice) : NaN;

  if (!isNaN(min) || !isNaN(max)) {
    filter.price = {};
    if (!isNaN(min) && min >= 0) filter.price.$gte = min;
    if (!isNaN(max) && max >= 0) filter.price.$lte = max;
  }

  // Search — case-insensitive regex on the name field
  // Uses the text index when only searching; regex used here for
  // partial/substring matching which $text does not support.
  if (search?.trim()) {
    filter.name = { $regex: search.trim(), $options: 'i' };
  }

  return {
    filter,
    pagination: parsePagination(page, limit),
  };
};