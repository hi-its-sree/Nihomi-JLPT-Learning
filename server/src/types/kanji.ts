export type KanjiLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'OTHER'

export interface KanjiEntryRecord {
  id: string
  character: string
  onReadings: string[]
  kunReadings: string[]
  meaning: string
  level: KanjiLevel
  strokeCount: number | null
}

export type KanjiSortField = 'character' | 'meaning' | 'level' | 'strokeCount'
export type KanjiSortOrder = 'asc' | 'desc'

export interface KanjiListQuery {
  page: number
  limit: number
  level?: string
  q?: string
  sortBy: KanjiSortField
  sortOrder: KanjiSortOrder
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination: PaginationMeta | null
}

export interface KanjiStatsResponse {
  total: number
  byLevel: Array<{
    level: string
    count: number
  }>
}
