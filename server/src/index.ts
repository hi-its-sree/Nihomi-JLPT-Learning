import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())
app.onError(errorHandler)
app.route('/', routes)

const port = Number(process.env.PORT || 4000)

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server started on http://localhost:${port}`)
})
