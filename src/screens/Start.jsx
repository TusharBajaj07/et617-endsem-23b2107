import { useState } from 'react'
import { AGENTS } from '../content'
import * as store from '../store'

// S1: no passwords (shared parent phone, low digital literacy) — just a first name.
export default function Start({ t, onStart, onTeacher }) {
  const [name, setName] = useState('')
  const learners = store.getLearners()

  return (
    <section className="sheet">
      <h1>{t({ hi: 'नमस्ते! चौपाल में आओ', en: 'Welcome to the chaupal!' })}</h1>
      <p className="muted">
        {t({
          hi: 'यहाँ तीन साथी तुम्हारे जवाब पर बात करते हैं, और फ़ैसला तुम करते हो। आज: ऋणात्मक संख्याओं का जोड़-घटाना।',
          en: 'Here three helpers discuss your answer, and you decide. Today: adding and subtracting negative numbers.',
        })}
      </p>
      <div className="agents-row">
        {Object.entries(AGENTS).map(([k, a]) => (
          <div key={k} className={'agent-pill ' + k}>
            <span>{a.icon}</span> {t(a.name)}
            <small>{t(a.role)}</small>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (name.trim()) onStart(name)
        }}
      >
        <label htmlFor="nm">{t({ hi: 'तुम्हारा नाम (सिर्फ़ पहला नाम)', en: 'Your name (first name only)' })}</label>
        <input id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder={t({ hi: 'जैसे: कविता', en: 'e.g. Kavita' })} maxLength={30} autoComplete="off" />
        <button className="primary" disabled={!name.trim()}>
          {t({ hi: 'शुरू करो', en: 'Start' })}
        </button>
      </form>

      {learners.length > 0 && (
        <>
          <p className="muted small">{t({ hi: 'इस फ़ोन पर पहले से:', en: 'Already on this phone:' })}</p>
          <div className="resume">
            {learners.map((l) => (
              <button key={l.id} onClick={() => onStart(l.name)}>
                ▶ {l.name}
              </button>
            ))}
          </div>
        </>
      )}

      <hr />
      <button className="ghost" onClick={onTeacher}>
        👩‍🏫 {t({ hi: 'शिक्षक के लिए', en: 'For teachers' })}
      </button>
    </section>
  )
}
