import { promises as fs } from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { db } from './db'

async function pathExists(target: string) {
  try {
    await fs.access(target)
    return true
  } catch {
    return false
  }
}

function normalizeLevel(value: string | number | undefined) {
  const raw = String(value ?? '').trim().toUpperCase().replace(/^JLPT\s*/, '')
  return ['N1', 'N2', 'N3', 'N4', 'N5', 'OTHER'].includes(raw) ? raw : 'OTHER'
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

async function seedDemoUser() {
  const email = 'demo@jlpt.dev'
  const password = 'demo12345'
  const username = 'demolearner'

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Demo user already exists')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await db.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    } as any,
  })

  console.log('Created demo user')
}

async function seedKanji(dataDir: string) {
  const kanjiDir = path.join(dataDir, 'json', 'kanji')
  if (!(await pathExists(kanjiDir))) {
    console.log(`Skipping kanji seed: ${kanjiDir} not found`)
    return
  }

  const files = (await fs.readdir(kanjiDir)).filter((file) => file.endsWith('.json')).sort()

  let imported = 0
  for (const file of files) {
    const content = await fs.readFile(path.join(kanjiDir, file), 'utf8')
    const items = JSON.parse(content) as Array<Record<string, any>>

    for (const item of items) {
      const character = String(item.character ?? '').trim()
      if (!character) continue

      const existing = await db.kanjiEntry.findUnique({ where: { character } })
      if (!existing) {
        await db.kanjiEntry.create({
          data: {
            character,
            onReadings: Array.isArray(item.onyomi) ? item.onyomi : [],
            kunReadings: Array.isArray(item.kunyomi) ? item.kunyomi : [],
            meaning: Array.isArray(item.meanings) ? item.meanings.join(', ') : String(item.meaning ?? ''),
            level: normalizeLevel(item.level ?? item.jlpt),
            strokeCount: item.strokes ?? item.strokeCount ?? null,
          },
        })
      }

      imported += 1
    }
  }

  console.log(`Imported ${imported} kanji entries`)
}

async function seedVocabulary(dataDir: string) {
  const vocabDir = path.join(dataDir, 'json', 'vocab')
  if (!(await pathExists(vocabDir))) {
    console.log(`Skipping vocabulary seed: ${vocabDir} not found`)
    return
  }

  const files = (await fs.readdir(vocabDir)).filter((file) => file.endsWith('.json')).sort()

  let imported = 0
  for (const file of files) {
    const content = await fs.readFile(path.join(vocabDir, file), 'utf8')
    const items = JSON.parse(content) as Array<Record<string, any>>

    for (const item of items) {
      const word = String(item.word ?? '').trim()
      if (!word) continue

      const existing = await db.vocabulary.findFirst({
        where: {
          word,
          level: normalizeLevel(item.level),
        },
      })

      if (!existing) {
        const examples = Array.isArray(item.examples) ? item.examples : []
        const firstExample = examples[0] as Record<string, any> | undefined

        await db.vocabulary.create({
          data: {
            word,
            reading: String(item.reading ?? ''),
            meaning: Array.isArray(item.meanings) ? item.meanings.join(', ') : String(item.meaning ?? ''),
            level: normalizeLevel(item.level),
            example: firstExample?.ja ?? firstExample?.japanese ?? null,
            exampleTl: firstExample?.en ?? firstExample?.english ?? null,
          },
        })
      }

      imported += 1
    }
  }

  console.log(`Imported ${imported} vocabulary entries`)
}

async function seedGrammar(dataDir: string) {
  const grammarFile = path.join(dataDir, 'grammar', 'hanabira_all_jlpt_grammar.csv')
  if (!(await pathExists(grammarFile))) {
    console.log(`Skipping grammar seed: ${grammarFile} not found`)
    return
  }

  const content = await fs.readFile(grammarFile, 'utf8')
  const lines = content.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) {
    console.log('No grammar rows found')
    return
  }

  const header = parseCsvLine(lines[0])
  const rows = lines.slice(1)
  let imported = 0

  for (const line of rows) {
    const values = parseCsvLine(line)
    const row = Object.fromEntries(header.map((name, index) => [name.trim(), values[index] ?? ''])) as Record<string, string>

    const pattern = row['Grammar Point']?.trim()
    const level = normalizeLevel(row['JLPT Level'])
    if (!pattern || !level) continue

    const existing = await db.grammarPattern.findFirst({
      where: {
        pattern,
        level,
      },
    })

    if (!existing) {
      await db.grammarPattern.create({
        data: {
          pattern,
          meaning: row['Meaning']?.trim() ?? '',
          structure: row['Formation']?.trim() ?? '',
          level,
          examples: [
            {
              japanese: row['Example (Japanese)']?.trim() ?? '',
              romaji: row['Example (Romaji)']?.trim() ?? '',
              english: row['Example (English)']?.trim() ?? '',
            },
          ],
        },
      })
    }

    imported += 1
  }

  console.log(`Imported ${imported} grammar entries`)
}

async function main() {
  await seedDemoUser()

  const dataDir = process.env.DATA_DIR ?? '/app/data'
  await seedKanji(dataDir)
  await seedVocabulary(dataDir)
  await seedGrammar(dataDir)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
