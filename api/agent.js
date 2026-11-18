// Vercel serverless function: one endpoint, three agent roles. API keys never reach the browser.
// Fallback chain: Groq gpt-oss-120b (~1 s, key 1 then key 2) → Groq gpt-oss-20b → Gemini flash-lite (keys 1, 2). Budget ~10 s.
// Quota care: low reasoning effort, small output cap, only the last 4 conversation turns are sent.

export const config = { maxDuration: 30 }

const CHAIN = [
  ['groq', 'openai/gpt-oss-120b', 'GROQ_API_KEY'],
  ['groq', 'openai/gpt-oss-120b', 'GROQ_API_KEY_2'], // backup key when key 1 hits its rate/quota limit
  ['groq', 'openai/gpt-oss-20b', 'GROQ_API_KEY'],
  ['gemini', 'gemini-3.5-flash-lite', 'LLM_API_KEY'],
  ['gemini', 'gemini-3.5-flash-lite', 'LLM_API_KEY_2'],
]

async function callGroq(model, key, system, user, ms) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      signal: ctrl.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        response_format: { type: 'json_object' },
        reasoning_effort: 'low',
        temperature: 0.4,
        max_completion_tokens: 600,
      }),
    })
    if (!r.ok) return { error: `HTTP ${r.status}` }
    const j = await r.json()
    const text = j.choices?.[0]?.message?.content || ''
    const m = text.match(/\{[\s\S]*\}/)
    return m ? { data: JSON.parse(m[0]) } : { error: 'no JSON' }
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'timeout' : String(e.message || e) }
  } finally {
    clearTimeout(timer)
  }
}

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

const CONVO = `
You can see the CONVERSATION so far (messages from the other agents and the learner). Respond to it: refer to another agent by name when you build on or disagree with them (e.g. "जाँच ने सही कहा…" / "मैं जाँच से सहमत नहीं…").
Speak as yourself in the first person; never mention your own name. Never mention "the checker" or "the check"; just state things directly.
While the learner has not yet answered correctly: never write the final answer, never compute it in words (e.g. "3 more than 5"), and never rewrite the question into an easier sum (e.g. "5 + 3"). Point only at the DIRECTION (left/right) or the udhaar idea and let the learner finish.
If "learner_question" is present, the learner asked YOU directly: actually answer their "why/what" with the number line or udhaar idea (Samjhao: a short explanation; Sawaal: a short explanation plus one guiding question back). Never give the final answer of the current question.
Return ONLY JSON: {"hi": "<Hindi>", "en": "<English>", "stance": "agree" | "disagree"}  (stance = do you agree with the previous agent's message; "agree" if there is none)`

const ROLES = {
  jaanch: `You are JAANCH, the Evaluator. The code checker's verdict and misconception tag are FINAL. Tell the learner, in one sentence, whether the answer is right (exactly as the verdict says), and if wrong name the likely misconception in child-friendly words (M1 = treated subtracting a negative like subtracting a positive; M2 = used "two minuses make a plus" where it does not apply). Do not explain the method; Samjhao or Sawaal will follow. If misconception_tag is "shortcut", the learner's answer is right AND their reason ("two minuses make a plus") does work in this question: say both plainly, e.g. "Your answer is right, and your reason works here."` + CONVO,
  samjhao: `You are SAMJHAO, the Explainer. Jaanch diagnosed the misconception tag on the blackboard:
M1 = "subtracting always makes it smaller" → use the udhaar model (removing a debt raises your account).
M2 = "two minuses make a plus everywhere" → use number-line direction (adding a negative moves left).
"other"/"sign"/"diff" → point at the direction to move. Give a targeted nudge for THIS item, not a lecture.` + CONVO,
  sawaal: `You are SAWAAL, the Challenger. Ask ONE short "why?" question, or give ONE counterexample or extension that tests whether the learner's reasoning generalises (e.g. does the rule still hold when a negative is ADDED?). If the blackboard history shows an earlier misconception, refer to that question number. Do not answer your own question. If Jaanch accepted a memorised rule, you may challenge Jaanch.` + CONVO,
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
    debate: ctx.debate ? 'Jaanch accepted the learner\'s memorised shortcut. As Sawaal you DISAGREE: explain in one sentence why a memorised rule is risky and name the counterexample −2 + (−5). Set stance to "disagree".' : undefined,
    reference_line: ctx.scripted, conversation: (ctx.conversation || []).slice(-4).map((c) => ({ agent: c.agent, text: String(c.text || '').slice(0, 300) })),
    learner_question: ctx.learnerQuestion ? String(ctx.learnerQuestion).slice(0, 200) : undefined,
  })

  const deadline = Date.now() + 10000
  const errors = []
  for (const [provider, model, envName] of CHAIN) {
    const key = process.env[envName]
    const left = deadline - Date.now()
    if (!key || left < 1500) continue
    const call = provider === 'groq' ? callGroq : callGemini
    const out = await call(model, key, system, user, Math.min(left, provider === 'groq' ? 4000 : 9000))
    const d = out.data
    if (d && typeof d.hi === 'string' && typeof d.en === 'string' && /[ऀ-ॿ]/.test(d.hi)) {
      const score = ctx.agent === 'jaanch_rubric' ? Math.max(0, Math.min(3, parseInt(d.score, 10) || 0)) : undefined
      const stance = d.stance === 'disagree' ? 'disagree' : 'agree'
      return res.status(200).json({ ok: true, hi: d.hi.trim(), en: d.en.trim(), score, stance, model })
    }
    errors.push(`${model}/${envName}: ${out.error || 'invalid output'}`)
  }
  return res.status(200).json({ ok: false, errors })
}
