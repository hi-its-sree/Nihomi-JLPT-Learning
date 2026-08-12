import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { JourneyProvider, useJourney } from './contexts/JourneyContext'
import JourneyLayout from './components/journey/JourneyLayout'
import './App.css'

// Eager — always needed on first load
import SplashScreenPage from './pages/SplashScreenPage'
import AuthPage from './pages/AuthPage'
import SecurityQuestionsPage from './pages/SecurityQuestionsPage'

// Lazy — loaded only when the route is visited
const HomePage         = lazy(() => import('./pages/HomePage'))
const MainLandingPage  = lazy(() => import('./pages/MainLandingPage'))
const DashboardPage    = lazy(() => import('./pages/DashboardPage'))
const LevelsPage       = lazy(() => import('./pages/LevelsPage'))
const LevelDetailPage  = lazy(() => import('./pages/LevelDetailPage'))
const KanjiPage        = lazy(() => import('./pages/KanjiPage'))
const KanjiDetailPage  = lazy(() => import('./pages/KanjiDetailPage'))
const VocabularyPage   = lazy(() => import('./pages/VocabularyPage'))
const GrammarPage      = lazy(() => import('./pages/GrammarPage'))
const PracticePage     = lazy(() => import('./pages/PracticePage'))
const TestsPage        = lazy(() => import('./pages/TestsPage'))
const LessonPage       = lazy(() => import('./pages/LessonPage'))
const FlashcardsPage   = lazy(() => import('./pages/FlashcardsPage'))
const StrokePracticePage = lazy(() => import('./pages/StrokePracticePage'))
const GrammarDrillPage = lazy(() => import('./pages/GrammarDrillPage'))
const RoadmapPage      = lazy(() => import('./pages/RoadmapPage'))
const ProgressPage     = lazy(() => import('./pages/ProgressPage'))
const ProfilePage      = lazy(() => import('./pages/ProfilePage'))
const StudyPlanPage    = lazy(() => import('./pages/StudyPlanPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const SettingsPage     = lazy(() => import('./pages/SettingsPage'))
const AboutPage        = lazy(() => import('./pages/AboutPage'))
const ContactPage      = lazy(() => import('./pages/ContactPage'))

// Beginner Journey — pre-N5 onboarding module
const BeginnersGuidePage      = lazy(() => import('./pages/BeginnersGuidePage'))
const WelcomeChapter          = lazy(() => import('./pages/journey/WelcomeChapter'))
const JlptOverviewChapter     = lazy(() => import('./pages/journey/JlptOverviewChapter'))
const WritingSystemsChapter   = lazy(() => import('./pages/journey/WritingSystemsChapter'))
const HiraganaChapter         = lazy(() => import('./pages/journey/HiraganaChapter'))
const KatakanaChapter         = lazy(() => import('./pages/journey/KatakanaChapter'))
const KanjiChapter            = lazy(() => import('./pages/journey/KanjiChapter'))
const StudyEffectivelyChapter = lazy(() => import('./pages/journey/StudyEffectivelyChapter'))
const ConversationChapter     = lazy(() => import('./pages/journey/ConversationChapter'))
const CultureChapter          = lazy(() => import('./pages/journey/CultureChapter'))
const JourneyCompleteChapter  = lazy(() => import('./pages/journey/JourneyCompleteChapter'))

function PageLoader() {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-kanji"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        語
      </motion.div>
    </div>
  )
}

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: '⊞' },
  { label: 'Levels', to: '/levels', icon: '🏯' },
  { label: 'Kanji', to: '/kanji', icon: '字' },
  { label: 'Vocabulary', to: '/vocabulary', icon: '語' },
  { label: 'Grammar', to: '/grammar', icon: '文' },
  { label: 'Practice', to: '/practice', icon: '✍' },
  { label: 'Mock Tests', to: '/tests', icon: '📋' },
  { label: 'Roadmap', to: '/roadmap', icon: '🗺️' },
  { label: 'Progress', to: '/progress', icon: '📈' },
  { label: 'Profile', to: '/profile', icon: '人' },
]

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loading-kanji"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          語
        </motion.div>
        <p className="loading-text">Loading your journey…</p>
      </div>
    )
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />
}

function AuthenticatedLayout() {
  const { logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="authenticated-root">
      {/* Desktop topbar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="app-topbar"
      >
        <Link to="/dashboard" className="app-brand">
          <span className="app-brand-kanji">語</span>
          <span className="app-brand-text">JLPT Learning</span>
        </Link>

        <nav className="app-nav-desktop">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-topbar-actions">
          <NavLink to="/achievements" className="app-icon-btn" title="Achievements">🏆</NavLink>
          <NavLink to="/settings" className="app-icon-btn" title="Settings">⚙</NavLink>
          <button className="app-logout-btn" onClick={logout}>Logout</button>
          <button className="app-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="mobile-drawer-header">
                <span className="app-brand-kanji">語</span>
                <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>✕</button>
              </div>
              <nav className="mobile-nav">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-link--active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
                <NavLink to="/achievements" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <span className="mobile-nav-icon">🏆</span>Achievements
                </NavLink>
                <NavLink to="/about" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <span className="mobile-nav-icon">ℹ</span>About
                </NavLink>
                <NavLink to="/contact" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>
                  <span className="mobile-nav-icon">✉</span>Contact
                </NavLink>
              </nav>
              <button className="mobile-logout-btn" onClick={() => { logout(); setMobileOpen(false) }}>
                Sign Out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  )
}

function SecurityQuestionsGate({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return children

  const needsSecurityQuestions = Boolean(user) && !user.hasRecoveryAnswers
  const isSecurityQuestionsRoute = location.pathname === '/security-questions'

  if (needsSecurityQuestions && !isSecurityQuestionsRoute) {
    return <Navigate to="/security-questions" replace />
  }
  return children
}

const JOURNEY_ESCAPE_ROUTES = ['/settings', '/profile', '/achievements', '/about', '/contact']

function JourneyGate({ children }) {
  const { state, loading } = useJourney()
  const location = useLocation()

  if (loading) return children

  const isJourneyRoute = location.pathname.startsWith('/beginners-guide') || location.pathname.startsWith('/journey')
  const isEscapeRoute = JOURNEY_ESCAPE_ROUTES.some((r) => location.pathname.startsWith(r))
  const needsOnboarding = !state.hasCompletedJourney && !state.hasSkippedJourney

  if (needsOnboarding && !isJourneyRoute && !isEscapeRoute) {
    return <Navigate to="/beginners-guide" replace />
  }
  return children
}

function JourneyLayoutRoute() {
  return (
    <JourneyLayout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </JourneyLayout>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public — no topbar */}
      <Route path="/" element={<SplashScreenPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/home" element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />

      {/* One-time step between signup and onboarding — its own route so the
          gate below can send anyone missing recovery answers here first. */}
      <Route path="/security-questions" element={<ProtectedRoute><SecurityQuestionsPage /></ProtectedRoute>} />

      {/* Authenticated — shared topbar */}
      <Route element={<ProtectedRoute><SecurityQuestionsGate><JourneyGate><AuthenticatedLayout /></JourneyGate></SecurityQuestionsGate></ProtectedRoute>}>
        <Route path="/main" element={<MainLandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/levels/:levelId" element={<LevelDetailPage />} />
        <Route path="/kanji" element={<KanjiPage />} />
        <Route path="/kanji/:levelOrId" element={<KanjiPage />} />
        <Route path="/kanji-detail/:kanjiId" element={<KanjiDetailPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/:levelOrId" element={<VocabularyPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/grammar/:levelOrId" element={<GrammarPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/:levelOrId" element={<PracticePage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/tests/:levelOrId" element={<TestsPage />} />
        <Route path="/lessons" element={<LessonPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/stroke-practice" element={<StrokePracticePage />} />
        <Route path="/grammar-drill" element={<GrammarDrillPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/study-plan" element={<StudyPlanPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Beginner Journey — own minimal chrome, no topbar/bottom-nav */}
      <Route element={<ProtectedRoute><SecurityQuestionsGate><JourneyLayoutRoute /></SecurityQuestionsGate></ProtectedRoute>}>
        <Route path="/beginners-guide" element={<BeginnersGuidePage />} />
        <Route path="/journey/welcome" element={<WelcomeChapter />} />
        <Route path="/journey/jlpt-overview" element={<JlptOverviewChapter />} />
        <Route path="/journey/writing-systems" element={<WritingSystemsChapter />} />
        <Route path="/journey/first-hiragana" element={<HiraganaChapter />} />
        <Route path="/journey/first-katakana" element={<KatakanaChapter />} />
        <Route path="/journey/first-kanji" element={<KanjiChapter />} />
        <Route path="/journey/study-effectively" element={<StudyEffectivelyChapter />} />
        <Route path="/journey/daily-conversation" element={<ConversationChapter />} />
        <Route path="/journey/daily-conversation/:scenarioId" element={<ConversationChapter />} />
        <Route path="/journey/japanese-culture" element={<CultureChapter />} />
        <Route path="/journey/complete" element={<JourneyCompleteChapter />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <JourneyProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </JourneyProvider>
    </AuthProvider>
  )
}

export default App
