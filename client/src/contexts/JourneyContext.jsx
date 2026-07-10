import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useAuth } from './AuthContext'
import { CHAPTER_ORDER, CHAPTERS } from '../pages/journey/content/chapters'

const STORAGE_KEY = 'jlpt-journey'

const EMPTY_STATE = {
  completedChapters: [],
  xp: 0,
  badges: [],
  hasCompletedJourney: false,
  hasSkippedJourney: false,
}

const JourneyContext = createContext({
  state: EMPTY_STATE,
  loading: true,
  completeChapter: async () => {},
  skipJourney: async () => {},
  isChapterUnlocked: () => false,
  refresh: async () => {},
})

function readStoredState() {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    return { ...EMPTY_STATE, ...JSON.parse(raw) }
  } catch {
    return EMPTY_STATE
  }
}

export function JourneyProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [state, setState] = useState(readStoredState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  const refresh = async () => {
    if (!isAuthenticated) {
      setState(EMPTY_STATE)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/api/v1/journey/state')
      setState({ ...EMPTY_STATE, ...data })
    } catch {
      // keep whatever we already have (cached/optimistic) on network failure
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading])

  const completeChapter = async (chapterId) => {
    const chapter = CHAPTERS[chapterId]

    // Optimistic update for instant UI feedback
    setState((prev) => {
      if (prev.completedChapters.includes(chapterId)) return prev
      return {
        ...prev,
        completedChapters: [...prev.completedChapters, chapterId],
        xp: prev.xp + (chapter?.xp ?? 0),
        badges: [...new Set([...prev.badges, ...(chapter?.badgeIds ?? [])])],
        hasCompletedJourney: prev.hasCompletedJourney || chapterId === 'complete',
      }
    })

    try {
      const { data } = await api.post(`/api/v1/journey/chapters/${chapterId}/complete`)
      // Reconcile with authoritative server state
      await refresh()
      return data
    } catch (err) {
      await refresh()
      throw err
    }
  }

  const skipJourney = async () => {
    setState((prev) => ({ ...prev, hasSkippedJourney: true }))
    try {
      await api.post('/api/v1/journey/skip')
    } catch {
      // optimistic flag stays set locally even if the request fails momentarily
    }
  }

  const isChapterUnlocked = (chapterId) => {
    const index = CHAPTER_ORDER.indexOf(chapterId)
    if (index <= 0) return true
    if (state.completedChapters.includes(chapterId)) return true
    const previousId = CHAPTER_ORDER[index - 1]
    return state.completedChapters.includes(previousId)
  }

  const value = useMemo(
    () => ({ state, loading, completeChapter, skipJourney, isChapterUnlocked, refresh }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading],
  )

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney() {
  return useContext(JourneyContext)
}
