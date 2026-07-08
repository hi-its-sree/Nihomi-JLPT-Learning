import { kanjiRepository } from '../repositories/kanjiRepository';
import { buildPagination } from '../utils/response';
export class KanjiService {
    async listKanji(query) {
        const { items, total } = await kanjiRepository.findMany(query);
        const pagination = buildPagination(query.page, query.limit, total);
        return {
            items,
            pagination,
        };
    }
    async getKanjiByCharacter(character) {
        return kanjiRepository.findByCharacter(character);
    }
    async getRandomKanji() {
        return kanjiRepository.getRandom();
    }
    async getStats() {
        return kanjiRepository.getStats();
    }
}
export const kanjiService = new KanjiService();
