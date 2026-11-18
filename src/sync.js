// Supabase sync over plain REST (no SDK: keeps the bundle small for a low-end phone).
// Phone first, cloud second: everything is saved locally, then pushed in batches when online.

const BASE = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_KEY
export const enabled = !!(BASE && KEY)

const OUTBOX = 'gc_outbox'

function readLS(k, d) {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : d
  } catch {
    return d
  }
}
function writeLS(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

async function rest(path, { method = 'GET', body, prefer } = {}) {
  if (!enabled || (typeof navigator !== 'undefined' && navigator.onLine === false)) throw new Error('offline')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const r = await fetch(`${BASE}/rest/v1/${path}`, {
      method,
      signal: ctrl.signal,
      headers: { apikey: KEY, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return method === 'GET' ? r.json() : null
  } finally {
    clearTimeout(timer)
  }
}

// ---- outbox: events, learner progress and reviews queue up and flush together ----
export function enqueue(kind, row) {
  const box = readLS(OUTBOX, [])
  box.push({ kind, row })
  writeLS(OUTBOX, box.slice(-3000))
  schedule()
}

let timer = null
let flushing = false
export function schedule(ms = 2500) {
  if (!enabled) return
  clearTimeout(timer)
  timer = setTimeout(flush, ms)
}

export async function flush() {
  if (!enabled || flushing) return
  const box = readLS(OUTBOX, [])
  if (!box.length) return
  flushing = true
  try {
    const events = box.filter((x) => x.kind === 'event').map((x) => x.row)
    // keep only the latest version of each learner / review
    const latest = (kind) => Object.values(Object.fromEntries(box.filter((x) => x.kind === kind).map((x) => [x.row.id, x.row])))
    if (events.length) await rest('events', { method: 'POST', body: events, prefer: 'return=minimal' })
    const learners = latest('learner')
    if (learners.length) await rest('learners?on_conflict=id', { method: 'POST', body: learners, prefer: 'resolution=merge-duplicates,return=minimal' })
    const reviews = latest('review')
    if (reviews.length) await rest('reviews?on_conflict=id', { method: 'POST', body: reviews, prefer: 'resolution=merge-duplicates,return=minimal' })
    // drop what was sent; keep anything added meanwhile
    writeLS(OUTBOX, readLS(OUTBOX, []).slice(box.length))
  } catch {
    schedule(15000) // offline or error: retry later
  } finally {
    flushing = false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => schedule(500))
  schedule(1000)
}

export const pendingCount = () => readLS(OUTBOX, []).length

// ---- mapping between app objects and table rows ----
export function reviewToRow(r) {
  const { id, learnerId, learnerName, taskId, kind, status, decision, message, ts, decidedAt, ...payload } = r
  return { id, learner_id: learnerId, learner_name: learnerName, task_id: taskId, kind, status, decision: decision ?? null, message: message ?? null, payload, created_at: ts, decided_at: decidedAt ?? null }
}

export function rowToReview(x) {
  return { ...x.payload, id: x.id, learnerId: x.learner_id, learnerName: x.learner_name, taskId: x.task_id, kind: x.kind, status: x.status, decision: x.decision, message: x.message, ts: x.created_at, decidedAt: x.decided_at }
}

// ---- reads for the teacher view and the learner's teacher messages ----
export async function fetchReviews(learnerId) {
  const q = 'reviews?select=*&order=created_at.desc&limit=200' + (learnerId ? `&learner_id=eq.${encodeURIComponent(learnerId)}` : '')
  return (await rest(q)).map(rowToReview)
}

export async function fetchLearners() {
  return rest('learners?select=id,name,progress,last_active&order=last_active.desc&limit=200')
}

export async function fetchEvents() {
  return rest('events?select=ts,user_id,session_id,event_type,target,objective_id,value,correct,duration_ms,meta&order=ts.desc&limit=2000')
}
