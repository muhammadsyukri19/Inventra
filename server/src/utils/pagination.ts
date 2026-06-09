/**
 * Pagination utility.
 *
 * Parses and validates pagination query parameters.
 * Provides consistent defaults and Prisma-compatible output.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface PaginationInput {
  page?: string | number;
  limit?: string | number;
}

interface PaginationOutput {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(input: PaginationInput): PaginationOutput {
  const page = Math.max(Number(input.page) || DEFAULT_PAGE, 1);
  const rawLimit = Math.max(Number(input.limit) || DEFAULT_LIMIT, 1);
  const limit = Math.min(rawLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
