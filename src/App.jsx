import { useEffect, useState } from 'react'
import './App.css'
import { ROLL, SCREENS } from './content'
import * as store from './store'
import Start from './screens/Start'
import Learn from './screens/Learn'
import Practice from './screens/Practice'
import TwoViews from './screens/TwoViews'
import Summary from './screens/Summary'
import Teacher from './screens/Teacher'

const freshSession = () => ({ screen: 'S2', cardIdx: 0, taskIdx: 0, order: [0, 1, 2, 3, 4, 5], progress: {} })

export default function App() {
  const [lang, setLang] = useState(() => store.read('gc_lang', 'hi'))
  const [screen, setScreen] = useState('S1')
  const [learner, setLearner] = useState(null)
  const [session, setSession] = useState(null)

  const t = (o) => (o && typeof o === 'object' ? (o[lang] ?? o.hi) : o)

  useEffect(() => {
    store.write('gc_lang', lang)
    document.documentElement.lang = lang
  }, [lang])
  useEffect(() => {
    store.logEvent('page_view', { target: screen })
    window.scrollTo(0, 0)
  }, [screen])

  function updateSession(patch) {
    setSession((s) => {
      const next = { ...s, ...(typeof patch === 'function' ? patch(s) : patch) }
      if (learner) store.saveSession(learner.id, next)
      return next
    })
  }

  function go(to) {
    setScreen(to)
    if (learner && to !== 'S6' && to !== 'S1') updateSession({ screen: to })
  }

  function startLearner(name) {
    const l = store.upsertLearner(name)
    store.setUser(l.id)
    const s = store.loadSession(l.id) || freshSession()
    store.saveSession(l.id, s)
    setLearner(l)
    setSession(s)
    store.logEvent('session_start', { meta: { resumed: Object.keys(s.progress || {}).length > 0, lang } })
    setScreen(s.screen || 'S2')
  }

  function exit() {
    store.logEvent('session_end', { target: screen })
    store.setUser('anon')
    setLearner(null)
    setSession(null)
    setScreen('S1')
  }

  const props = { t, lang, go, learner, session, updateSession }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">गणित चौपाल</div>
        <div className="token" title="Identity token">
          ID {ROLL} · {screen} {t(SCREENS[screen])}
        </div>
        <div className="top-actions">
          <button className="chip" onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')} aria-label="Language">
            {lang === 'hi' ? 'EN' : 'हिं'}
          </button>
          {(learner || screen === 'S6') && (
            <button className="chip" onClick={exit}>
              {t({ hi: '⏸ रुको', en: '⏸ Pause' })}
            </button>
          )}
        </div>
      </header>

      {learner && screen !== 'S6' && (
        <nav className="steps">
          {['S2', 'S3', 'S5'].map((s) => (
            <button key={s} className={screen === s || (s === 'S3' && screen === 'S4') ? 'on' : ''} onClick={() => go(s)}>
              {t(SCREENS[s])}
            </button>
          ))}
        </nav>
      )}

      <main className="main">
        {screen === 'S1' && <Start {...props} onStart={startLearner} onTeacher={() => setScreen('S6')} />}
        {screen === 'S2' && session && <Learn {...props} />}
        {screen === 'S3' && session && <Practice key={session.taskIdx + '-' + session.order.join('')} {...props} />}
        {screen === 'S4' && session && <TwoViews {...props} />}
        {screen === 'S5' && session && <Summary {...props} />}
        {screen === 'S6' && <Teacher {...props} />}
      </main>

      <footer className="foot">
        ET 617 · {ROLL} · {t({ hi: 'डेटा पहले फ़ोन पर, फिर इंटरनेट मिलने पर सेव होता है', en: 'Saved on the phone first, synced when online' })}
      </footer>
    </div>
  )
}
