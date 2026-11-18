import { useState } from 'react'
import { CARDS, AGENTS } from '../content'
import NumberLine from '../components/NumberLine'
import Bubble from '../components/Bubble'
import * as store from '../store'
import { fmt, aiTurn, blackboard } from '../agents'

// Scripted fallback for "Explain it to me" on each card (used offline, on timeout, or if the AI reply fails checks).
const CARD_FALLBACK = {
  C1: { hi: '0 से बाईं ओर हर कदम एक ऋणात्मक संख्या है: −1, −2, −3। पैसों में −3 = दुकान का ₹3 उधार।', en: 'Each step left of 0 is a negative number: −1, −2, −3. In money, −3 = owing the shop ₹3.' },
  C2: { hi: 'जोड़ने में संख्या की दिशा में चलो: −4 जोड़ना = 4 कदम बाईं ओर। उधार में उधार जुड़े तो उधार बढ़ता है।', en: "When adding, move in the number's direction: adding −4 = 4 steps left. Udhaar added to udhaar grows." },
  C3: { hi: 'घटाने में उल्टी दिशा में चलो: −2 घटाना = 2 कदम दाईं ओर। उधार हटे तो हिसाब बढ़ता है।', en: 'When subtracting, move the opposite way: subtracting −2 = 2 steps right. Removing udhaar raises the account.' },
  C4: { hi: '"दो माइनस = प्लस" सिर्फ़ −(−) पर लगता है। +(−) में बाईं ओर चलते हैं।', en: '"Two minuses = plus" works only for −(−). With +(−) you move left.' },
}

const OFFLINE_AGAIN = {
  hi: 'अभी इंटरनेट से जुड़ नहीं पा रहा, इसलिए नई बात नहीं बता सकता। ऊपर की संख्या रेखा पर उदाहरण टैप करके देखो, या अगला कार्ड पढ़ो।',
  en: "I can't reach the internet right now, so I can't say more. Tap the examples on the number line above, or read the next card.",
}

// Card 4: Sawaal asks for a prediction before practice (checked later by Practice question 1).
const PREDICT = {
  ask: { hi: 'अभ्यास से पहले एक बात: −4 + (−3) का उत्तर धनात्मक होगा या ऋणात्मक? पहले अंदाज़ा लगाओ।', en: 'Before practice: will −4 + (−3) be positive or negative? Make a guess first.' },
  reply: { hi: 'ठीक है, तुम्हारा अंदाज़ा याद रखा! सवाल 1 में यही है, वहाँ जाँच लेना।', en: 'Okay, I noted your guess! Question 1 is exactly this, so you can check it there.' },
}

// S2: concept in 4 small cards (one idea per card), each with a number-line model.
// Agents here: Jaanch + Samjhao react to the card-1 tap check, Samjhao answers questions on every card (AI),
// Sawaal asks for a prediction on card 4.
export default function Learn({ t, session, updateSession, go }) {
  const i = Math.min(session.cardIdx || 0, CARDS.length - 1)
  const card = CARDS[i]
  const [ex, setEx] = useState(0)
  const [tap, setTap] = useState(null)
  const [chat, setChat] = useState([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const example = card.examples[ex]
  const predicted = session.prediction

  function move(d) {
    const n = i + d
    setEx(0)
    setTap(null)
    setChat([])
    setQuestion('')
    if (n >= CARDS.length) {
      store.logEvent('content_viewed', { target: 'cards_done' })
      go('S3')
      return
    }
    updateSession({ cardIdx: Math.max(0, n) })
    store.logEvent('content_viewed', { target: CARDS[Math.max(0, n)].id })
  }

  function checkTap(n) {
    setTap(n)
    const ok = n === card.check.target
    store.logEvent('answer_submitted', { target: card.id + '-check', value: String(n), correct: ok })
    setChat(
      ok
        ? [{ agent: 'jaanch', text: { hi: 'सही! −3 यानी 0 से 3 कदम बाईं ओर।', en: 'Right! −3 is 3 steps left of 0.' } }]
        : [
            { agent: 'jaanch', text: { hi: `${fmt(n)} नहीं, फिर से देखो।`, en: `Not ${fmt(n)}. Have another look.` } },
            {
              agent: 'samjhao',
              text: n > 0
                ? { hi: 'तुम 0 के दाईं ओर गए। ऋणात्मक संख्याएँ बाईं ओर होती हैं: 0 से 3 कदम बाईं ओर गिनो।', en: 'You went right of 0. Negative numbers are on the left: count 3 steps left from 0.' }
                : { hi: 'दिशा सही है, बाईं ओर! अब 0 से ठीक 3 कदम गिनो: −1, −2, …', en: 'Right direction, left! Now count exactly 3 steps from 0: −1, −2, …' },
            },
          ],
    )
  }

  async function ask() {
    const q = question.trim()
    if (!q || busy) return
    setBusy(true)
    setQuestion('')
    store.logEvent('ai_message_sent', { target: card.id, value: q, meta: { to: 'samjhao', screen: 'S2' } })
    const before = [...chat, { agent: 'you', text: q }]
    setChat([...before, { agent: 'samjhao', typing: true }])
    const conversation = chat
      .filter((b) => b.text && !b.typing)
      .map((b) => (b.agent === 'you' ? { agent: 'learner', text: b.text } : { agent: b.agent, name: AGENTS[b.agent]?.name, text: t(b.text) }))
    // Offline/AI failure: first the card's key idea; after that, say so plainly instead of repeating it.
    const asked = chat.filter((b) => b.agent === 'samjhao' && !b.typing).length
    const fallback = asked === 0 ? CARD_FALLBACK[card.id] : OFFLINE_AGAIN
    const out = await aiTurn(
      {
        agent: 'samjhao',
        task: { id: card.id, expr: `${card.title.en}: ${card.body.en}`, correct: null },
        verdict: 'not_attempted', attempt: 0, blackboard: blackboard(session.progress || {}),
        scripted: fallback, conversation, learnerQuestion: q,
      },
      fallback,
    )
    setChat([...before, { agent: 'samjhao', text: { hi: out.hi, en: out.en } }])
    store.logEvent('agent_message', { target: card.id, meta: { agent: 'samjhao', source: out.source, model: out.model || null, screen: 'S2' } })
    setBusy(false)
  }

  function predict(sign) {
    updateSession({ prediction: sign })
    store.logEvent('prediction', { target: 'T1', objective_id: 'LO1', value: sign })
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
          <NumberLine selected={tap} correct={tap === card.check.target ? tap : null} onTap={checkTap} />
        </>
      ) : (
        example && (
          <>
            <NumberLine start={example.start} move={example.move} correct={example.start + example.move} />
            <p className="say">{t(example.say)}</p>
          </>
        )
      )}

      {i === CARDS.length - 1 && (
        <div className="chat">
          <Bubble b={{ agent: 'sawaal', text: PREDICT.ask }} t={t} />
          {predicted ? (
            <>
              <div className="bubble you">
                {predicted === '+' ? t({ hi: '+ धनात्मक', en: '+ positive' }) : t({ hi: '− ऋणात्मक', en: '− negative' })}
              </div>
              <Bubble b={{ agent: 'sawaal', text: PREDICT.reply }} t={t} />
            </>
          ) : (
            <div className="seg">
              <button onClick={() => predict('+')}>+ {t({ hi: 'धनात्मक', en: 'positive' })}</button>
              <button onClick={() => predict('-')}>− {t({ hi: 'ऋणात्मक', en: 'negative' })}</button>
            </div>
          )}
        </div>
      )}

      <div className="chat" aria-live="polite">
        {chat.map((b, k) => (
          <Bubble key={k} b={b} t={t} />
        ))}
      </div>

      {!busy && (
        <div className="askbox">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            maxLength={200}
            placeholder={t({ hi: 'इस कार्ड में कुछ समझ नहीं आया? यहाँ लिखो…', en: "Didn't get something on this card? Type here…" })}
            aria-label="question for Samjhao"
          />
          <button className="ask-main" disabled={!question.trim()} onClick={ask}>
            🧭 {t({ hi: 'मुझे समझाओ', en: 'Explain it to me' })}
          </button>
        </div>
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
