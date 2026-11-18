// Offline-first storage: everything lives in localStorage on the phone (works with no data connection).
// Clickstream events follow the schema in supabase/schema.sql so they can be synced later.

import { enqueue, reviewToRow } from './sync'

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
  enqueue('learner', { id: l.id, name: l.name, progress: read(K.session(l.id), null)?.progress || {}, last_active: l.lastActive })
  return l
}

export const loadSession = (id) => read(K.session(id), null)
export function saveSession(id, s) {
  write(K.session(id), s)
  const l = getLearners().find((x) => x.id === id)
  if (l) enqueue('learner', { id, name: l.name, progress: s.progress || {}, last_active: new Date().toISOString() })
}

// ---- clickstream ----
export function logEvent(event_type, d = {}) {
  const events = read(K.events, [])
  const e = {
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
  }
  events.push(e)
  write(K.events, events.slice(-5000))
  enqueue('event', e)
}

export const getEvents = () => read(K.events, [])

// ---- teacher review queue (C5) ----
export const getReviews = () => read(K.reviews, [])

export function addReview(r) {
  const list = getReviews()
  const rev = { id: uid('R'), ts: new Date().toISOString(), status: 'pending', ...r }
  list.push(rev)
  write(K.reviews, list)
  enqueue('review', reviewToRow(rev))
}

export function updateReview(id, patch, base) {
  const list = getReviews()
  const cur = list.find((r) => r.id === id) || base
  if (!cur) return
  const next = { ...cur, ...patch, decidedAt: new Date().toISOString() }
  write(K.reviews, [...list.filter((r) => r.id !== id), next])
  enqueue('review', reviewToRow(next))
}

// Merge reviews fetched from Supabase; a decided review wins over a pending copy.
export function mergeReviews(remote) {
  const map = new Map(getReviews().map((r) => [r.id, r]))
  for (const r of remote) {
    const cur = map.get(r.id)
    if (!cur || (cur.status === 'pending' && r.status !== 'pending') || (r.decidedAt || '') > (cur.decidedAt || '')) map.set(r.id, r)
  }
  write(K.reviews, [...map.values()])
}

export function exportCSV() {
  const cols = ['ts', 'user_id', 'session_id', 'event_type', 'target', 'objective_id', 'value', 'correct', 'duration_ms', 'meta']
  const esc = (v) => '"' + String(typeof v === 'object' && v !== null ? JSON.stringify(v) : v ?? '').replace(/"/g, '""') + '"'
  const rows = getEvents().map((e) => cols.map((c) => esc(e[c])).join(','))
  return [cols.join(','), ...rows].join('\n')
}
