import type { ApiResponse, PaginationMeta } from '../types/kanji'

export const buildResponse = <T>(message: string, data: T, pagination?: PaginationMeta | null): ApiResponse<T> => ({
  success: true,
  message,
  data,
  pagination: pagination ?? null,
})

export const buildPagination = (page: number, limit: number, total: number): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
