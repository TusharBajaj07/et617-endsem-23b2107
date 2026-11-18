import { useEffect, useState } from 'react'
import { DISAGREE as D } from '../content'
import { mastery } from '../agents'
import * as store from '../store'
import * as sync from '../sync'

const PIN = '0617'

function download(name, text, type) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

// S6 (C5 teacher-in-the-loop): class progress, approve/override AI feedback, clickstream analytics.
export default function Teacher({ t }) {
  const [ok, setOk] = useState(false)
  const [pin, setPin] = useState('')
  const [tab, setTab] = useState('queue')
  const [, refresh] = useState(0)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const [remote, setRemote] = useState({ status: sync.enabled ? 'loading' : 'off', learners: [], events: null })

  async function pull() {
    if (!sync.enabled) return
    setRemote((r) => ({ ...r, status: 'loading' }))
    try {
      await sync.flush()
      const [reviews, learners, events] = await Promise.all([sync.fetchReviews(), sync.fetchLearners(), sync.fetchEvents()])
      store.mergeReviews(reviews)
      setRemote({ status: 'ok', learners, events: events.reverse(), at: new Date() })
    } catch {
      setRemote((r) => ({ ...r, status: 'error' }))
    }
  }

  useEffect(() => {
    if (ok) pull()
  }, [ok])

  if (!ok) {
    return (
      <section className="sheet">
        <h1 className="sign">{t({ hi: 'शिक्षक', en: 'Teacher' })}</h1>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault()
            if (pin === PIN) {
              setOk(true)
              store.logEvent('teacher_login')
            }
          }}
        >
          <label htmlFor="pin">{t({ hi: 'शिक्षक PIN डालो (डेमो: 0617)', en: 'Enter teacher PIN (demo: 0617)' })}</label>
          <input id="pin" className="num" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} />
          {pin.length === 4 && pin !== PIN && <p className="err">{t({ hi: 'PIN गलत है। डेमो PIN 0617 है।', en: 'Wrong PIN. The demo PIN is 0617.' })}</p>}
          <button className="primary">{t({ hi: 'खोलो', en: 'Open' })}</button>
        </form>
      </section>
    )
  }

  const reviews = store
    .getReviews()
    .sort((a, b) => (b.status === 'pending') - (a.status === 'pending') || String(b.ts).localeCompare(String(a.ts)))
  // class list: all devices (Supabase) + this phone
  const byId = new Map(remote.learners.map((l) => [l.id, { id: l.id, name: l.name, progress: l.progress, lastActive: l.last_active }]))
  store.getLearners().forEach((l) =>
    byId.set(l.id, { id: l.id, name: l.name, progress: store.loadSession(l.id)?.progress || byId.get(l.id)?.progress, lastActive: [l.lastActive, byId.get(l.id)?.lastActive].filter(Boolean).sort().pop() }),
  )
  const learners = [...byId.values()].sort((a, b) => String(b.lastActive || '').localeCompare(String(a.lastActive || '')))
  const nameOf = (id) => byId.get(id)?.name || (id === 'anon' ? t({ hi: 'कोई नहीं / टीचर', en: 'Not signed in / teacher' }) : id)
  // Local time and date, so the teacher reads IST, not UTC.
  const when = (ts) => {
    if (!ts) return '–'
    const d = new Date(ts)
    const sameDay = d.toDateString() === new Date().toDateString()
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + (sameDay ? '' : ' · ' + d.toLocaleDateString([], { day: 'numeric', month: 'short' }))
  }
  const EVENT_LABEL = {
    session_start: { hi: 'शुरू किया', en: 'started' }, session_end: { hi: 'बाहर गया', en: 'left' },
    session_pause: { hi: 'रुका', en: 'paused' }, session_resume: { hi: 'फिर शुरू', en: 'resumed' },
    page_view: { hi: 'स्क्रीन खोली', en: 'opened screen' }, content_viewed: { hi: 'कार्ड देखा', en: 'viewed card' },
    item_presented: { hi: 'सवाल देखा', en: 'saw question' }, answer_submitted: { hi: 'जवाब दिया', en: 'answered' },
    hint_requested: { hi: 'संकेत माँगा', en: 'asked for a hint' }, agent_message: { hi: 'एजेंट ने जवाब दिया', en: 'agent replied' },
    ai_message_sent: { hi: 'एजेंट से पूछा', en: 'asked an agent' }, disagreement_shown: { hi: 'दो राय दिखी', en: 'saw two views' },
    disagreement_choice: { hi: 'दो राय में चुना', en: 'chose in two views' }, teacher_review: { hi: 'टीचर ने फ़ैसला किया', en: 'teacher decided' },
    teacher_login: { hi: 'टीचर लॉगिन', en: 'teacher signed in' }, prediction: { hi: 'अंदाज़ा लगाया', en: 'made a prediction' },
    review_started: { hi: 'दोहराना शुरू', en: 'started review' }, restart: { hi: 'शुरू से', en: 'started over' },
  }
  const events = remote.events || store.getEvents()

  function decide(r, decision, message) {
    store.updateReview(r.id, { status: decision === 'override' ? 'overridden' : 'approved', decision, message }, r)
    sync.schedule(200)
    store.logEvent('teacher_review', { target: r.taskId, value: decision, meta: { review: r.id, learner: r.learnerId, kind: r.kind } })
    setEditing(null)
    setDraft('')
    refresh((n) => n + 1)
  }

  const choiceLabel = { test: { hi: 'परखा', en: 'Tested' }, continue: { hi: 'अपना कारण रखा', en: 'Kept own reason' }, ask: { hi: 'टीचर से पूछा', en: 'Asked teacher' } }
  const statusLabel = { pending: { hi: 'बाकी', en: 'Pending' }, approved: { hi: 'मंज़ूर', en: 'Approved' }, overridden: { hi: 'बदला', en: 'Overridden' }, 'auto-resolved': { hi: 'खुद सुलझा', en: 'Self-resolved' } }

  // analytics
  const answers = events.filter((e) => e.event_type === 'answer_submitted')
  const byLO = ['LO1', 'LO2', 'LO3'].map((lo) => {
    const a = answers.filter((e) => e.objective_id === lo)
    const c = a.filter((e) => e.correct === true).length
    return { lo, n: a.length, pct: a.length ? Math.round((100 * c) / a.length) : null }
  })
  const agentMsgs = events.filter((e) => e.event_type === 'agent_message')
  const aiShare = agentMsgs.length ? Math.round((100 * agentMsgs.filter((e) => e.meta?.source === 'ai').length) / agentMsgs.length) : null
  const counts = events.reduce((m, e) => ((m[e.event_type] = (m[e.event_type] || 0) + 1), m), {})

  return (
    <section className="sheet">
      <h1 className="sign">{t({ hi: 'शिक्षक की चौपाल', en: "Teacher's chaupal" })}</h1>
      <div className="syncbar">
        <span>
          {remote.status === 'ok' && t({ hi: `☁️ सभी फ़ोन का डेटा: ${learners.length} बच्चे, ${events.length} इवेंट`, en: `☁️ Data from all phones: ${learners.length} learners, ${events.length} events` })}
          {remote.status === 'loading' && t({ hi: '☁️ डेटा ला रहे हैं…', en: '☁️ Loading data…' })}
          {remote.status === 'error' && t({ hi: '📴 इंटरनेट नहीं मिला। सिर्फ़ इस फ़ोन का डेटा दिख रहा है।', en: '📴 No connection. Showing this phone only.' })}
          {remote.status === 'off' && t({ hi: 'सिर्फ़ इस फ़ोन का डेटा', en: 'This phone only' })}
        </span>
        {sync.enabled && (
          <button className="chip dark" onClick={pull}>
            {t({ hi: 'ताज़ा करो', en: 'Refresh' })}
          </button>
        )}
      </div>
      <div className="tabs">
        {[
          ['queue', { hi: `जाँच की कतार (${reviews.filter((r) => r.status === 'pending').length})`, en: `Review queue (${reviews.filter((r) => r.status === 'pending').length})` }],
          ['class', { hi: 'कक्षा', en: 'Class' }],
          ['data', { hi: 'डेटा', en: 'Data' }],
        ].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {t(l)}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <div className="stack">
          {reviews.length === 0 && <p className="muted">{t({ hi: 'अभी जाँचने को कुछ नहीं। जब कोई बच्चा दो राय वाला फ़ैसला करेगा या अपने शब्दों में लिखेगा, वह यहाँ आएगा।', en: 'Nothing to review yet. Items appear here when a learner decides in a two-views moment or writes an explanation.' })}</p>}
          {reviews.map((r) => (
            <article key={r.id} className={'review ' + r.status}>
              <header>
                <strong>{r.learnerName}</strong>
                <span>
                  {r.taskId} {r.kind === 'disagreement' ? t({ hi: 'दो राय', en: 'Two views' }) : t({ hi: 'अपने शब्दों में', en: 'Own words' })}
                </span>
                <em>{t(statusLabel[r.status])}</em>
              </header>

              {r.kind === 'disagreement' ? (
                <>
                  <p className="view jaanch">🔍 {t(r.jaanch)}</p>
                  <p className="view sawaal">❓ {t(r.sawaal)}</p>
                  <p>
                    {t({ hi: 'बच्चे का फ़ैसला:', en: "Learner's choice:" })} <strong>{t(choiceLabel[r.learnerChoice])}</strong>
                    {r.testResult && ` (${r.testResult === 'pass' ? t({ hi: 'जाँच सही, −7', en: 'check passed, −7' }) : t({ hi: 'जाँच गलत: "दो माइनस = प्लस" पक्का दिखा', en: 'check failed: "two minuses = plus" confirmed' })})`}
                  </p>
                </>
              ) : (
                <>
                  <p className="quote">“{r.learnerText}”</p>
                  <p className="view jaanch">
                    🔍 {t({ hi: 'जाँच', en: 'Jaanch' })} ({r.source === 'ai' ? 'AI' : t({ hi: 'नियम', en: 'rule-based' })}) · {r.score}/3: {t(r.ai)}
                  </p>
                </>
              )}

              {r.message && (
                <p className="sent">
                  👩‍🏫 {t({ hi: 'भेजा गया:', en: 'Sent:' })} {t(r.message)}
                </p>
              )}

              {editing === r.id ? (
                <div className="stack">
                  <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t({ hi: 'बच्चे के लिए अपना संदेश लिखो', en: 'Write your own message to the learner' })} />
                  <div className="actions">
                    <button className="ghost" onClick={() => setEditing(null)}>
                      {t({ hi: 'रद्द करो', en: 'Cancel' })}
                    </button>
                    <button className="primary" disabled={!draft.trim()} onClick={() => decide(r, 'override', { hi: draft.trim(), en: draft.trim() })}>
                      {t({ hi: 'संदेश भेजो', en: 'Send message' })}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="choices row-wrap">
                  {r.kind === 'disagreement' ? (
                    <>
                      <button className="ghost" onClick={() => decide(r, 'jaanch', D.teacherJ)}>
                        🔍 {t({ hi: 'जाँच सही', en: 'Jaanch is right' })}
                      </button>
                      <button className="ghost" onClick={() => decide(r, 'sawaal', D.teacherS)}>
                        ❓ {t({ hi: 'सवाल सही', en: 'Sawaal is right' })}
                      </button>
                    </>
                  ) : (
                    <button className="ghost" onClick={() => decide(r, 'approve-ai', r.ai)}>
                      👍 {t({ hi: 'AI की राय मंज़ूर', en: "Approve AI's feedback" })}
                    </button>
                  )}
                  <button
                    className="ghost"
                    onClick={() => {
                      setEditing(r.id)
                      setDraft('')
                    }}
                  >
                    ✍️ {t({ hi: 'बदलो, अपना लिखो', en: 'Override, write my own' })}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === 'class' && (
        <div className="scroll-x">
          <table className="grid">
            <thead>
              <tr>
                <th>{t({ hi: 'नाम', en: 'Name' })}</th>
                <th title="LO1">{t({ hi: 'जोड़-घटाना', en: 'Add/sub' })}</th>
                <th title="LO2">{t({ hi: 'कारण', en: 'Explain' })}</th>
                <th title="LO3">{t({ hi: 'तुलना', en: 'Compare' })}</th>
                <th>M1</th>
                <th>M2</th>
                <th>{t({ hi: 'आख़िरी बार', en: 'Last seen' })}</th>
              </tr>
            </thead>
            <tbody>
              {learners.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    {t({ hi: 'अभी कोई बच्चा नहीं।', en: 'No learners yet.' })}
                  </td>
                </tr>
              )}
              {learners.map((l) => {
                const m = mastery(l.progress)
                return (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{m.lo1}/4</td>
                    <td>{m.lo2 === 'yes' ? '✓' : m.lo2 === 'partial' ? '½' : m.lo2 === 'no' ? '✗' : '–'}</td>
                    <td>{m.lo3 === 'yes' ? '✓' : m.lo3 === 'no' ? '✗' : '–'}</td>
                    <td className={m.M1 ? 'warn' : ''}>{m.M1}</td>
                    <td className={m.M2 ? 'warn' : ''}>{m.M2}</td>
                    <td className="muted small">{when(l.lastActive)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="muted small">
            {t({
              hi: 'जोड़-घटाना = पहली कोशिश में सही (4 में से)। कारण/तुलना: ✓ पक्का, ½ सिर्फ़ शॉर्टकट, ✗ और अभ्यास चाहिए, – अभी नहीं किया। M1 = "घटाने से हमेशा छोटा", M2 = "दो माइनस = प्लस, हर जगह" (कितनी बार दिखा)।',
              en: 'Add/sub = right on the first try (out of 4). Explain/Compare: ✓ secure, ½ shortcut only, ✗ needs practice, – not done yet. M1 = "subtracting always makes it smaller", M2 = "two minuses = plus, everywhere" (times seen).',
            })}
          </p>
        </div>
      )}

      {tab === 'data' && (
        <div className="stack">
          <table className="ledger">
            <tbody>
              {byLO.map((r) => (
                <tr key={r.lo}>
                  <td>
                    {r.lo} {t({ hi: 'सही जवाब', en: 'correct answers' })}
                  </td>
                  <td>{r.pct == null ? '–' : `${r.pct}% (${r.n})`}</td>
                </tr>
              ))}
              <tr>
                <td>{t({ hi: 'संकेत माँगे', en: 'Hints requested' })}</td>
                <td>{counts.hint_requested || 0}</td>
              </tr>
              <tr>
                <td>{t({ hi: 'एजेंट संदेश जो AI से आए', en: 'Agent messages from AI' })}</td>
                <td>{aiShare == null ? '–' : `${aiShare}% (${agentMsgs.length})`}</td>
              </tr>
              <tr>
                <td>{t({ hi: 'दो राय वाले पल', en: 'Two-views moments' })}</td>
                <td>{counts.disagreement_shown || 0}</td>
              </tr>
              <tr>
                <td>{t({ hi: 'कुल इवेंट', en: 'Total events' })}</td>
                <td>{events.length}</td>
              </tr>
            </tbody>
          </table>
          <div className="actions">
            <button className="ghost" onClick={() => download('ganit-chaupal-events.csv', store.exportCSV(), 'text/csv')}>
              {t({ hi: 'CSV डाउनलोड', en: 'Download CSV' })}
            </button>
            <button className="ghost" onClick={() => download('ganit-chaupal-events.json', JSON.stringify(events, null, 1), 'application/json')}>
              {t({ hi: 'JSON डाउनलोड', en: 'Download JSON' })}
            </button>
          </div>
          <h3>{t({ hi: 'हाल की गतिविधि', en: 'Recent activity' })}</h3>
          <ol className="log">
            {events
              .slice(-12)
              .reverse()
              .map((e, i) => (
                <li key={i}>
                  <time>{when(e.ts)}</time> <strong>{nameOf(e.user_id)}</strong> {EVENT_LABEL[e.event_type] ? t(EVENT_LABEL[e.event_type]) : e.event_type}{' '}
                  {e.target || ''} {e.correct === true ? '✓' : e.correct === false ? '✗' : ''}
                </li>
              ))}
          </ol>
        </div>
      )}
    </section>
  )
}
