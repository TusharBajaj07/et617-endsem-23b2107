// Vercel serverless function: one endpoint, three agent roles. The Gemini key never reaches the browser.
// Fallback chain: flash-lite (key 1) → flash-lite (key 2) → flash (key 1); total budget ~8 s.

const CHAIN = [
  ['gemini-3.5-flash-lite', 'LLM_API_KEY'],
  ['gemini-3.5-flash-lite', 'LLM_API_KEY_2'],
  ['gemini-3.8-flash', 'LLM_API_KEY'],
]

const COMMON = `You are one of three AI agents in "Ganit Chaupal", a maths practice app for a 12-year-old Class 7 student in a rural Hindi-medium government school in India. Topic: adding and subtracting negative integers.
Agents: Jaanch (evaluator), Samjhao (explainer), Sawaal (challenger). You receive a BLACKBOARD (JSON) written by a code checker and the other agents.
Rules:
- The checker's verdict is FINAL. Never contradict it. Never call a wrong answer right.
- Use only two models: the number line (left/right steps) and "udhaar" (shop credit; a negative number = money owed).
- At most 2 short sentences. Simple Hindi in Devanagari that a Class 7 Hindi-medium student knows; digits and + − = are fine.
- Address the learner as "तुम". Avoid gendered verb forms for the learner (prefer "तुमने ..." or impersonal forms).
- If the verdict is "wrong" and attempt < 2, do NOT state the final answer.
- Stay consistent with the reference line from the teacher-approved script, but personalise using the learner's attempt and history.
Return ONLY JSON: {"hi": "<Hindi>", "en": "<English translation>"}`

const ROLES = {
  samjhao: `You are SAMJHAO, the Explainer. Jaanch diagnosed the misconception tag on the blackboard:
M1 = "subtracting always makes it smaller" → use the udhaar model (removing a debt raises your account).
M2 = "two minuses make a plus everywhere" → use number-line direction (adding a negative moves left).
"other"/"sign"/"diff" → point at the direction to move. Give a targeted nudge for THIS item, not a lecture.`,
  sawaal: `You are SAWAAL, the Challenger. Ask ONE short "why?" question, or give ONE counterexample or extension that tests whether the learner's reasoning generalises (e.g. does the rule still hold when a negative is ADDED?). If the blackboard history shows an earlier misconception, refer to that question number. Do not answer your own question.`,
  jaanch_rubric: `You are JAANCH, the Evaluator. Score the learner's free-text explanation of why 5 − (−3) = 8 on a 0–3 rubric:
+1 uses a model (number-line direction or udhaar/debt), +1 says subtracting a negative moves right or increases the value, +1 reaches 8 consistent with the reason.
The learner may write in Hindi, Hinglish (Roman Hindi) or English. Give ONE encouraging sentence naming what to add next.
Return ONLY JSON: {"score": <0-3 integer>, "hi": "<Hindi>", "en": "<English>"}`,
}

async function callGemini(model, key, system, user, ms) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024, responseMimeType: 'application/json' },
      }),
    })
    if (!r.ok) return { error: `HTTP ${r.status}` }
    const j = await r.json()
    const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
    const m = text.match(/\{[\s\S]*\}/)
    return m ? { data: JSON.parse(m[0]) } : { error: 'no JSON' }
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'timeout' : String(e.message || e) }
  } finally {
    clearTimeout(timer)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' })
  const ctx = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const role = ROLES[ctx.agent]
  if (!role) return res.status(400).json({ ok: false, error: 'unknown agent' })

  const system = COMMON + '\n\n' + role
  const user = JSON.stringify({
    task: ctx.task, verdict: ctx.verdict, misconception_tag: ctx.tag, attempt: ctx.attempt,
    learner_answer: ctx.learnerAnswer, learner_text: ctx.learnerText, blackboard: ctx.blackboard,
    reference_line: ctx.scripted,
  })

  const deadline = Date.now() + 8000
  const errors = []
  for (const [model, envName] of CHAIN) {
    const key = process.env[envName]
    const left = deadline - Date.now()
    if (!key || left < 1500) continue
    const out = await callGemini(model, key, system, user, Math.min(left, 4500))
    const d = out.data
    if (d && typeof d.hi === 'string' && typeof d.en === 'string' && /[ऀ-ॿ]/.test(d.hi)) {
      const score = ctx.agent === 'jaanch_rubric' ? Math.max(0, Math.min(3, parseInt(d.score, 10) || 0)) : undefined
      return res.status(200).json({ ok: true, hi: d.hi.trim(), en: d.en.trim(), score, model })
    }
    errors.push(`${model}/${envName}: ${out.error || 'invalid output'}`)
  }
  return res.status(200).json({ ok: false, errors })
}
