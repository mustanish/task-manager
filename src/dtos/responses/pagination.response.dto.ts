export class PaginationResponse<T> {
  constructor(public items: T[], public pagination: Pagination) {}
}

export function paginate<T>(
  items: T[],
  totalItems: number,
  currentPage: number,
  perPage: number,
): PaginationResponse<T> {
  return new PaginationResponse<T>(items, {
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
    currentPage,
    perPage,
  });
}

interface Pagination {
  /**
   * Represent total number of items present in the pagination
   */
  totalItems: number;
  /**
   * Represent total number of pages present in the pagination
   */
  totalPages: number;
  /**
   * Represent current page in the pagination
   */
  currentPage: number;
  /**
   * Represent total number of items requested in the pagination
   */
  perPage: number;
}
