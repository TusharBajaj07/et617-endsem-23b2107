import { useState } from 'react'
import { CARDS } from '../content'
import NumberLine from '../components/NumberLine'
import * as store from '../store'
import { fmt } from '../agents'

// S2: concept in 4 small cards (one idea per card), each with a number-line model.
export default function Learn({ t, session, updateSession, go }) {
  const i = Math.min(session.cardIdx || 0, CARDS.length - 1)
  const card = CARDS[i]
  const [ex, setEx] = useState(0)
  const [tap, setTap] = useState(null)
  const example = card.examples[ex]

  function move(d) {
    const n = i + d
    setEx(0)
    setTap(null)
    if (n >= CARDS.length) {
      store.logEvent('content_viewed', { target: 'cards_done' })
      go('S3')
      return
    }
    updateSession({ cardIdx: Math.max(0, n) })
    store.logEvent('content_viewed', { target: CARDS[Math.max(0, n)].id })
  }

  return (
    <section className="sheet">
      <div className="muted small">
        {t({ hi: 'कार्ड', en: 'Card' })} {i + 1}/{CARDS.length}
      </div>
      <h2>{t(card.title)}</h2>
      <p className="body">{t(card.body)}</p>

      {card.examples.length > 0 && (
        <div className="examples">
          {card.examples.map((e, k) => (
            <button key={k} className={k === ex ? 'on' : ''} onClick={() => setEx(k)}>
              {e.label}
            </button>
          ))}
        </div>
      )}

      {card.check ? (
        <>
          <p className="strong">{t(card.check.prompt)}</p>
          <NumberLine selected={tap} correct={tap === card.check.target ? tap : null} onTap={(n) => setTap(n)} />
          {tap != null && (
            <div className={'bubble ' + (tap === card.check.target ? 'jaanch' : 'samjhao')}>
              {tap === card.check.target
                ? t({ hi: '✅ सही! −3 यानी 0 से 3 कदम बाईं ओर।', en: '✅ Right! −3 is 3 steps left of 0.' })
                : t({ hi: `🧭 तुमने ${fmt(tap)} चुना। −3 शून्य के बाईं ओर है: 0 से 3 कदम बाईं ओर गिनो।`, en: `🧭 You chose ${fmt(tap)}. −3 is left of zero: count 3 steps left from 0.` })}
            </div>
          )}
        </>
      ) : (
        example && (
          <>
            <NumberLine start={example.start} move={example.move} correct={example.start + example.move} />
            <p className="say">{t(example.say)}</p>
          </>
        )
      )}

      <div className="row">
        <button className="ghost" onClick={() => move(-1)} disabled={i === 0}>
          ← {t({ hi: 'पीछे', en: 'Back' })}
        </button>
        <button className="primary" onClick={() => move(1)}>
          {i === CARDS.length - 1 ? t({ hi: 'अभ्यास शुरू करो', en: 'Start practice' }) : t({ hi: 'आगे', en: 'Next' })}
        </button>
      </div>
    </section>
  )
}
