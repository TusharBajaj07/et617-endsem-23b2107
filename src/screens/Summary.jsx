import { TASKS } from '../content'
import { mastery } from '../agents'
import * as store from '../store'

const LO2 = { yes: { hi: 'पक्का', en: 'Secure' }, partial: { hi: 'शॉर्टकट से, समझ अधूरी', en: 'Shortcut only, not yet explained' }, no: { hi: 'और अभ्यास चाहिए', en: 'Needs practice' }, '-': { hi: 'अभी बाकी', en: 'Not done yet' } }
const LO3 = { yes: LO2.yes, no: LO2.no, '-': LO2['-'] }

// S5: progress shown as competence per learning outcome, plus misconceptions and teacher messages.
export default function Summary({ t, session, updateSession, go, learner }) {
  const p = session.progress
  const m = mastery(p)
  const reviews = store.getReviews().filter((r) => r.learnerId === learner.id)
  const msgs = reviews.filter((r) => r.message)
  const pending = reviews.filter((r) => r.status === 'pending').length
  const missed = TASKS.map((x, i) => i).filter((i) => {
    const q = p[TASKS[i].id]
    if (!q?.done || q.firstCorrect) return false
    return !(TASKS[i].id === 'T5' && m.lo2 === 'yes')
  })

  function review() {
    store.logEvent('review_started', { value: missed.map((i) => TASKS[i].id).join(',') })
    updateSession((s) => {
      const prog = { ...s.progress }
      missed.forEach((i) => (prog[TASKS[i].id] = { attempts: 0, tags: [], review: true }))
      return { progress: prog, order: missed, taskIdx: 0 }
    })
    go('S3')
  }

  function restart() {
    store.logEvent('restart')
    updateSession({ progress: {}, order: [0, 1, 2, 3, 4, 5], taskIdx: 0, cardIdx: 0 })
    go('S2')
  }

  const rows = [
    { lo: 'LO1', name: { hi: 'जोड़-घटाना करना', en: 'Add and subtract' }, val: `${m.lo1} / 4`, good: m.lo1 >= 3 },
    { lo: 'LO2', name: { hi: 'कारण समझाना', en: 'Explain why' }, val: t(LO2[m.lo2]), good: m.lo2 === 'yes' },
    { lo: 'LO3', name: { hi: 'दो हल की तुलना', en: 'Compare solutions' }, val: t(LO3[m.lo3]), good: m.lo3 === 'yes' },
  ]

  return (
    <section className="sheet">
      <h1 className="sign">{t({ hi: 'आज की चौपाल', en: "Today's chaupal" })}</h1>
      <p className="muted">
        {learner.name}, {t({ hi: 'यह रहा तुम्हारा हिसाब।', en: "here's your account." })}
      </p>

      <table className="ledger">
        <tbody>
          {rows.map((r) => (
            <tr key={r.lo} className={r.good ? 'good' : ''}>
              <td>{t(r.name)}</td>
              <td>{r.val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{t({ hi: 'गलतफ़हमियाँ', en: 'Misconceptions' })}</h3>
      {m.M1 + m.M2 === 0 ? (
        <p className="muted">{t({ hi: 'आज कोई गलतफ़हमी नहीं दिखी।', en: 'No misconceptions showed up today.' })}</p>
      ) : (
        <ul className="plain">
          {m.M1 > 0 && <li>{t({ hi: `"घटाने से हमेशा छोटा": ${m.M1} बार`, en: `"Subtracting always makes it smaller": ${m.M1}×` })}</li>}
          {m.M2 > 0 && <li>{t({ hi: `"दो माइनस = प्लस, हर जगह": ${m.M2} बार`, en: `"Two minuses = plus, everywhere": ${m.M2}×` })}</li>}
        </ul>
      )}

      <h3>{t({ hi: 'टीचर का संदेश', en: "Teacher's messages" })}</h3>
      {msgs.length === 0 ? (
        <p className="muted">
          {pending > 0
            ? t({ hi: `${pending} बात टीचर के पास है। अगली बार उनका जवाब यहाँ मिलेगा।`, en: `${pending} item(s) are with your teacher. Their reply will appear here next time.` })
            : t({ hi: 'अभी कोई संदेश नहीं।', en: 'No messages yet.' })}
        </p>
      ) : (
        msgs.map((r) => (
          <div key={r.id} className="bubble teacher">
            <div className="who">
              👩‍🏫 <strong>{t({ hi: 'टीचर', en: 'Teacher' })}</strong>
            </div>
            {t(r.message)}
          </div>
        ))
      )}

      <div className="stack">
        {missed.length > 0 && (
          <button className="primary wide" onClick={review}>
            {t({ hi: `गलत हुए ${missed.length} सवाल दोहराओ`, en: `Redo the ${missed.length} missed question(s)` })}
          </button>
        )}
        <button className="ghost wide" onClick={() => go('S2')}>
          {t({ hi: 'कार्ड फिर से देखो', en: 'See the cards again' })}
        </button>
        <button className="ghost wide" onClick={restart}>
          {t({ hi: 'शुरू से करो', en: 'Start over' })}
        </button>
      </div>
    </section>
  )
}
