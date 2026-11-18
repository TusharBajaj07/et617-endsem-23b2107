// Multi-agent core: code checker, shared blackboard, AI call with validation + scripted fallback.
import { TASKS } from './content.js'

export const fmt = (n) => (n < 0 ? '−' + Math.abs(n) : String(n))

// Accepts "-7", "−7", " 7 " → number, or null
export function parseNum(s) {
  const v = String(s ?? '').trim().replace(/[−–—]/g, '-').replace(/\s+/g, '')
  return /^[+-]?\d+$/.test(v) ? parseInt(v, 10) : null
}

// CHECKER (code, never AI): correct? which misconception does the answer match?
export function check(task, ans) {
  if (task.options) {
    const o = task.options.find((x) => x.id === ans.option)
    return { correct: o.correct ?? false, tag: o.tag, value: ans.option }
  }
  let v = ans.value
  if (task.type === 'sign') v = (ans.sign === '-' ? -1 : 1) * Math.abs(ans.value)
  if (v === task.correct) return { correct: true, tag: 'correct', value: v }
  let tag = task.diagnose?.[v]
  if (!tag && task.type === 'sign' && ans.sign === '-') tag = 'sign'
  return { correct: false, tag: tag || 'other', value: v }
}

// BLACKBOARD: shared state every agent reads (built from the learner's progress).
export function blackboard(progress) {
  const history = TASKS.map((t, i) => ({ task: t.id, no: i + 1, lo: t.lo, tags: progress[t.id]?.tags || [], done: !!progress[t.id]?.done }))
  const count = (m) => history.reduce((n, h) => n + h.tags.filter((x) => x === m).length, 0)
  return { history, misconceptions: { M1: count('M1'), M2: count('M2') } }
}

export function mastery(progress = {}) {
  const lo1 = ['T1', 'T2', 'T3', 'T4'].filter((id) => progress[id]?.firstCorrect).length
  const t5 = progress.T5 || {}
  const lo2 = t5.firstCorrect || t5.resolution === 'test-pass' || (t5.rubric ?? 0) >= 2 ? 'yes' : t5.shortcut ? 'partial' : t5.done ? 'no' : '-'
  const lo3 = progress.T6?.firstCorrect ? 'yes' : progress.T6?.done ? 'no' : '-'
  const { misconceptions } = blackboard(progress)
  return { lo1, lo2, lo3, ...misconceptions }
}

const hasDevanagari = (s) => /[ऀ-ॿ]/.test(s || '')

// Output check before the learner sees anything AI-generated.
export function validAI(out, ctx) {
  if (!out || typeof out.hi !== 'string' || typeof out.en !== 'string') return false
  if (!hasDevanagari(out.hi) || out.hi.length > 400 || out.en.length > 400) return false
  // No answer reveal while the learner is still trying.
  // Jaanch must not call a wrong answer right.
  // After a wrong answer, no agent may say "X is right/correct" (the child reads it as "my answer is right").
  if (ctx?.verdict === 'wrong' && (/\b(is|was|are)\s+(right|correct)\b|'s\s+(right|correct)\b/i.test(out.en) || /ने\s+(सही|ठीक)\s+कहा|(सही|ठीक)\s+(कह|बोल)/.test(out.hi))) return false
  if (ctx?.agent === 'jaanch' && ctx.verdict === 'wrong' && /\b(correct|right)\b/i.test(out.en) && !/\b(not|isn't|incorrect|wrong)\b/i.test(out.en)) return false
  if (ctx?.verdict !== 'correct' && (ctx?.attempt || 0) < 2 && ctx?.task?.correct != null) {
    const c = String(Math.abs(ctx.task.correct))
    const re = new RegExp(`=\\s*[−-]?\\s*${c}(?!\\d)`)
    if (re.test(out.hi) || re.test(out.en)) return false
    // Also block the bare answer number when it is not already in the question (e.g. "you get 8").
    const inQuestion = new RegExp(`(^|\\D)${c}(?!\\d)`).test(String(ctx.task.expr || ''))
    const bare = new RegExp(`(^|\\D)${c}(?!\\d)`)
    if (!inQuestion && (bare.test(out.en) || bare.test(out.hi))) return false
    // Block rewriting into the easy sum, e.g. "5 + 3".
    const sums = [...out.en.matchAll(/(\d+)\s*\+\s*(\d+)/g)]
    if (sums.some((m) => +m[1] + +m[2] === Math.abs(ctx.task.correct))) return false
    // Block computing it in words: "₹3 more than ₹5".
    if (/\d+\s*(more|less|bigger|smaller|greater|fewer)\s+than\s*₹?\s*\d+/i.test(out.en)) return false
  }
  return true
}

// Ask an AI agent; fall back to the scripted (teacher-approved) line on timeout, error or failed check.
export async function aiTurn(ctx, fallback, timeoutMs = 11000) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ...fallback, source: 'scripted' }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ctx),
      signal: ctrl.signal,
    })
    const j = await r.json()
    if (j.ok && validAI(j, ctx)) return { hi: j.hi, en: j.en, score: j.score, stance: j.stance, source: 'ai', model: j.model }
  } catch {
    /* fall through to scripted */
  } finally {
    clearTimeout(timer)
  }
  return { ...fallback, source: 'scripted' }
}

// Scripted rubric for T5 free text when AI is unavailable (keyword heuristic, flagged for teacher).
export function rubricFallback(text) {
  const s = (text || '').toLowerCase()
  let score = 0
  if (/(उधार|udhaar|udhar|debt|रेखा|line|दिशा|direction|दाईं|दाएँ|right)/.test(s)) score++
  if (/(दाईं|दाएँ|right|बढ़|badh|increase|ज़्यादा|ज्यादा|more|बड़ा|bada|हट|remove)/.test(s)) score++
  if (/8|आठ|aath|eight/.test(s)) score++
  const tips = [
    { hi: 'कोशिश के लिए शाबाश! संख्या रेखा की दिशा या उधार की कहानी से समझाओ।', en: 'Well tried! Explain with direction on the number line or the udhaar story.' },
    { hi: 'अच्छी शुरुआत! अब बताओ कि −3 घटाने पर दाईं ओर क्यों जाते हैं।', en: 'Good start! Now say why subtracting −3 moves right.' },
    { hi: 'अच्छा कारण! बस यह भी लिखो कि उत्तर 8 कैसे आया।', en: 'Good reason! Just also write how you get 8.' },
    { hi: 'बहुत बढ़िया कारण: दिशा/उधार से समझाया और 8 तक पहुँचे।', en: 'Excellent reason: explained with direction/udhaar and reached 8.' },
  ]
  return { score, ...tips[score] }
}
