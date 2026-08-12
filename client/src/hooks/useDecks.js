import { useCallback, useEffect, useState } from 'react'
import api from '../lib/api'

export function useDecks() {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/v1/decks')
      setDecks(data.decks || [])
    } catch {
      // leave decks as-is on failure
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function createDeck(name) {
    const { data } = await api.post('/api/v1/decks', { name })
    setDecks(prev => [...prev, data])
    return data
  }

  async function renameDeck(deckId, name) {
    const { data } = await api.patch(`/api/v1/decks/${deckId}`, { name })
    setDecks(prev => prev.map(d => (d.id === deckId ? { ...d, name: data.name } : d)))
    return data
  }

  async function deleteDeck(deckId) {
    await api.delete(`/api/v1/decks/${deckId}`)
    setDecks(prev => prev.filter(d => d.id !== deckId))
  }

  return { decks, loading, refresh, createDeck, renameDeck, deleteDeck }
}
