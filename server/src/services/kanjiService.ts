import { kanjiRepository } from '../repositories/kanjiRepository'
import { buildPagination } from '../utils/response'
import type { KanjiListQuery, KanjiStatsResponse, KanjiEntryRecord } from '../types/kanji'

export class KanjiService {
  async listKanji(query: KanjiListQuery) {
    const { items, total } = await kanjiRepository.findMany(query)
    const pagination = buildPagination(query.page, query.limit, total)

    return {
      items,
      pagination,
    }
  }

  async getKanjiByCharacter(character: string): Promise<KanjiEntryRecord | null> {
    return kanjiRepository.findByCharacter(character)
  }

  async getRandomKanji(): Promise<KanjiEntryRecord | null> {
    return kanjiRepository.getRandom()
  }

  async getStats(): Promise<KanjiStatsResponse> {
    return kanjiRepository.getStats()
  }
}

export const kanjiService = new KanjiService()
