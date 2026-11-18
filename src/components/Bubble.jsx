import { AGENTS } from '../content'

const SRC = {
  ai: { hi: '🤖 AI', en: '🤖 AI' },
  checked: { hi: '✔ कोड से जाँचा', en: '✔ code-checked' },
  scripted: { hi: '📄 पहले से लिखा', en: '📄 scripted' },
}

// One agent message. Shows who is speaking, their role, and whether the text is AI or scripted.
export default function Bubble({ b, t }) {
  if (b.agent === 'you') {
    return <div className="bubble you">{b.text}</div>
  }
  if (b.agent === 'system') {
    return <div className="bubble system">{t(b.text)}</div>
  }
  const a = AGENTS[b.agent]
  return (
    <div className={'bubble ' + b.agent}>
      <div className="who">
        <span>{a.icon}</span> <strong>{t(a.name)}</strong> <small>· {t(a.role)}</small>
        {b.source && <em className={'src ' + b.source}>{t(SRC[b.source])}</em>}
      </div>
      {b.typing ? <div className="typing">{t({ hi: 'सोच रहा है', en: 'thinking' })}<span>…</span></div> : <div>{t(b.text)}</div>}
      {b.note && <div className="note">{t(b.note)}</div>}
    </div>
  )
}
