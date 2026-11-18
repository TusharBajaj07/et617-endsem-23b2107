import { useEffect, useRef } from 'react'
import { fmt } from '../agents'

const MIN = -10
const MAX = 10
const CELL = 44 // ≥44px tap targets for small phones

// Scrollable number line from −10 to 10. Optional arrow shows a move (start → start+move).
export default function NumberLine({ start = null, move = null, selected = null, correct = null, onTap, disabled = false }) {
  const ref = useRef(null)
  const nums = []
  for (let n = MIN; n <= MAX; n++) nums.push(n)
  const focus = selected ?? start ?? 0

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollLeft = (focus - MIN) * CELL + CELL / 2 - el.clientWidth / 2
  }, [focus])

  const end = start != null && move != null ? start + move : null
  const arrow =
    end != null
      ? { left: (Math.min(start, end) - MIN) * CELL + CELL / 2, width: Math.abs(move) * CELL, dir: move < 0 ? 'left' : 'right' }
      : null

  return (
    <div className="nl" ref={ref}>
      <div className="nl-track" style={{ width: nums.length * CELL }}>
        {arrow && (
          <div key={`${start}${move}`} className={'nl-arrow ' + arrow.dir} style={{ left: arrow.left, width: arrow.width }}>
            <span>{move > 0 ? '+' + move : fmt(move)}</span>
          </div>
        )}
        <div className="nl-line" />
        {nums.map((n) => {
          const cls = ['nl-tick']
          if (n === 0) cls.push('zero')
          if (n === start) cls.push('start')
          if (n === selected) cls.push('sel')
          if (n === correct) cls.push('ok')
          return (
            <button
              key={n}
              type="button"
              className={cls.join(' ')}
              style={{ width: CELL }}
              disabled={disabled || !onTap}
              onClick={() => onTap?.(n)}
              aria-label={fmt(n)}
            >
              <i />
              <b>{fmt(n)}</b>
            </button>
          )
        })}
      </div>
    </div>
  )
}
