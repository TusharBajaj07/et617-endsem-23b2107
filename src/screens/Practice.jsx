import { useEffect, useRef, useState } from 'react'
import { TASKS, AGENTS } from '../content'
import { check, blackboard, aiTurn, rubricFallback, parseNum, fmt } from '../agents'
import * as store from '../store'
import NumberLine from '../components/NumberLine'
import Bubble from '../components/Bubble'

// S3: core loop. Attempt → code check → Jaanch's verdict → Samjhao or Sawaal (AI, with scripted fallback) → retry or next.
export default function Practice({ t, session, updateSession, go, learner }) {
  const idx = session.taskIdx
  const task = TASKS[session.order[idx]] || TASKS[0]
  const prog0 = session.progress[task.id] || { attempts: 0, tags: [] }
  const startPhase = prog0.done ? (task.type === 'reason' && !prog0.explained ? 'explain' : 'done') : 'answer'

  const [phase, setPhase] = useState(startPhase)
  const [bubbles, setBubbles] = useState(() =>
    prog0.resolution ? [{ agent: 'system', text: { hi: '🤝 दो राय वाली बातचीत पूरी हुई।', en: '🤝 The two-views discussion is done.' } }] : [],
  )
  const [busy, setBusy] = useState(false)
  const [sel, setSel] = useState(null)
  const [sign, setSign] = useState(null)
  const [num, setNum] = useState('')
  const [neg, setNeg] = useState(false)
  const [hint, setHint] = useState(0)
  const [text, setText] = useState('')
  const [reveal, setReveal] = useState(!!prog0.done)
  const shownAt = useRef(0)
  const progRef = useRef(prog0)

  useEffect(() => {
    shownAt.current = Date.now()
    store.logEvent('item_presented', { target: task.id, objective_id: task.lo })
  }, [task.id, task.lo])

  const push = (b) => setBubbles((xs) => [...xs, b])
  const replaceLast = (b) => setBubbles((xs) => [...xs.slice(0, -1), b])
  const modelLine = () => ({ agent: 'jaanch', source: 'checked', text: { hi: 'सही उत्तर: ' + task.model.hi, en: 'Correct answer: ' + task.model.en } })

  function saveProg(p) {
    progRef.current = p
    updateSession((s) => ({ progress: { ...s.progress, [task.id]: p } }))
  }

  // Every agent is an AI call that sees the conversation so far (the blackboard + other agents' messages).
  // Code has already decided correctness; the scripted line is only the fallback.
  const convo = useRef([])
  const lastCtx = useRef(null)

  async function speak(agent, ctx, fallback, extra = {}) {
    push({ agent, typing: true })
    const out = await aiTurn({ ...ctx, agent, scripted: fallback, conversation: convo.current, ...extra }, fallback)
    const prev = convo.current[convo.current.length - 1]
    const disagrees = out.source === 'ai' && out.stance === 'disagree' && prev && prev.agent !== 'learner'
    replaceLast({
      agent, text: { hi: out.hi, en: out.en },
      note: disagrees ? { hi: `🤝 ${prev.name.hi} से अलग राय`, en: `🤝 Disagrees with ${prev.name.en}` } : null,
    })
    convo.current = [...convo.current, { agent, name: AGENTS[agent].name, text: out.en }]
    store.logEvent('agent_message', { target: task.id, objective_id: task.lo, meta: { agent, source: out.source, stance: out.stance || null, model: out.model || null } })
    return out
  }

  async function say(lines, ctx) {
    lastCtx.current = ctx
    convo.current = []
    for (const line of lines) await speak(line.agent, ctx, line.text)
  }

  const [question, setQuestion] = useState('')
  async function ask(agent) {
    const q = question.trim()
    if (!q || busy) return
    setBusy(true)
    setQuestion('')
    push({ agent: 'you', text: q })
    convo.current = [...convo.current, { agent: 'learner', name: { hi: 'बच्चा', en: 'Learner' }, text: q }]
    store.logEvent('ai_message_sent', { target: task.id, objective_id: task.lo, value: q, meta: { to: agent } })
    const ctx = lastCtx.current || {
      task: { id: task.id, expr: task.expr || t(task.prompt), correct: task.correct },
      verdict: 'not_attempted', attempt: 0, blackboard: blackboard(session.progress),
    }
    const fallback = agent === 'samjhao' ? task.hints[0] : { hi: 'अच्छा सवाल! पहले खुद सोचो: दाईं ओर जाना है या बाईं ओर?', en: 'Good question! First think: right or left?' }
    await speak(agent, ctx, fallback, { learnerQuestion: q })
    setBusy(false)
  }

  function buildAnswer() {
    if (task.options) return sel ? { option: sel } : null
    if (task.type === 'line') return sel == null ? null : { value: sel }
    const v = parseNum(num)
    if (v == null) return null
    if (task.type === 'sign') return sign ? { sign, value: Math.abs(v) } : null
    return { value: neg && v > 0 ? -v : v }
  }

  async function submit() {
    const ans = buildAnswer()
    if (!ans || busy) return
    const p = progRef.current
    const res = check(task, ans)
    const attempt = (p.attempts || 0) + 1
    const firstCorrect = attempt === 1 ? res.correct === true : !!p.firstCorrect
    store.logEvent('answer_submitted', {
      target: task.id, objective_id: task.lo, value: String(res.value), correct: res.correct,
      duration_ms: Date.now() - shownAt.current, meta: { tag: res.tag, attempt, hints: hint },
    })

    if (res.tag === 'shortcut') {
      // Jaanch accepts the shortcut, Sawaal objects: the disagreement moment (S4)
      saveProg({ ...p, attempts: attempt, tags: [...p.tags, 'shortcut'], firstCorrect: false, done: true, shortcut: true })
      go('S4')
      return
    }

    const done = res.correct === true || attempt >= 2
    const np = { ...p, attempts: attempt, tags: [...p.tags, res.tag], firstCorrect, done }
    saveProg(np)
    setBusy(true)
    setBubbles([])
    const lines = task.feedback[res.tag] || task.feedback.other
    await say(lines, {
      task: { id: task.id, expr: task.expr || t(task.prompt), correct: task.correct },
      verdict: res.correct ? 'correct' : 'wrong', tag: res.tag, attempt, learnerAnswer: res.value,
      blackboard: blackboard({ ...session.progress, [task.id]: np }),
    })
    if (!res.correct && attempt >= 2) {
      push(modelLine())
      setReveal(true)
    } else if (!res.correct) {
      push({ agent: 'system', text: { hi: '🔁 एक मौका और है। फिर से करो।', en: '🔁 One more chance. Try again.' } })
    } else setReveal(true)
    if (done) setPhase(task.type === 'reason' ? 'explain' : 'done')
    setSel(null)
    setSign(null)
    setNum('')
    setNeg(false)
    setBusy(false)
  }

  function askHint() {
    const lvl = hint + 1
    setHint(lvl)
    store.logEvent('hint_requested', { target: task.id, objective_id: task.lo, meta: { level: lvl } })
    if (lvl <= task.hints.length) {
      push({ agent: 'samjhao', text: task.hints[lvl - 1], source: 'scripted', note: { hi: `संकेत ${lvl} / 3`, en: `Hint ${lvl} / 3` } })
      return
    }
    push(modelLine())
    setReveal(true)
    const p = progRef.current
    saveProg({ ...p, done: true, firstCorrect: p.attempts ? !!p.firstCorrect : false, revealed: true })
    setPhase(task.type === 'reason' ? 'explain' : 'done')
  }

  async function submitExplain() {
    const txt = text.trim()
    if (!txt || busy) return
    setBusy(true)
    push({ agent: 'you', text: txt })
    push({ agent: 'jaanch', typing: true })
    const fb = rubricFallback(txt)
    const out = await aiTurn({ agent: 'jaanch_rubric', task: { id: task.id, expr: task.expr, correct: 8 }, learnerText: txt, blackboard: blackboard(session.progress) }, fb)
    const score = out.source === 'ai' && Number.isInteger(out.score) ? out.score : fb.score
    replaceLast({
      agent: 'jaanch', source: out.source,
      text: { hi: `${out.hi} (स्कोर ${score}/3)`, en: `${out.en} (score ${score}/3)` },
      note: { hi: '👩‍🏫 यह राय टीचर देखेंगी और बदल सकती हैं।', en: '👩‍🏫 Your teacher will review this and may change it.' },
    })
    store.addReview({ kind: 'freetext', learnerId: learner.id, learnerName: learner.name, taskId: task.id, learnerText: txt, score, ai: { hi: out.hi, en: out.en }, source: out.source })
    store.logEvent('ai_message_sent', { target: task.id, objective_id: task.lo, value: txt, meta: { agent: 'jaanch', rubric: score, source: out.source } })
    saveProg({ ...progRef.current, explained: true, rubric: score })
    setBusy(false)
    setPhase('done')
  }

  function next() {
    if (idx + 1 < session.order.length) updateSession({ taskIdx: idx + 1 })
    else go('S5')
  }

  const last = idx + 1 >= session.order.length
  const typed = parseNum(num)

  return (
    <section className="sheet">
      <div className="task-head">
        <span className="count">
          {t({ hi: 'सवाल', en: 'Question' })} {idx + 1} / {session.order.length}
        </span>
        <span className="fmt">{t(task.format)}</span>
      </div>
      {task.expr && <div className="expr">{task.expr}</div>}
      <p className="prompt">{t(task.prompt)}</p>

      {task.type === 'line' && (
        <NumberLine
          start={task.start}
          selected={sel}
          move={reveal ? task.move : null}
          correct={reveal ? task.correct : null}
          onTap={phase === 'answer' && !busy ? setSel : null}
        />
      )}

      {task.type === 'sign' && (
        <div className="stack">
          <div className="field">
            <span className="lbl">{t({ hi: 'पहले चिह्न चुनो', en: 'First pick the sign' })}</span>
            <div className="seg">
              <button className={sign === '+' ? 'on' : ''} disabled={phase !== 'answer'} onClick={() => setSign('+')}>
                + {t({ hi: 'धनात्मक', en: 'positive' })}
              </button>
              <button className={sign === '-' ? 'on' : ''} disabled={phase !== 'answer'} onClick={() => setSign('-')}>
                − {t({ hi: 'ऋणात्मक', en: 'negative' })}
              </button>
            </div>
          </div>
          <div className="field">
            <span className="lbl">{t({ hi: 'फिर संख्या लिखो', en: 'Then type the number' })}</span>
            <input className="num" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value)} disabled={phase !== 'answer' || !sign} placeholder="?" maxLength={4} aria-label="number" />
          </div>
        </div>
      )}

      {task.type === 'story' && (
        <div className="field">
          <span className="lbl">{t({ hi: 'उधार है तो − दबाओ, फिर संख्या लिखो', en: 'If it is owed, tap −, then type the number' })}</span>
          <div className="seg">
            <button className={'sq ' + (neg ? 'on' : '')} disabled={phase !== 'answer'} onClick={() => setNeg(!neg)} aria-label="minus sign">
              −
            </button>
            <input className="num" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value)} disabled={phase !== 'answer'} placeholder="?" maxLength={5} aria-label="number" />
            {typed != null && <span className="preview">{fmt(neg && typed > 0 ? -typed : typed)}</span>}
          </div>
        </div>
      )}

      {task.options && (
        <div className="options">
          {task.options.map((o) => (
            <button key={o.id} className={'opt ' + (sel === o.id ? 'on' : '')} disabled={phase !== 'answer' || busy} onClick={() => setSel(o.id)}>
              <b>{o.id}</b>
              <span>{t(o.label)}</span>
            </button>
          ))}
        </div>
      )}

      {reveal && task.type !== 'line' && task.start != null && <NumberLine start={task.start} move={task.move} correct={task.correct} />}

      <div className="chat" aria-live="polite">
        {bubbles.map((b, i) => (
          <Bubble key={i} b={b} t={t} />
        ))}
      </div>

      {!busy && (
        <div className="askbox">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} placeholder={t({ hi: 'कुछ पूछना है? यहाँ लिखो…', en: 'Want to ask something? Type here…' })} aria-label="question for agents" />
          <div className="actions">
            <button className="ghost" disabled={!question.trim()} onClick={() => ask('samjhao')}>
              🧭 {t({ hi: 'समझाओ से पूछो', en: 'Ask Samjhao' })}
            </button>
            <button className="ghost" disabled={!question.trim()} onClick={() => ask('sawaal')}>
              ❓ {t({ hi: 'सवाल से पूछो', en: 'Ask Sawaal' })}
            </button>
          </div>
        </div>
      )}

      {phase === 'answer' && (
        <div className="actions">
          <button className="ghost" onClick={askHint} disabled={busy}>
            {hint < 2 ? t({ hi: '💡 संकेत लो', en: '💡 Get a hint' }) : t({ hi: 'उत्तर दिखाओ', en: 'Show the answer' })}
          </button>
          <button className="primary" onClick={submit} disabled={busy || !buildAnswer()}>
            {busy ? t({ hi: 'जाँच हो रही है…', en: 'Checking…' }) : t({ hi: 'जाँचो', en: 'Check' })}
          </button>
        </div>
      )}

      {phase === 'explain' && !busy && (
        <div className="stack">
          <p className="prompt">{t(task.explainPrompt)}</p>
          <textarea rows={3} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder={t({ hi: 'जैसे: उधार हटने से…', en: 'e.g. Removing udhaar…' })} />
          <div className="actions">
            <button
              className="ghost"
              onClick={() => {
                saveProg({ ...progRef.current, explained: true })
                setPhase('done')
              }}
            >
              {t({ hi: 'अभी नहीं', en: 'Not now' })}
            </button>
            <button className="primary" onClick={submitExplain} disabled={!text.trim()}>
              {t({ hi: 'जाँच को भेजो', en: 'Send to Jaanch' })}
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && !busy && (
        <button className="primary wide" onClick={next}>
          {last ? t({ hi: 'मेरी प्रगति देखो', en: 'See my progress' }) : t({ hi: 'अगला सवाल', en: 'Next question' })}
        </button>
      )}
    </section>
  )
}
