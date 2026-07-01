# JLPT Learning Platform — Product & Technical Specification

## 1. Executive Summary

This product is a modern, animated, mobile-first Japanese learning platform designed to guide learners from beginner to advanced proficiency using structured JLPT-based learning paths. The system supports JLPT N5 through N1, with content domains covering kanji, vocabulary, grammar, reading, listening, speaking/shadowing, mock tests, personalization, analytics, and gamification.

The platform is intended for:
- Self-study learners preparing for JLPT
- Schools and universities
- Corporate language training programs
- Enterprises seeking internal Japanese learning experiences

The experience should feel calm, premium, Japanese-inspired, and highly interactive while remaining practical and data-driven. The architecture should support rapid content expansion, multilingual localization, real-time analytics, and future AI-based tutoring features.

---

## 2. Product Vision

### Vision Statement
Create a world-class Japanese learning experience that makes JLPT preparation feel structured, motivating, and deeply personalized.

### Core Product Goals
- Help learners progress from N5 to N1 with a clear, measurable path
- Increase retention through spaced repetition, active recall, and contextual practice
- Make learning visually elegant and emotionally motivating
- Support both individual learners and institutional training programs
- Scale into a full-language-learning ecosystem with AI tutoring and speech assessment

### Target Users
- Beginner learners beginning Japanese from zero
- Intermediate learners preparing for N3 or N2
- Advanced learners targeting N1
- Teachers and school administrators
- Corporate training managers

### Product Positioning
A premium, calm, bilingual, mobile-first platform that balances seriousness of academic study with the delight of polished digital product design.

---

## 3. Core Features

### 3.1 JLPT Curriculum System

The curriculum is structured as a progressive mastery path from N5 to N1.

| JLPT Level | Focus | Core Learning Areas |
|---|---|---|
| N5 | Survival Japanese | Basic hiragana/katakana, everyday vocabulary, simple grammar, sentence patterns, short listening, very simple reading |
| N4 | Daily life communication | More vocabulary, basic kanji, common grammar, short passages, practical listening |
| N3 | Independent communication | Broader vocabulary, intermediate grammar, longer reading, listening for daily situations |
| N2 | Practical proficiency | Advanced grammar, nuanced vocabulary, news-like reading, longer listening, complex interaction |
| N1 | Advanced mastery | Academic and abstract language, complex reading, nuanced listening, advanced grammar and expression |

#### Curriculum Structure by Level
Each level includes:
- Kanji: targeted set of kanji with readings, stroke order, usage, mnemonics
- Vocabulary: JLPT-aligned terms with example sentences, pitch accent, usage notes
- Grammar: grammar patterns with explanation, nuance, drills, and comparisons
- Reading: graded passages with comprehension questions and vocabulary support
- Listening: JLPT-style tasks with transcripts, replay, dictation, and shadowing
- Practice sessions: daily drills, review cycles, mixed review modes
- Mock tests: timed, sectioned tests that mimic JLPT
a- Review system: SRS-driven review and mistake-focused review
- Mastery requirements: thresholds for completion and advancement

#### Mastery Logic
A lesson is considered mastered when a learner meets a combination of:
- Accuracy threshold (e.g. 80%+)
- Review consistency
- Time-spaced repetition completion
- Mock test performance
- Error reduction over multiple sessions

### 3.2 Kanji Learning

Each kanji card includes:
- Kanji character
- Meaning
- Onyomi and kunyomi readings
- Stroke count
- Radical
- JLPT level
- Example words
- Example sentences
- Mnemonic hints
- Common mistakes
- Similar-looking kanji comparisons

#### Teaching Experience
- Stroke-order animation using SVG paths
- Step-by-step writing mode
- Tracing practice mode
- Correct/incorrect stroke feedback
- Glow animation during stroke drawing
- Mobile touch support for handwriting practice
- Optional audio pronunciation

#### Interaction Model
- Learner taps a “Show animation” button to view the stroke sequence
- Learner practices tracing on a canvas or interactive SVG surface
- System evaluates stroke order, direction, and approximate geometry
- Feedback includes visual cues, hints, and encouragement

### 3.3 Vocabulary Learning

Each vocabulary item includes:
- Japanese word
- Kanji form
- Hiragana reading
- Romaji
- English meaning
- Part of speech
- JLPT level
- Pitch accent
- Native pronunciation audio
- Example sentences
- Natural usage notes
- Formal/informal usage
- Common learner mistakes
- Mnemonic
- SRS flashcard review

#### Learning Modes
- Recognition flashcards
- Recall flashcards
- Context sentence mode
- Audio pronunciation mode
- Listening comprehension mode

### 3.4 Grammar Learning

Each grammar point includes:
- Grammar pattern
- Meaning
- Structure
- Explanation
- Nuance
- Natural Japanese example sentences
- English translations
- Similar grammar comparison
- Common mistakes
- JLPT exam usage
- Practice questions
- Fill-in-the-blank drills
- Sentence-building drills

#### Drill Types
- Multiple choice
- Fill in the blank
- Reorder the sentence
- Match the meaning
- Produce the correct form

### 3.5 Reading Practice

Features:
- Level-based reading passages
- Furigana toggle
- Vocabulary highlight
- Grammar highlight
- Reading comprehension questions
- Timed reading mode
- Translation toggle
- Difficulty progression

#### Reading Types
- Short dialogues
- News snippets
- Daily-life passages
- Narrative excerpts
- Academic-style passages for N1

### 3.6 Listening Practice

Features:
- JLPT-style listening questions
- Audio player with controls
- Playback speed control
- Transcript toggle
- Shadowing mode
- Dictation mode
- Question types such as multiple choice, ordering, fill-in-the-blank
- Listening analytics

#### Listening Modes
- Normal listening
- Repeat listening
- Shadowing exercise
- Dictation practice

### 3.7 Mock Test System

The test system should feel close to real JLPT exam conditions.

Features:
- Level selection
- Section-based tests
- Full-length mock tests
- Timed mode
- Question navigation
- Auto-submit
- Scoring
- Pass/fail estimation
- Section-wise analytics
- Weak-point analysis
- Review explanations
- JLPT readiness score

#### Test Structure
- Listening section
- Grammar/vocabulary section
- Reading section
- Writing/production section (for future phases)

### 3.8 Practice System

The daily practice system is a core loop.

Features:
- SRS flashcards
- Kanji writing practice
- Vocabulary quizzes
- Grammar drills
- Reading drills
- Listening drills
- Mixed review mode
- Daily review queue
- Mistake review
- Weak-point training

### 3.9 Personalization

Features:
- Placement test
- Personalized learning path
- Daily study plan generator
- Weak-point detection
- Recommended lessons
- Adaptive difficulty
- Review scheduling
- Study streaks
- Learning goals

### 3.10 User System

Features:
- Signup/login
- JWT authentication
- Refresh tokens
- User profile
- Avatar
- JLPT target level
- Study goal
- Progress tracking
- XP
- Badges
- Streaks
- Achievements
- Level-up animation

---

## 4. UI/UX Design Requirements

### 4.1 Design Direction
The interface should be inspired by:
- Washi paper texture
- Sakura tones
- Ink brush aesthetics
- Minimalism
- Zen spacing
- Soft gradients
- Calm pastel colors

The product should feel refined, trustworthy, and serene rather than noisy or game-like.

### 4.2 Typography
Recommended fonts:
- Noto Sans JP
- Hiragino Sans
- Yu Gothic
- Inter for English UI

### 4.3 Motion & Animation
Use:
- Framer Motion
- Lottie icons
- Smooth page transitions
- Micro-interactions
- Hover animations
- Button press feedback
- Card flip animations
- XP gain animations
- Level-up animations
- Stroke glow animations
- Correct/incorrect feedback animations

### 4.4 Main Screens
The experience should include:
- Landing page
- Signup/login
- Onboarding
- Placement test
- Dashboard
- JLPT level selection
- Lesson list
- Kanji lesson page
- Vocabulary lesson page
- Grammar lesson page
- Reading practice page
- Listening practice page
- Flashcard review page
- Mock test page
- Test result page
- Analytics dashboard
- Profile page
- Study plan page
- Admin/content management page

### 4.5 Mobile-First Design
#### Mobile
- Bottom navigation for core flows
- Large tap targets
- Sticky practice controls
- Simple card-based lesson browsing
- Full-screen handwriting tracing experience

#### Tablet
- Two-column lesson layout
- Side panel for progress and hints
- Mixed media presentation for reading/listening

#### Desktop
- Multi-panel dashboards
- Wider lesson and analytics views
- Keyboard-friendly navigation and test-taking

### 4.6 Accessibility
Requirements:
- Keyboard navigation
- Screen reader labels
- High contrast mode
- Font-size control
- Reduced motion option
- Captions and transcripts for audio
- Furigana support
- Color-blind-safe feedback

---

## 5. Technical Architecture

### Recommended Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- Backend: Hono
- Database: PostgreSQL
- ORM: Prisma
- Cache: Redis
- Storage: S3-compatible object storage for audio, images, and SVG stroke data
- Auth: JWT access tokens + refresh tokens
- Deployment: Vercel for frontend, AWS/GCP for backend
- CDN: CloudFront or equivalent for static assets

### Why These Technologies
- React: flexible, component-driven UI foundation for a highly interactive learning experience
- TypeScript: safer development, better collaboration, stronger product stability
- Vite: fast local development and efficient production builds for a modern React app
- Tailwind CSS: fast UI iteration, consistent design system
- Framer Motion: premium animation system without heavy complexity
- Hono: lightweight, performant, and simple backend framework ideal for modern APIs and edge-friendly deployments
- PostgreSQL: robust relational model for curriculum, progress, analytics, and test systems
- Prisma: maintainable schema work and type-safe database access
- Redis: fast caching and session/queue support
- S3-compatible storage: scalable media pipeline for audio, images, and SVG assets

### System Architecture Diagram Description
A typical architecture will be:

Client App (Next.js Web App) -> API Gateway / Backend Services (NestJS/FastAPI) -> PostgreSQL + Redis -> Object Storage (S3)

Supporting services:
- Background workers for SRS scheduling, analytics processing, media processing
- CDN in front of public assets
- Monitoring and logging services
- Auth service for token issuance and refresh

### Frontend Architecture
- React application with Vite
- Feature-based module organization
- Shared design system components
- Centralized API client with auth and error handling
- Zustand or Redux Toolkit for state management
- React Query / TanStack Query for server state
- React Router for app navigation

### Backend Architecture
- Hono-based API services with modular domain structure
- Auth module
- User module
- Curriculum module
- Practice module
- Test module
- Analytics module
- Admin module
- Content module
- Media module

### Database Architecture
- PostgreSQL with normalized relational tables
- Strong referential integrity for learning content and progress tracking
- Partitioning for large analytics tables in later phases

### Storage Architecture
- Audio assets stored in object storage
- SVG stroke data stored in object storage or DB JSON columns
- Signed URLs for secure private access
- CDN caching for public assets

### Authentication Flow
1. User signs in with email/password or OAuth
2. Backend issues access token and refresh token
3. Frontend stores access token in memory or secure httpOnly cookie
4. Refresh token is rotated on use
5. Backend validates access token on every protected request

### API Design Approach
- RESTful APIs for standard CRUD and study flows
- JSON responses with consistent envelope structure
- Pagination for content lists
- Structured error codes
- Versioning via /api/v1/ prefix

### Caching Strategy
- Redis caching for frequently accessed content and dashboard data
- Short TTL for recommendations and dashboard stats
- Long TTL for static curricular content
- Cache invalidation on content updates

### Security Strategy
- Password hashing with Argon2/bcrypt
- JWT + refresh rotation
- Rate limiting
- Validation with Zod or class-validator
- XSS prevention with sanitization and CSP headers
- CSRF protection where applicable
- SQL injection prevention through ORM parameterization
- Secure signed URLs for assets
- Audit logs for admin actions

### Performance Optimization
- SSR for public pages and dashboard shell
- Prefetching for lesson routes
- Image optimization with Next.js Image
- Code-splitting for lesson and test modules
- Audio streamed and lazy-loaded
- Optimized SVG animations for stroke rendering

### Scalability Strategy
- Stateless backend services
- Horizontal scaling for API and worker services
- Queue-based background processing
- Read replicas for analytics queries if needed
- CDN for static and media assets

---

## 6. Database Schema

### Core Design Principles
- Content tables should be normalized but allow efficient lesson loading
- Progress tables should support high-volume updates
- Analytics should be query-friendly and append-friendly
- Media references must be separated from content metadata

### Main Tables

#### users
- id: UUID PK
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- username: VARCHAR(100) UNIQUE
- role: VARCHAR(50)
- is_active: BOOLEAN
- email_verified: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_login_at: TIMESTAMP

Indexes:
- idx_users_email
- idx_users_role

#### user_profiles
- id: UUID PK
- user_id: UUID FK -> users.id
- full_name: VARCHAR(255)
- avatar_url: TEXT
- native_language: VARCHAR(100)
- target_jlpt_level: VARCHAR(10)
- study_goal_hours_per_week: INT
- timezone: VARCHAR(100)
- bio: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

Unique:
- user_id unique

#### jlpt_levels
- id: UUID PK
- code: VARCHAR(10) UNIQUE
- name: VARCHAR(50)
- order_index: INT
- description: TEXT
- kanji_count: INT
- vocab_count: INT
- grammar_count: INT
- created_at: TIMESTAMP

#### kanji
- id: UUID PK
- jlpt_level_id: UUID FK -> jlpt_levels.id
- character: VARCHAR(10) UNIQUE
- meaning: TEXT
- onyomi: TEXT[]
- kunyomi: TEXT[]
- radical: VARCHAR(50)
- stroke_count: INT
- mnemonic: TEXT
- common_mistakes: TEXT[]
- example_words: JSONB
- example_sentences: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

Indexes:
- idx_kanji_level
- idx_kanji_character

#### vocabulary
- id: UUID PK
- jlpt_level_id: UUID FK -> jlpt_levels.id
- word: VARCHAR(255)
- kanji_form: VARCHAR(255)
- hiragana: VARCHAR(255)
- romaji: VARCHAR(255)
- english_meaning: TEXT
- part_of_speech: VARCHAR(100)
- pitch_accent: VARCHAR(100)
- pronunciation_audio_id: UUID FK -> audio_assets.id
- example_sentences: JSONB
- usage_notes: TEXT
- formality: VARCHAR(50)
- mnemonic: TEXT
- common_mistakes: TEXT[]
- created_at: TIMESTAMP

Indexes:
- idx_vocab_level
- idx_vocab_word

#### grammar_points
- id: UUID PK
- jlpt_level_id: UUID FK -> jlpt_levels.id
- pattern: VARCHAR(255)
- meaning: TEXT
- structure: TEXT
- explanation: TEXT
- nuance: TEXT
- examples: JSONB
- common_mistakes: JSONB
- jlpt_exam_usage: TEXT
- created_at: TIMESTAMP

#### lessons
- id: UUID PK
- jlpt_level_id: UUID FK -> jlpt_levels.id
- title: VARCHAR(255)
- slug: VARCHAR(255) UNIQUE
- lesson_type: VARCHAR(50)
- description: TEXT
- estimated_minutes: INT
- difficulty: INT
- is_published: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

#### lesson_items
- id: UUID PK
- lesson_id: UUID FK -> lessons.id
- item_type: VARCHAR(50)
- item_id: UUID
- order_index: INT
- created_at: TIMESTAMP

#### questions
- id: UUID PK
- lesson_id: UUID FK -> lessons.id
- question_type: VARCHAR(50)
- prompt: TEXT
- correct_answer: TEXT
- explanation: TEXT
- difficulty: INT
- created_at: TIMESTAMP

#### question_options
- id: UUID PK
- question_id: UUID FK -> questions.id
- option_text: TEXT
- is_correct: BOOLEAN
- order_index: INT

#### mock_tests
- id: UUID PK
- jlpt_level_id: UUID FK -> jlpt_levels.id
- title: VARCHAR(255)
- slug: VARCHAR(255) UNIQUE
- total_time_minutes: INT
- is_full_length: BOOLEAN
- is_published: BOOLEAN
- created_at: TIMESTAMP

#### mock_test_sections
- id: UUID PK
- mock_test_id: UUID FK -> mock_tests.id
- name: VARCHAR(100)
- order_index: INT
- time_limit_minutes: INT

#### mock_test_questions
- id: UUID PK
- mock_test_section_id: UUID FK -> mock_test_sections.id
- question_id: UUID FK -> questions.id
- order_index: INT

#### user_progress
- id: UUID PK
- user_id: UUID FK -> users.id
- xp_points: INT
- current_level: INT
- streak_days: INT
- last_active_date: DATE
- study_goal_hours: INT
- readiness_score: INT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

#### user_lesson_progress
- id: UUID PK
- user_id: UUID FK -> users.id
- lesson_id: UUID FK -> lessons.id
- status: VARCHAR(50)
- mastery_score: INT
- attempts: INT
- completed_at: TIMESTAMP
- last_reviewed_at: TIMESTAMP
- created_at: TIMESTAMP

Indexes:
- idx_user_lesson_progress_user_lesson
- idx_user_lesson_progress_status

#### user_flashcards
- id: UUID PK
- user_id: UUID FK -> users.id
- item_type: VARCHAR(50)
- item_id: UUID
- due_at: TIMESTAMP
- ease_factor: FLOAT
- interval_days: INT
- reps: INT
- lapses: INT
- created_at: TIMESTAMP

#### srs_reviews
- id: UUID PK
- user_id: UUID FK -> users.id
- flashcard_id: UUID FK -> user_flashcards.id
- rating: INT
- reviewed_at: TIMESTAMP
- next_due_at: TIMESTAMP

#### user_test_results
- id: UUID PK
- user_id: UUID FK -> users.id
- mock_test_id: UUID FK -> mock_tests.id
- score: INT
- max_score: INT
- accuracy_percent: FLOAT
- readiness_score: INT
- passed_estimate: BOOLEAN
- completed_at: TIMESTAMP

#### user_test_answers
- id: UUID PK
- user_test_result_id: UUID FK -> user_test_results.id
- question_id: UUID FK -> questions.id
- selected_option_id: UUID FK -> question_options.id
- is_correct: BOOLEAN
- answered_at: TIMESTAMP

#### achievements
- id: UUID PK
- code: VARCHAR(100) UNIQUE
- title: VARCHAR(255)
- description: TEXT
- icon: VARCHAR(255)
- xp_reward: INT

#### user_achievements
- id: UUID PK
- user_id: UUID FK -> users.id
- achievement_id: UUID FK -> achievements.id
- unlocked_at: TIMESTAMP

#### study_plans
- id: UUID PK
- user_id: UUID FK -> users.id
- title: VARCHAR(255)
- start_date: DATE
- end_date: DATE
- generated_at: TIMESTAMP

#### study_plan_items
- id: UUID PK
- study_plan_id: UUID FK -> study_plans.id
- lesson_id: UUID FK -> lessons.id
- task_type: VARCHAR(50)
- scheduled_date: DATE
- status: VARCHAR(50)
- created_at: TIMESTAMP

#### audio_assets
- id: UUID PK
- storage_key: TEXT UNIQUE
- mime_type: VARCHAR(100)
- duration_seconds: INT
- language: VARCHAR(50)
- transcript: TEXT
- created_at: TIMESTAMP

#### stroke_assets
- id: UUID PK
- kanji_id: UUID FK -> kanji.id
- storage_key: TEXT UNIQUE
- svg_data: TEXT
- stroke_count: INT
- created_at: TIMESTAMP

### Prisma Model Examples

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  username      String   @unique
  role          String   @default("student")
  isActive      Boolean  @default(true)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  profile       UserProfile?
  progress      UserProgress?
  lessonProgress UserLessonProgress[]
  flashcards    UserFlashcard[]
  testResults   UserTestResult[]
}

model Kanji {
  id            String   @id @default(cuid())
  character     String   @unique
  meaning       String
  onyomi        String[]
  kunyomi       String[]
  radical       String
  strokeCount   Int
  jlptLevelId   String
  jlptLevel     JlptLevel @relation(fields: [jlptLevelId], references: [id])
  mnemonic      String?
  exampleWords  Json?
  exampleSentences Json?
  strokeAssets  StrokeAsset?
}

model UserLessonProgress {
  id            String   @id @default(cuid())
  userId        String
  lessonId      String
  status        String   @default("not_started")
  masteryScore  Int      @default(0)
  attempts      Int      @default(0)
  completedAt   DateTime?
  lastReviewedAt DateTime?
  createdAt     DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id])
  lesson        Lesson   @relation(fields: [lessonId], references: [id])
}
```

---

## 7. API Design

### Authentication Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| POST | /api/v1/auth/register | Register a new user | No |
| POST | /api/v1/auth/login | Login and issue tokens | No |
| POST | /api/v1/auth/refresh | Refresh access token | No |
| POST | /api/v1/auth/logout | Revoke refresh token | Yes |
| GET | /api/v1/auth/me | Get current user | Yes |

#### Example Request: Register
```json
{
  "email": "learner@example.com",
  "username": "japanlover",
  "password": "StrongPassword123!",
  "targetJlpLevel": "N3"
}
```

#### Example Response
```json
{
  "user": {
    "id": "usr_123",
    "email": "learner@example.com",
    "username": "japanlover",
    "role": "student"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### User Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/users/me | Get profile | Yes |
| PATCH | /api/v1/users/me | Update profile | Yes |
| GET | /api/v1/users/me/dashboard | Get dashboard stats | Yes |
| GET | /api/v1/users/me/achievements | Get achievements | Yes |

### Curriculum Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/jlpt/levels | Get available JLPT levels | Yes |
| GET | /api/v1/lessons?level=N3 | Get lessons by level | Yes |
| GET | /api/v1/lessons/:id | Get lesson detail | Yes |
| GET | /api/v1/recommendations | Get recommended lessons | Yes |

### Kanji Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/kanji | Get kanji list | Yes |
| GET | /api/v1/kanji/:id | Get kanji detail | Yes |
| GET | /api/v1/kanji/:id/stroke-data | Get stroke data | Yes |
| POST | /api/v1/kanji/:id/write-attempt | Submit writing attempt | Yes |
| GET | /api/v1/kanji/practice-queue | Get kanji practice queue | Yes |

### Vocabulary Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/vocabulary | Get vocabulary list | Yes |
| GET | /api/v1/vocabulary/:id | Get vocabulary detail | Yes |
| POST | /api/v1/vocabulary/:id/quiz-answer | Submit vocabulary quiz answer | Yes |
| GET | /api/v1/vocabulary/srs-queue | Get SRS review queue | Yes |

### Grammar Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/grammar | Get grammar list | Yes |
| GET | /api/v1/grammar/:id | Get grammar detail | Yes |
| POST | /api/v1/grammar/:id/drill-answer | Submit grammar drill answer | Yes |

### Reading Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/reading/passages | Get reading passages | Yes |
| POST | /api/v1/reading/passages/:id/answers | Submit reading answers | Yes |

### Listening Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/listening/questions | Get listening questions | Yes |
| POST | /api/v1/listening/questions/:id/answers | Submit listening answers | Yes |

### Mock Test Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| POST | /api/v1/mock-tests/sessions | Create test session | Yes |
| GET | /api/v1/mock-tests/sessions/:id/questions | Get test questions | Yes |
| POST | /api/v1/mock-tests/sessions/:id/answers | Submit answer | Yes |
| POST | /api/v1/mock-tests/sessions/:id/submit | Submit test | Yes |
| GET | /api/v1/mock-tests/results/:id | Get test result | Yes |
| GET | /api/v1/mock-tests/analytics | Get test analytics | Yes |

### Study Plan Endpoints

| Method | URL | Purpose | Auth |
|---|---|---|---|
| POST | /api/v1/study-plans/generate | Generate study plan | Yes |
| GET | /api/v1/study-plans/daily | Get daily plan | Yes |
| PATCH | /api/v1/study-plans/items/:id/complete | Mark task complete | Yes |

---

## 8. Frontend Component Structure

### Recommended Project Structure

```text
src/
  app/
    (public)/
      page.tsx
      login/page.tsx
      signup/page.tsx
      onboarding/page.tsx
    (app)/
      dashboard/page.tsx
      levels/page.tsx
      lessons/[slug]/page.tsx
      kanji/[id]/page.tsx
      vocabulary/[id]/page.tsx
      grammar/[id]/page.tsx
      reading/[id]/page.tsx
      listening/[id]/page.tsx
      review/page.tsx
      tests/page.tsx
      tests/[id]/page.tsx
      analytics/page.tsx
      profile/page.tsx
      plan/page.tsx
      admin/page.tsx
  components/
    ui/
    layout/
    lesson/
    practice/
    test/
    analytics/
    admin/
  features/
    auth/
    curriculum/
    kanji/
    vocabulary/
    grammar/
    reading/
    listening/
    tests/
    analytics/
    gamification/
  hooks/
  services/
    api.ts
    auth.ts
    curriculum.ts
    tests.ts
    analytics.ts
  stores/
    auth.store.ts
    progress.store.ts
    ui.store.ts
  types/
  utils/
  animations/
  styles/
```

### Reusable Components

- LessonCard: shows lesson title, level, duration, difficulty, completion status
- KanjiCard: displays kanji with readings and progress
- VocabularyCard: shows word, meaning, pronunciation, difficulty
- GrammarCard: shows grammar pattern and mastery badge
- StrokeOrderPlayer: animates stroke order and playback controls
- TracingCanvas: handles handwriting tracing and evaluation
- FlashcardDeck: shows SRS cards with flip animation and rating controls
- MockTestTimer: countdown timer and session status
- ProgressRing: circular progress indicator
- XPBar: shows current XP and next-level target
- StreakBadge: visual streak indicator
- ReadinessScoreCard: displays readiness metrics and progress
- AudioPlayer: audio controls with speed, transcript, and loop features
- FuriganaText: renders Japanese text with furigana support
- QuestionRenderer: displays different question types consistently
- ResultAnalyticsChart: summary analytics and trends

---

## 9. Kanji Stroke Animation Implementation

### SVG Stroke Data Format
Stroke data should be stored as paths or simplified vector coordinates.

Example:
```json
{
  "strokes": [
    "M10 20 L40 20",
    "M25 10 L25 40"
  ]
}
```

Alternative structured format:
```json
{
  "strokes": [
    [{"x": 10, "y": 20}, {"x": 40, "y": 20}],
    [{"x": 25, "y": 10}, {"x": 25, "y": 40}]
  ]
}
```

### Rendering Approach
- Render each stroke as an SVG path
- Animate path drawing with stroke-dasharray and stroke-dashoffset
- Use Framer Motion for path reveal and glow effects
- Use requestAnimationFrame for high-frequency drawing updates

### Stroke-by-Stroke Playback
- Each stroke is played sequentially with a delay
- Users can pause, resume, and replay
- A “next stroke” button advances manually

### Tracing Mode
- Use a canvas or SVG overlay to capture pointer events
- Track the user’s path in real time
- Compare the input path against the ideal stroke path using distance metrics

### Accuracy Logic
A simplified approach:
1. Sample the user stroke into points
2. Compare to reference stroke points
3. Calculate average distance error and order correctness
4. Accept a stroke if error is under threshold and sequence order matches

### Example Pseudocode

```ts
function calculateStrokeAccuracy(userPoints, referencePoints) {
  const maxDistance = 40;
  let totalDistance = 0;
  let count = 0;

  for (let i = 0; i < referencePoints.length; i++) {
    const ref = referencePoints[i];
    const user = userPoints[i] ?? userPoints[userPoints.length - 1];
    const dx = ref.x - user.x;
    const dy = ref.y - user.y;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
    count += 1;
  }

  const avgDistance = count > 0 ? totalDistance / count : maxDistance;
  const score = Math.max(0, 100 - (avgDistance / maxDistance) * 100);
  return Math.round(score);
}
```

### Component Examples

#### StrokeOrderPlayer
```tsx
export function StrokeOrderPlayer({ strokes }: { strokes: string[] }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setTimeout(() => {
      if (index < strokes.length - 1) setIndex(index + 1);
      else setIsPlaying(false);
    }, 600);
    return () => window.clearTimeout(id);
  }, [index, isPlaying, strokes.length]);

  return (
    <div>
      <svg viewBox="0 0 100 100" className="w-full h-64">
        <path d={strokes[index]} stroke="currentColor" strokeWidth="4" fill="none" />
      </svg>
      <button onClick={() => setIsPlaying(!isPlaying)}>Play/Pause</button>
      <button onClick={() => setIndex(0)}>Replay</button>
    </div>
  );
}
```

#### TracingCanvas
```tsx
export function TracingCanvas({ referenceStrokes }: { referenceStrokes: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<string>("Trace the stroke");

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  return (
    <div>
      <canvas ref={canvasRef} width={300} height={300} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} />
      <p>{feedback}</p>
    </div>
  );
}
```

### Mobile Support
- Pointer events for touch and pen input
- Large hit areas
- Smooth stroke rendering with touch-action: none
- Haptic feedback on success/failure where supported

### Performance Optimization
- Pre-render SVG assets
- Avoid heavy reflows during animation
- Use CSS transforms and opacity for motion
- Cache stroke data and audio assets aggressively

---

## 10. Learning Flow

### Learner Journey
1. User signs up
2. Selects target JLPT level
3. Takes a placement test
4. Receives a personalized study plan
5. Completes daily lessons
6. Reviews flashcards using SRS
7. Practices weak points
8. Takes mock tests
9. Reviews analytics
10. Improves readiness score
11. Reaches exam-ready status

### Adaptation Logic
- If accuracy is low, the system decreases difficulty and recommends review content
- If accuracy is high, the system increases challenge and introduces more advanced examples
- If a learner repeatedly misses a concept, it becomes a weak-point topic and appears in daily practice
- If study consistency drops, the app sends encouraging reminders and simplifies goals

### Example Flow
- Day 1: Placement test + onboarding + initial daily plan
- Day 2-7: Core lessons + 10-20 flashcards + one short quiz
- Weekly: mock test + analytics review + weak-point training

---

## 11. Mock Test and Analytics System

### Test Generation Logic
- Select questions from the current JLPT level and prior level difficulty bands
- Balance question types and skills
- Avoid too many repeated concepts
- Support randomization while preserving content coverage

### Difficulty Balancing
- Start with medium questions
- Increase difficulty after good performance
- Include review questions for previously missed concepts

### Timed Mode
- Countdown timer per section and overall test
- Auto-submit at zero time
- Review mode after submission

### Scoring
- Each question has a weighted value
- Section totals are converted into a readiness score
- Wrong answers may slightly reduce scores for confidence-based evaluation

### Pass Probability Estimation
A simple estimate can be based on:
- Accuracy percentage
- Section performance
- Review history
- Past mock test trend

### Readiness Score Formula
Example:

$$
\text{Readiness Score} = 0.35 \times \text{Lesson Mastery} + 0.25 \times \text{Quiz Accuracy} + 0.20 \times \text{Mock Test Score} + 0.20 \times \text{Consistency Score}
$$

### Analytics Dashboard
Visualizations should include:
- Weekly study hours
- Daily streak
- Lesson completion trend
- Accuracy by domain
- Weak-point frequency
- Mock test trendline
- Readiness score history

### Review Explanations
After each test, learners see:
- Correct answers
- Explanation for each answer
- Why the misconception occurred
- Related lesson recommendations

---

## 12. Gamification System

### Core Gamification Features
- XP system
- Level system
- Streaks
- Badges
- Daily goals
- Weekly challenges
- Leaderboards
- Achievement unlocks
- Celebration animations
- Motivational feedback
- Study consistency score

### Principles
Gamification should support learning, not distract from it. Rewards should be tied to meaningful progress and effort.

### Example Reward Logic
- Complete lesson: +50 XP
- Finish daily review: +20 XP
- Score above 80% on quiz: +30 XP
- Maintain a 7-day streak: badge unlock
- Complete a mock test: achievement unlock

### Motivation Design
- Celebrate small wins with subtle animations
- Avoid overwhelming notifications
- Include “keep going” prompts with encouraging language

---

## 13. Localization and Japanese Language Quality

### Supported Languages
- English UI
- Japanese UI
- Bilingual explanations

### Language Features
- Furigana support
- Romaji toggle for beginners
- Pitch accent display
- Formal/casual nuance labels
- Cultural notes
- Common learner mistake warnings

### Content Quality Process
All content should be reviewed by:
- Native Japanese speakers
- JLPT specialists
- Experienced Japanese instructors
- Localization editors for English/Japanese UI

### Review Workflow
- Content draft created by curriculum team
- Reviewed by native Japanese expert
- Revised for naturalness and educational accuracy
- QA-tested in UI for readability and formatting

---

## 14. Admin and Content Management

### Admin Roles
- Student
- Teacher
- Content editor
- Admin
- Super admin

### Admin Capabilities
- Manage kanji data
- Manage vocabulary data
- Manage grammar lessons
- Manage reading passages
- Manage listening audio
- Manage questions and test content
- Manage mock tests
- Manage JLPT level mappings
- Moderate user reports
- Review content status
- Publish/unpublish content

### Publishing Workflow
- Draft
- Review
- Approved
- Published
- Archived

### Content Status Tracking
Each content item should include:
- Created by
- Reviewed by
- Last updated
- Status
- Version history

---

## 15. Security Requirements

### Core Security Controls
- Password hashing with Argon2 or bcrypt
- JWT access tokens with short TTL
- Refresh token rotation
- Rate limiting per IP and per account
- Input validation and sanitization
- XSS protection
- CSRF protection where applicable
- SQL injection prevention via ORM
- Secure file uploads with content type validation
- Signed URLs for private S3 assets
- Audit logging for admin activities
- GDPR/APPI-style privacy controls

### Privacy Considerations
- Allow account deletion/export
- Keep consent preferences visible
- Store only necessary personal data
- Anonymize analytics where possible

---

## 16. Performance and Scalability

### Initial Page Load
- Use SSR and static generation where possible
- Optimize route-level code splitting
- Preload key lesson assets

### Audio Delivery
- Stream audio from CDN
- Use compressed formats like MP3 or AAC
- Provide low-bandwidth fallbacks

### SVG Stroke Rendering
- Precompute SVG paths
- Keep DOM light
- Use GPU-friendly transforms

### Question Loading
- Load question batches rather than entire tests at once
- Cache frequently used lessons

### Mock Test Sessions
- Keep test session state in memory or Redis for resilience
- Use optimistic UI for answer submission

### Dashboard Analytics
- Pre-aggregate common metrics
- Use read replicas if analytics traffic increases

### Database Queries
- Add indexes on frequent filters
- Avoid N+1 queries with Prisma relations
- Batch query patterns where needed

### Caching Rules
- Static curriculum content: long TTL
- User progress: short TTL with invalidation on updates
- Dashboard stats: 1-5 min TTL

### Background Jobs
- SRS scheduling
- Analytics aggregation
- Content ingestion jobs
- Email or reminder processing

### Queue Usage
Use a background queue such as BullMQ or Celery for:
- Daily reminder emails
- Content indexing
- Media processing
- Test result calculation

---

## 17. Deployment Plan

### Recommended Production Deployment
- Frontend: Vercel
- Backend API: AWS ECS/Fargate, Cloud Run, or Kubernetes
- PostgreSQL: RDS or Cloud SQL
- Redis: ElastiCache or Memorystore
- Storage: S3 or GCS
- CDN: CloudFront or Cloud CDN

### CI/CD
- GitHub Actions or equivalent
- Linting, tests, build checks on every PR
- Automated deployment to staging and production

### Environment Variables
Required examples:
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- S3_BUCKET
- AWS_REGION
- NEXT_PUBLIC_API_URL

### Monitoring and Logging
- Sentry for frontend/backend error tracking
- Prometheus/Grafana or equivalent metrics pipeline
- Structured logs with correlation IDs

### Backup Strategy
- Daily automated PostgreSQL backups
- Versioned object storage for assets
- Point-in-time restore capability

### Disaster Recovery
- Multi-region deployment for critical services in later phases
- Regular restore drills
- Infrastructure as code

---

## 18. Development Roadmap

### Phase 1 — MVP
Goals:
- Launch a usable learning platform for core study flow

Main Features:
- User accounts
- JLPT N5/N4 curriculum
- Lesson browsing
- Flashcards
- Basic progress tracking
- Simple analytics

Technical Tasks:
- Set up monorepo
- Create auth and user modules
- Design curriculum schema
- Implement lesson and progress APIs
- Build responsive learning UI

Estimated Complexity: Medium
Risks:
- Content creation workload
- Scope creep in lesson UX

### Phase 2 — Core Practice & Testing
Goals:
- Add deep practice and test readiness

Main Features:
- Kanji stroke animation
- SRS flashcards
- Mock tests
- Analytics dashboard

Technical Tasks:
- Add stroke asset pipeline
- Implement spaced repetition engine
- Add test engine and scoring
- Build analytics backend

Estimated Complexity: High
Risks:
- Complex test logic and scoring accuracy

### Phase 3 — Personalization
Goals:
- Make the platform adaptive

Main Features:
- Personalized learning path
- Weak-point detection
- Adaptive difficulty
- Listening/shadowing practice

Technical Tasks:
- Build recommendation engine
- Add study plan generation
- Add mastery and weak-point algorithms

Estimated Complexity: High
Risks:
- Recommendation quality may need tuning

### Phase 4 — CMS and Localization
Goals:
- Prepare for institutional use

Main Features:
- Admin CMS
- Localization system
- Teacher and classroom workflows
- Advanced gamification

Technical Tasks:
- Build admin dashboard
- Add role-based access control
- Add localization pipeline
- Implement content review workflow

Estimated Complexity: Medium-High
Risks:
- Permissions and workflow complexity

### Phase 5 — AI and Advanced Learning
Goals:
- Become a next-generation language tutor platform

Main Features:
- AI tutor
- Grammar correction
- Speech evaluation
- Conversation practice
- Mobile app

Technical Tasks:
- Integrate LLM services
- Speech-to-text and pronunciation analysis
- Expand backend for real-time interaction

Estimated Complexity: Very High
Risks:
- Accuracy of AI evaluation and cost management

---

## 19. Future Scalability Roadmap

Potential enhancements:
- AI Japanese tutor
- AI grammar correction
- Speech pronunciation scoring
- Native-speaker conversation practice
- Mobile apps for iOS and Android
- Offline learning mode
- Teacher dashboard
- Classroom mode
- Corporate training mode
- JLPT exam simulation mode
- Community features
- Content marketplace

---

## 20. Final Recommended Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- TanStack Query
- Zustand
- React Router
- Heroicons / Lucide / custom icons

### Backend
- Hono
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ / Celery

### Media & Storage
- S3-compatible storage
- CloudFront CDN
- WebM/MP3 media pipeline

### Analytics & Monitoring
- PostHog or Mixpanel
- Sentry
- Grafana/Prometheus or equivalent

### Authentication & Security
- JWT + refresh rotation
- Argon2/bcrypt
- Rate limiting
- Zod / class-validator

### Deployment
- Vercel for frontend
- AWS/GCP for backend
- RDS/Cloud SQL for DB
- ElastiCache/Memorystore for Redis

---

## Recommended Product Principles

To ensure the platform feels polished and enterprise-ready:
- Prioritize clarity over complexity in lesson flows
- Use calm visual language and subtle motion
- Make every learning interaction feel intentional
- Create consistent feedback loops for success and error correction
- Build content and pedagogy first, with technology supporting it
- Make the experience delightful for daily practice rather than only exam preparation

## Final Recommendation

The best version of this product is a premium, bilingual, mobile-first Japanese learning platform that combines rigorous JLPT pedagogy with refined digital experience design. The architecture should be modular, scalable, and content-driven, allowing the product to evolve from a learning app into a full AI-assisted language education ecosystem.
