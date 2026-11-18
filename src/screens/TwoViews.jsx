import { useEffect, useState } from 'react'
import { DISAGREE as D, AGENTS } from '../content'
import { blackboard, aiTurn } from '../agents'
import * as store from '../store'
import NumberLine from '../components/NumberLine'
import Bubble from '../components/Bubble'

// S4: the disagreement moment. Jaanch accepts the shortcut, Sawaal challenges it.
// Correctness is not debated; the learner decides what to do (test / continue / ask teacher).
export default function TwoViews({ t, session, updateSession, go, learner }) {
  const p5 = session.progress.T5 || {}
  const bb = blackboard(session.progress)
  // Sawaal reads the blackboard: did "two minuses = plus" already go wrong earlier?
  const prior = bb.history.find((h) => h.task !== 'T5' && h.tags.includes('M2'))
  const [stage, setStage] = useState(p5.resolution ? 'done' : 'choose')
  const [tap, setTap] = useState(null)
  const [after, setAfter] = useState([])

  useEffect(() => {
    store.logEvent('disagreement_shown', { target: 'T5', objective_id: 'LO2', meta: { priorM2: prior?.task || null } })
  }, [prior?.task])

  // Live debate: Jaanch (AI) judges the shortcut reason, then Sawaal (AI) reads Jaanch's message and responds.
  const [intro, setIntro] = useState([{ agent: 'jaanch', typing: true }])
  useEffect(() => {
    let alive = true
    ;(async () => {
      const ctx = {
        task: { id: 'T5', expr: '5 − (−3) = 8', correct: 8 }, verdict: 'correct', tag: 'shortcut', attempt: 1,
        learnerAnswer: 'B: "two minuses together make a plus: −(−3) = +3, so 5 + 3 = 8"', blackboard: bb,
      }
      const j = await aiTurn({ ...ctx, agent: 'jaanch', scripted: D.jaanch.text, conversation: [] }, D.jaanch.text)
      if (!alive) return
      setIntro([{ agent: 'jaanch', text: { hi: j.hi, en: j.en } }, { agent: 'sawaal', typing: true }])
      const convo = [{ agent: 'jaanch', name: AGENTS.jaanch.name, text: j.en }]
      const q = await aiTurn(
        { ...ctx, agent: 'sawaal', scripted: D.sawaal.text, conversation: convo, learnerQuestion: undefined, debate: true },
        D.sawaal.text,
      )
      if (!alive) return
      const hist = prior ? [D.sawaalHistory(prior.no)] : []
      setIntro([
        { agent: 'jaanch', text: { hi: j.hi, en: j.en } },
        { agent: 'sawaal', text: { hi: q.hi, en: q.en }, note: { hi: '🤝 जाँच से अलग राय', en: '🤝 Disagrees with Jaanch' } },
        ...hist,
      ])
      store.logEvent('agent_message', { target: 'T5', objective_id: 'LO2', meta: { agent: 'jaanch', source: j.source } })
      store.logEvent('agent_message', { target: 'T5', objective_id: 'LO2', meta: { agent: 'sawaal', source: q.source, stance: q.stance || null } })
    })()
    return () => {
      alive = false
    }
  }, [])

  function resolve(choice, extra = {}) {
    store.logEvent('disagreement_choice', { target: 'T5', objective_id: 'LO2', value: choice, meta: extra })
    const pass = extra.result === 'pass'
    store.addReview({
      kind: 'disagreement', learnerId: learner.id, learnerName: learner.name, taskId: 'T5',
      learnerChoice: choice, testResult: extra.result || null, jaanch: D.jaanch.text, sawaal: D.sawaal.text,
      status: choice === 'test' && pass ? 'auto-resolved' : 'pending',
    })
    const resolution = choice === 'test' ? (pass ? 'test-pass' : 'test-fail') : choice
    updateSession((s) => {
      const p = s.progress.T5 || {}
      const tags = extra.result === 'fail' ? [...(p.tags || []), 'M2'] : p.tags || []
      return { progress: { ...s.progress, T5: { ...p, resolution, tags } } }
    })
    setStage('done')
  }

  function pick(choice) {
    if (choice === 'test') {
      store.logEvent('disagreement_choice', { target: 'T5', objective_id: 'LO2', value: 'test-start' })
      setStage('test')
      return
    }
    setAfter([{ agent: 'system', text: choice === 'continue' ? D.continueMsg : D.askMsg }])
    resolve(choice)
  }

  function checkTest() {
    const pass = tap === D.test.correct
    store.logEvent('answer_submitted', { target: 'T5-check', objective_id: 'LO2', value: String(tap), correct: pass, meta: { tag: pass ? 'correct' : tap === 7 ? 'M2' : 'other' } })
    setAfter((pass ? D.testRight : D.testWrong).map((l) => ({ ...l, source: l.agent === 'jaanch' ? 'checked' : 'scripted' })))
    resolve('test', { result: pass ? 'pass' : 'fail', value: tap })
  }

  return (
    <section className="sheet">
      <div className="task-head">
        <span className="count">{t({ hi: 'सवाल 5 पर बहस', en: 'Debate on question 5' })}</span>
        <span className="fmt">5 − (−3) = 8</span>
      </div>

      <div className="chat">
        {intro.map((b, i) => (
          <Bubble key={i} b={b} t={t} />
        ))}
      </div>

      {!intro.some((b) => b.typing) && (
      <div className="debate">
        <h2>{t(D.title)}</h2>
        <div className="views">
          <div className="view jaanch">{t(D.viewJ)}</div>
          <div className="view sawaal">{t(D.viewS)}</div>
        </div>
        <p className="note">{t(D.note)}</p>
        {stage === 'choose' && (
          <div className="choices">
            <button className="primary" onClick={() => pick('test')}>
              {t(D.choices.test)}
            </button>
            <button className="ghost" onClick={() => pick('continue')}>
              {t(D.choices.continue)}
            </button>
            <button className="ghost" onClick={() => pick('ask')}>
              {t(D.choices.ask)}
            </button>
          </div>
        )}
      </div>
      )}

      {stage === 'test' && (
        <div className="stack">
          <div className="expr">{D.test.expr}</div>
          <p className="prompt">{t({ hi: 'जवाब संख्या रेखा पर टैप करो।', en: 'Tap the answer on the number line.' })}</p>
          <NumberLine start={D.test.start} selected={tap} onTap={setTap} />
          <button className="primary wide" disabled={tap == null} onClick={checkTest}>
            {t({ hi: 'जाँचो', en: 'Check' })}
          </button>
        </div>
      )}

      {after.length > 0 && (
        <div className="chat">
          {after.map((b, i) => (
            <Bubble key={i} b={b} t={t} />
          ))}
        </div>
      )}

      {stage === 'done' && (
        <button className="primary wide" onClick={() => go('S3')}>
          {t({ hi: 'सवाल 5 पर लौटो', en: 'Back to question 5' })}
        </button>
      )}
    </section>
  )
}
