// Offline-first storage: everything lives in localStorage on the phone (works with no data connection).
// Clickstream events follow the schema in supabase/schema.sql so they can be synced later.

const K = {
  learners: 'gc_learners',
  events: 'gc_events',
  reviews: 'gc_reviews',
  session: (id) => 'gc_session_' + id,
}

export function read(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked: app keeps working in memory */
  }
}

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

let currentUser = 'anon'
const sessionId = uid('s')

export function setUser(id) {
  currentUser = id
}

// ---- learners ----
export const getLearners = () => read(K.learners, [])

export function upsertLearner(name) {
  const clean = name.trim()
  const list = getLearners()
  let l = list.find((x) => x.name.toLowerCase() === clean.toLowerCase())
  if (!l) {
    l = { id: uid('L'), name: clean, created: new Date().toISOString() }
    list.push(l)
  }
  l.lastActive = new Date().toISOString()
  write(K.learners, list)
  return l
}

export const loadSession = (id) => read(K.session(id), null)
export const saveSession = (id, s) => write(K.session(id), s)

// ---- clickstream ----
export function logEvent(event_type, d = {}) {
  const events = read(K.events, [])
  events.push({
    ts: new Date().toISOString(),
    user_id: currentUser,
    session_id: sessionId,
    event_type,
    target: d.target ?? null,
    objective_id: d.objective_id ?? null,
    value: d.value ?? null,
    correct: d.correct ?? null,
    duration_ms: d.duration_ms ?? null,
    meta: d.meta ?? {},
  })
  write(K.events, events.slice(-5000))
}

export const getEvents = () => read(K.events, [])

// ---- teacher review queue (C5) ----
export const getReviews = () => read(K.reviews, [])

export function addReview(r) {
  const list = getReviews()
  list.push({ id: uid('R'), ts: new Date().toISOString(), status: 'pending', ...r })
  write(K.reviews, list)
}

export function updateReview(id, patch) {
  write(
    K.reviews,
    getReviews().map((r) => (r.id === id ? { ...r, ...patch, decidedAt: new Date().toISOString() } : r)),
  )
}

export function exportCSV() {
  const cols = ['ts', 'user_id', 'session_id', 'event_type', 'target', 'objective_id', 'value', 'correct', 'duration_ms', 'meta']
  const esc = (v) => '"' + String(typeof v === 'object' && v !== null ? JSON.stringify(v) : v ?? '').replace(/"/g, '""') + '"'
  const rows = getEvents().map((e) => cols.map((c) => esc(e[c])).join(','))
  return [cols.join(','), ...rows].join('\n')
}
