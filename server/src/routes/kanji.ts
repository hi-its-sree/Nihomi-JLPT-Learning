import { Hono } from 'hono'
import { kanjiController } from '../controllers/kanjiController'

const router = new Hono()

router.get('/', kanjiController.list)
router.get('/search', kanjiController.list)
router.get('/random', kanjiController.getRandom)
router.get('/stats', kanjiController.getStats)
router.get('/:character', kanjiController.getByCharacter)

export default router
