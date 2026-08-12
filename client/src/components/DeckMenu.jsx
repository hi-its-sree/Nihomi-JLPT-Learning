import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useDecks } from '../hooks/useDecks'
import TextPromptModal from './TextPromptModal'

// Popover content for adding/removing a single kanji from the user's custom,
// renameable flashcard collections. Used from both the Kanji list and detail pages.
//
// - No collections yet -> the only option is to create one; the kanji is added
//   to it as soon as it's created.
// - Has collections -> ask which one(s) the kanji should go into (checkbox list).
export default function DeckMenu({ kanjiId, onMembershipChange }) {
  const { decks, loading: decksLoading, createDeck } = useDecks()
  const [memberDeckIds, setMemberDeckIds] = useState(new Set())
  const [busyDeckId, setBusyDeckId] = useState(null)
  const [error, setError] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    api.get(`/api/v1/decks/kanji/${kanjiId}`)
      .then(({ data }) => {
        if (!mounted) return
        const ids = new Set(data.deckIds || [])
        setMemberDeckIds(ids)
        onMembershipChange?.(ids.size > 0)
      })
      .catch(() => {})
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanjiId])

  async function toggleDeck(deckId) {
    if (busyDeckId) return
    setBusyDeckId(deckId)
    setError('')
    try {
      if (memberDeckIds.has(deckId)) {
        await api.delete(`/api/v1/decks/${deckId}/kanji/${kanjiId}`)
        setMemberDeckIds(prev => {
          const next = new Set(prev)
          next.delete(deckId)
          onMembershipChange?.(next.size > 0)
          return next
        })
      } else {
        await api.post(`/api/v1/decks/${deckId}/kanji/${kanjiId}`)
        setMemberDeckIds(prev => {
          const next = new Set(prev).add(deckId)
          onMembershipChange?.(true)
          return next
        })
      }
    } catch {
      setError('Could not update that collection.')
    } finally {
      setBusyDeckId(null)
    }
  }

  async function handleCreateAndAdd(name) {
    const deck = await createDeck(name)
    await api.post(`/api/v1/decks/${deck.id}/kanji/${kanjiId}`)
    setMemberDeckIds(prev => new Set(prev).add(deck.id))
    onMembershipChange?.(true)
  }

  if (decksLoading) {
    return (
      <div style={{ padding: 14, fontSize: '0.8rem', color: 'var(--muted-plum)', minWidth: 220 }}>
        Loading your collections…
      </div>
    )
  }

  if (decks.length === 0) {
    return (
      <div style={{ padding: 14, minWidth: 220 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-ink)', marginBottom: 4 }}>
          You don't have a collection yet
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--muted-plum)', marginBottom: 10, lineHeight: 1.5 }}>
          Create one to start grouping kanji your own way.
        </p>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="primary-btn btn-sm"
          style={{ width: '100%' }}
        >
          + Create your first collection
        </button>
        {error && <div style={{ fontSize: '0.72rem', color: '#be123c', marginTop: 8 }}>{error}</div>}

        <TextPromptModal
          open={createModalOpen}
          title="Name your first collection"
          subtitle="This kanji will be added to it right away."
          submitLabel="Create collection"
          onSubmit={handleCreateAndAdd}
          onClose={() => setCreateModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 8, minWidth: 220 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted-plum)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 6px' }}>
        Add to which collection?
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {decks.map(deck => (
          <label
            key={deck.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              opacity: busyDeckId === deck.id ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={memberDeckIds.has(deck.id)}
              disabled={busyDeckId === deck.id}
              onChange={() => toggleDeck(deck.id)}
            />
            {deck.name}
          </label>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 4, padding: '6px 6px' }}>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          style={{
            width: '100%', textAlign: 'left', padding: '6px 4px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: 'var(--terracotta)',
          }}
        >
          + New collection
        </button>
      </div>
      {error && <div style={{ fontSize: '0.72rem', color: '#be123c', padding: '4px 6px' }}>{error}</div>}

      <TextPromptModal
        open={createModalOpen}
        title="Name your new collection"
        subtitle="This kanji will be added to it right away."
        submitLabel="Create collection"
        onSubmit={handleCreateAndAdd}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  )
}
