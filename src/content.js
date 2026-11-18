// All learner-facing content (REPORT.md D3) as data. Hindi first, English for the toggle.
// Correctness is decided by code from `correct` / `diagnose` / option tags, never by the AI.

export const ROLL = '23B2107'

export const AGENTS = {
  jaanch: { icon: '✅', name: { hi: 'जाँच', en: 'Jaanch' }, role: { hi: 'मूल्यांकन', en: 'Evaluator' } },
  samjhao: { icon: '🧭', name: { hi: 'समझाओ', en: 'Samjhao' }, role: { hi: 'व्याख्या', en: 'Explainer' } },
  sawaal: { icon: '❓', name: { hi: 'सवाल', en: 'Sawaal' }, role: { hi: 'चुनौती', en: 'Challenger' } },
}

export const SCREENS = {
  S1: { hi: 'प्रवेश', en: 'Start' },
  S2: { hi: 'समझो', en: 'Learn' },
  S3: { hi: 'अभ्यास', en: 'Practice' },
  S4: { hi: 'दो राय', en: 'Two views' },
  S5: { hi: 'मेरी प्रगति', en: 'My progress' },
  S6: { hi: 'शिक्षक', en: 'Teacher' },
}

const J = (hi, en) => ({ agent: 'jaanch', text: { hi, en } })
const X = (hi, en) => ({ agent: 'samjhao', text: { hi, en } })
const Q = (hi, en) => ({ agent: 'sawaal', text: { hi, en } })

export const CARDS = [
  {
    id: 'C1',
    title: { hi: 'ऋणात्मक संख्या क्या है?', en: 'What is a negative number?' },
    body: {
      hi: 'संख्या रेखा पर 0 के दाईं ओर धनात्मक संख्याएँ (1, 2, 3…) हैं और बाईं ओर ऋणात्मक संख्याएँ (−1, −2, −3…)। −3 यानी 0 से 3 कदम बाईं ओर। पैसों में सोचो: +5 = तुम्हारे पास ₹5 हैं। −3 = तुम पर दुकान का ₹3 उधार है।',
      en: 'On the number line, positive numbers (1, 2, 3…) are right of 0 and negative numbers (−1, −2, −3…) are left. −3 means 3 steps left of 0. Think in money: +5 = you have ₹5. −3 = you owe the shop ₹3 (udhaar).',
    },
    check: { target: -3, prompt: { hi: 'जल्दी जाँच: −3 पर टैप करो', en: 'Quick check: tap −3' } },
    examples: [],
  },
  {
    id: 'C2',
    title: { hi: 'जोड़ना = संख्या की दिशा में चलो', en: "Adding = move in the number's direction" },
    body: {
      hi: 'धनात्मक संख्या जोड़ो → दाईं ओर चलो। ऋणात्मक संख्या जोड़ो → बाईं ओर चलो। पैसों में: उधार में उधार जोड़ो तो उधार बढ़ता है। ₹1 उधार + ₹4 उधार = ₹5 उधार, यानी −5 (+5 नहीं!)',
      en: 'Add a positive → move right. Add a negative → move left. In money: udhaar added to udhaar makes a bigger udhaar. ₹1 owed + ₹4 owed = ₹5 owed, i.e. −5 (not +5!)',
    },
    examples: [
      { label: '2 + (−5) = −3', start: 2, move: -5, say: { hi: '2 से 5 कदम बाईं ओर → −3', en: '5 steps left from 2 → −3' } },
      { label: '−1 + (−4) = −5', start: -1, move: -4, say: { hi: '−1 से 4 कदम और बाईं ओर → −5', en: '4 more steps left from −1 → −5' } },
    ],
  },
  {
    id: 'C3',
    title: { hi: 'घटाना = उल्टी दिशा में चलो', en: 'Subtracting = move the opposite way' },
    body: {
      hi: 'किसी संख्या को घटाने का मतलब है उसकी उल्टी दिशा में चलना। पैसों में: तुम्हारे पास ₹6 हैं और दुकान का ₹2 उधार है, तो हिसाब 6 + (−2) = ₹4। दुकानदार ₹2 का उधार माफ़ कर दे: 4 − (−2) = ₹6। उधार हटने से हिसाब बढ़ता है!',
      en: 'Subtracting a number means moving opposite to its direction. In money: you have ₹6 and owe ₹2, so your account is 6 + (−2) = ₹4. If the shopkeeper waives the ₹2 udhaar: 4 − (−2) = ₹6. Removing a debt raises your account!',
    },
    examples: [
      { label: '−3 − 2 = −5', start: -3, move: -2, say: { hi: '2 दाईं ओर वाली संख्या; घटाना है तो उल्टा: 2 कदम बाईं ओर → −5', en: '2 points right; subtracting, so go opposite: 2 steps left → −5' } },
      { label: '4 − (−2) = 6', start: 4, move: 2, say: { hi: '−2 बाईं ओर वाली संख्या; घटाना है तो उल्टा: 2 कदम दाईं ओर → 6', en: '−2 points left; subtracting, so go opposite: 2 steps right → 6' } },
    ],
  },
  {
    id: 'C4',
    title: { hi: '"दो माइनस = प्लस" कब सही है?', en: 'When is "two minuses = plus" true?' },
    body: {
      hi: '✔ − (−3) = +3: ऋणात्मक संख्या घटाना = दाईं ओर चलना।\n✘ + (−3) ≠ +3: ऋणात्मक संख्या जोड़ना = बाईं ओर चलना।\n✘ −4 − 3 ≠ +7: यहाँ धनात्मक 3 घटाया जा रहा है: 3 कदम बाईं ओर → −7।\nहर सवाल से पहले खुद से पूछो: दाईं ओर जाना है या बाईं ओर?',
      en: '✔ −(−3) = +3: subtracting a negative = moving right.\n✘ +(−3) is not +3: adding a negative = moving left.\n✘ −4 − 3 is not +7: a positive 3 is subtracted, 3 steps left → −7.\nBefore every question ask: right or left?',
    },
    examples: [
      { label: '5 − (−3) = 8', start: 5, move: 3, say: { hi: '−(−3): दाईं ओर 3 कदम', en: '−(−3): 3 steps right' } },
      { label: '−4 + (−3) = −7', start: -4, move: -3, say: { hi: '+(−3): बाईं ओर 3 कदम', en: '+(−3): 3 steps left' } },
    ],
  },
]

export const TASKS = [
  {
    id: 'T1', lo: 'LO1', type: 'line',
    format: { hi: 'संख्या रेखा पर टैप करो', en: 'Tap on the number line' },
    expr: '−4 + (−3) = ?',
    prompt: { hi: 'जवाब संख्या रेखा पर टैप करो।', en: 'Tap the answer on the number line.' },
    start: -4, move: -3, correct: -7, diagnose: { 7: 'M2' },
    model: { hi: '−7: −4 से शुरू, −3 जोड़ना = 3 कदम बाईं ओर: −5, −6, −7।', en: '−7: start at −4; adding −3 = 3 steps left: −5, −6, −7.' },
    hints: [
      { hi: '−3 जोड़ने का मतलब किस दिशा में चलना है?', en: 'Adding −3 means moving in which direction?' },
      { hi: '−4 पर उँगली रखो और बाईं ओर गिनो: −5, −6, …', en: 'Put a finger on −4 and count left: −5, −6, …' },
    ],
    feedback: {
      correct: [
        J('सही! −4 से 3 कदम बाईं ओर चलकर −7 आता है। ऋणात्मक संख्या जोड़ने से हम और बाईं ओर जाते हैं।', 'Correct! Three steps left from −4 gives −7. Adding a negative takes us further left.'),
        Q('एक सवाल: यहाँ भी दो माइनस थे, फिर भी उत्तर प्लस क्यों नहीं बना?', "Question: there were two minus signs here too, so why didn't the answer become plus?"),
      ],
      M2: [
        J('उत्तर +7 नहीं है। लगता है "दो माइनस = प्लस" वाला नियम यहाँ लग गया।', 'The answer isn\'t +7. It looks like the "two minuses = plus" rule got used here.'),
        X('यहाँ ऋणात्मक संख्या जोड़ी जा रही है, घटाई नहीं जा रही। ₹4 उधार में ₹3 और उधार जुड़ा, तो कुल ₹7 उधार: −7। तीर बाईं ओर जाता है।', 'Here a negative is being added, not subtracted. ₹4 owed plus ₹3 more owed = ₹7 owed: −7. The arrow goes left.'),
      ],
      other: [
        J('यह उत्तर सही नहीं है।', 'That answer is not right.'),
        X('दिशा देखो: −3 जोड़ना = बाईं ओर। −4 पर उँगली रखो और 3 कदम बाईं ओर गिनो।', 'Check the direction: adding −3 = left. Put a finger on −4 and count 3 steps left.'),
      ],
    },
  },
  {
    id: 'T2', lo: 'LO1', type: 'sign',
    format: { hi: 'पहले चिह्न का अनुमान, फिर उत्तर', en: 'Predict the sign, then answer' },
    expr: '5 − (−3) = ?',
    prompt: { hi: 'पहला कदम: उत्तर धनात्मक (+) होगा या ऋणात्मक (−)? दूसरा कदम: संख्या लिखो।', en: 'Step 1: will the answer be positive (+) or negative (−)? Step 2: type the number.' },
    start: 5, move: 3, correct: 8, diagnose: { 2: 'M1', '-2': 'M1' },
    model: { hi: '+8: −3 बाईं ओर वाली संख्या है; घटाना = उल्टी दिशा = 3 कदम दाईं ओर: 5 → 6, 7, 8।', en: '+8: −3 points left; subtracting = opposite = 3 steps right: 5 → 6, 7, 8.' },
    hints: [
      { hi: '−3 को घटाना है। घटाना = उल्टी दिशा। −3 किस दिशा वाली संख्या है?', en: 'You subtract −3. Subtracting = opposite direction. Which way does −3 point?' },
      { hi: 'उल्टी दिशा यानी दाईं ओर: 5 से 3 कदम दाईं ओर गिनो।', en: 'Opposite means right: count 3 steps right from 5.' },
    ],
    feedback: {
      correct: [
        J('सही, 8! ऋणात्मक संख्या घटाने पर हम दाईं ओर गए, इसलिए उत्तर 5 से बड़ा है।', 'Correct, 8! Subtracting a negative moved us right, so the answer is bigger than 5.'),
        Q('दिलचस्प! घटाने पर संख्या बड़ी हो गई। क्या घटाने से हमेशा संख्या बड़ी होती है? 5 − 3 सोचकर देखो।', 'Interesting! Subtracting made it bigger. Does subtracting always make it bigger? Think about 5 − 3.'),
      ],
      M1: [
        J('उत्तर 2 नहीं है। लगता है −3 को 3 मानकर घटा दिया: ब्रैकेट के अंदर का माइनस छूट गया।', 'The answer isn\'t 2. It looks like −3 was subtracted as if it were 3: the minus inside the bracket was missed.'),
        X('सोचो: तुम्हारा हिसाब ₹5 है, जिसमें ₹3 का उधार भी जुड़ा है। दुकानदार वह ₹3 का उधार हटा दे, तो अब ज़्यादा होगा या कम? ज़्यादा!', 'Think: your account is ₹5, and that includes ₹3 of udhaar. The shopkeeper removes that ₹3 udhaar. Now is it more or less? More!'),
      ],
      sign: [
        J('चिह्न सही नहीं है।', 'The sign is not right.'),
        X('चिह्न फिर से सोचो: −3 को घटाना = दाईं ओर चलना। 5 से दाईं ओर जाएँ, तो उत्तर धनात्मक ही रहेगा।', 'Rethink the sign: subtracting −3 = moving right. Moving right from 5 keeps it positive.'),
      ],
      other: [
        J('यह उत्तर सही नहीं है।', 'That answer is not right.'),
        X('−3 को घटाना है। घटाना = उल्टी दिशा। −3 बाईं ओर वाली है, तो चलना दाईं ओर है।', 'You subtract −3. Subtracting = opposite direction. −3 points left, so move right.'),
      ],
    },
  },
  {
    id: 'T3', lo: 'LO1', type: 'mcq',
    format: { hi: 'सही विकल्प चुनो', en: 'Multiple choice' },
    expr: '−2 − (−6) = ?',
    prompt: { hi: 'सही विकल्प चुनो।', en: 'Choose the correct option.' },
    start: -2, move: 6, correct: 4,
    options: [
      { id: 'A', label: '−8', tag: 'M1' },
      { id: 'B', label: '4', tag: 'correct', correct: true },
      { id: 'C', label: '−4', tag: 'other' },
      { id: 'D', label: '8', tag: 'M2' },
    ],
    model: { hi: '4: −6 बाईं ओर वाली संख्या; उसे घटाना = 6 कदम दाईं ओर: −2 → −1, 0, 1, 2, 3, 4।', en: '4: −6 points left; subtracting it = 6 steps right: −2 → −1, 0, 1, 2, 3, 4.' },
    hints: [
      { hi: 'पहला −2 वैसा ही रहेगा। −(−6) को सोचो: दाईं ओर या बाईं ओर?', en: 'The first −2 stays. Think about −(−6): right or left?' },
      { hi: '−2 से 6 कदम दाईं ओर गिनो: −1, 0, 1, …', en: 'Count 6 steps right from −2: −1, 0, 1, …' },
    ],
    feedback: {
      correct: [J('सही, 4! −2 से 6 कदम दाईं ओर चलकर 0 पार होता है और 4 आता है।', 'Correct, 4! Six steps right from −2 crosses 0 and lands on 4.')],
      M1: [
        J('−8 तब आता जब +6 घटाया जाता। पर यहाँ ब्रैकेट में −6 है।', '−8 would come from subtracting +6. But the bracket has −6.'),
        X('पैसों में: तुम्हारा हिसाब −2 है (₹2 उधार)। दुकानदार ₹6 का एक उधार माफ़ कर दे, तो हिसाब ₹6 बढ़ेगा।', 'In money: your account is −2 (₹2 owed). If the shopkeeper waives a ₹6 udhaar, your account rises by ₹6.'),
      ],
      M2: [
        J('8 तब आता जब सारे माइनस हटाकर 2 + 6 किया जाए।', '8 would come from dropping all the minus signs: 2 + 6.'),
        X('"दो माइनस = प्लस" सिर्फ़ −(−6) पर लगता है, यानी +6। पहला −2 वैसा ही रहता है: −2 से शुरू करो।', '"Two minuses = plus" applies only to −(−6), giving +6. The first −2 stays as it is: start from −2.'),
      ],
      other: [
        J('यह विकल्प सही नहीं है।', 'That option is not right.'),
        X('दिशा उलट गई। −6 को घटाना = दाईं ओर। −2 से 6 कदम दाईं ओर गिनो।', 'The direction got reversed. Subtracting −6 = right. Count 6 steps right from −2.'),
      ],
    },
  },
  {
    id: 'T4', lo: 'LO1', type: 'story',
    format: { hi: 'उधार की कहानी', en: 'Udhaar story' },
    expr: null,
    prompt: {
      hi: 'रामू के परिवार पर किराने की दुकान का ₹40 उधार है, यानी हिसाब −40। इस महीने उन्होंने ₹25 का सामान और उधार पर लिया। अब उनका हिसाब कितना है? पूर्णांक में लिखो (जैसे −10)।',
      en: "Ramu's family owes the grocery shop ₹40, so their account is −40. This month they bought ₹25 more on udhaar. What is their account now? Write an integer (like −10).",
    },
    correct: -65, diagnose: { 65: 'M2', 15: 'diff', '-15': 'diff' },
    model: { hi: '−65: −40 + (−25) = −65। उधार में उधार जुड़ा, तो उधार बढ़कर ₹65 हुआ।', en: '−65: −40 + (−25) = −65. Udhaar added to udhaar, so it grew to ₹65.' },
    hints: [
      { hi: 'पुराना उधार (−40) और नया उधार (−25): उधार बढ़ेगा या घटेगा?', en: 'Old udhaar (−40) and new udhaar (−25): will the udhaar grow or shrink?' },
      { hi: 'दोनों उधार जुड़ेंगे: 40 + 25 का उधार। उधार है, तो चिह्न − रहेगा।', en: 'Both udhaars add: 40 + 25 owed. It is owed, so the sign stays −.' },
    ],
    feedback: {
      correct: [
        J('सही, −65! उधार में और उधार जुड़ा, तो उधार बढ़ा।', 'Correct, −65! More udhaar was added to udhaar, so the udhaar grew.'),
        Q('अब सोचो: अगर दुकानदार ₹30 का उधार माफ़ कर दे, तो हिसाब क्या होगा?', 'Now think: if the shopkeeper waives ₹30 of udhaar, what is the account?'),
      ],
      M2: [
        J('65 का मतलब होता कि परिवार के पास ₹65 हैं!', '65 would mean the family has ₹65!'),
        X('पर और उधार लेने से कोई अमीर नहीं होता। −40 + (−25) में दोनों उधार हैं, दोनों जुड़कर बड़ा उधार बनाते हैं।', "But taking more udhaar doesn't make anyone richer. In −40 + (−25) both are udhaar; together they make a bigger udhaar."),
      ],
      diff: [
        J('यहाँ 40 और 25 का अंतर निकल गया।', 'Here the difference of 40 and 25 was taken.'),
        X('दोनों उधार हैं, तो वे जुड़ेंगे, अंतर नहीं निकलेगा।', 'Both are udhaar, so they add up; no difference is taken.'),
      ],
      other: [
        J('यह उत्तर सही नहीं है।', 'That answer is not right.'),
        X('पहले उधार में नया उधार जोड़ो। उधार हमेशा ऋणात्मक लिखा जाता है।', 'Add the new udhaar to the old one. Udhaar is always written as negative.'),
      ],
    },
  },
  {
    id: 'T5', lo: 'LO2', type: 'reason',
    format: { hi: 'कारण चुनो + अपने शब्दों में', en: 'Choose a reason + explain' },
    expr: '5 − (−3) = 8',
    prompt: { hi: 'यह क्यों सही है? तुम कौन-सा कारण दोगे?', en: 'Why is this true? Which reason would you give?' },
    start: 5, move: 3, correct: 8,
    options: [
      { id: 'A', tag: 'correct', correct: true, label: { hi: '−3 बाईं ओर वाली संख्या है। घटाने का मतलब उल्टी दिशा, इसलिए 5 से 3 कदम दाईं ओर → 8।', en: '−3 points left; subtracting means the opposite direction, so 3 steps right from 5 → 8.' } },
      { id: 'B', tag: 'shortcut', correct: null, label: { hi: 'दो माइनस मिलकर प्लस बनाते हैं: −(−3) = +3, तो 5 + 3 = 8।', en: 'Two minuses together make a plus: −(−3) = +3, so 5 + 3 = 8.' } },
      { id: 'C', tag: 'M1', label: { hi: 'घटाने से संख्या हमेशा छोटी होती है, इसलिए असल में उत्तर 2 होना चाहिए।', en: 'Subtracting always makes a number smaller, so the answer should really be 2.' } },
    ],
    model: { hi: 'A: −3 घटाने का मतलब ₹3 का उधार हटाना है। उधार हटने से हिसाब ₹3 बढ़ता है: 5 + 3 = 8।', en: 'A: subtracting −3 means removing ₹3 of udhaar. Removing a debt raises the account by ₹3: 5 + 3 = 8.' },
    explainPrompt: { hi: 'अब अपने शब्दों में एक-दो लाइन लिखो: संख्या रेखा या उधार की कहानी से। (हिंदी या English)', en: 'Now write one or two lines in your own words, using the number line or the udhaar story. (Hindi or English)' },
    hints: [
      { hi: 'कौन-सा कारण बताता है कि क्यों, सिर्फ़ नियम नहीं?', en: 'Which reason tells WHY, not just a rule?' },
      { hi: 'संख्या रेखा पर दिशा वाला कारण देखो।', en: 'Look for the reason that uses direction on the number line.' },
    ],
    feedback: {
      correct: [
        J('बिल्कुल सही कारण! तुमने दिशा से समझाया, रटे हुए नियम से नहीं।', 'Exactly the right reason! You explained with direction, not a memorised rule.'),
        Q('क्या यही कारण −1 − (−4) पर भी चलेगा? मन में करके देखो।', 'Will the same reason work for −1 − (−4)? Try it in your head.'),
      ],
      M1: [
        J('यह कारण ठीक नहीं है। 5 − (−3) सच में 8 है, 2 नहीं।', 'This reason is not right. 5 − (−3) really is 8, not 2.'),
        X('घटाने से संख्या तभी छोटी होती है जब धनात्मक संख्या घटाई जाए। उधार (ऋणात्मक संख्या) घटाने से हिसाब बढ़ता है।', 'Subtracting makes a number smaller only when a positive number is subtracted. Subtracting udhaar (a negative) raises the account.'),
      ],
      other: [J('यह कारण ठीक नहीं है।', 'This reason is not right.')],
    },
  },
  {
    id: 'T6', lo: 'LO3', type: 'compare',
    format: { hi: 'दो हल की तुलना', en: 'Compare two solutions' },
    expr: '6 − (−2)',
    prompt: {
      hi: 'आशा और बंटी ने 6 − (−2) हल किया।\nआशा: 6 − (−2) = 4, "क्योंकि घटाने से संख्या छोटी होती है।"\nबंटी: 6 − (−2) = 8, "क्योंकि ₹2 का उधार हटने से हिसाब ₹2 बढ़ता है।"\nकौन सही है, और क्यों?',
      en: 'Asha and Bunty solved 6 − (−2).\nAsha: 6 − (−2) = 4, "because subtracting makes a number smaller."\nBunty: 6 − (−2) = 8, "because removing ₹2 of udhaar raises the account by ₹2."\nWho is right, and why?',
    },
    start: 6, move: 2, correct: 8,
    options: [
      { id: 'A', tag: 'correct', correct: true, label: { hi: 'बंटी सही है: आशा ने −2 को 2 मानकर घटा दिया; उधार हटने से हिसाब बढ़ता है।', en: 'Bunty: Asha treated −2 as 2; removing udhaar raises the account.' } },
      { id: 'B', tag: 'M1', label: { hi: 'आशा सही है: घटाने से संख्या हमेशा छोटी होती है।', en: 'Asha: subtracting always makes it smaller.' } },
      { id: 'C', tag: 'M2', label: { hi: 'बंटी सही है: क्योंकि दो माइनस हमेशा प्लस बनाते हैं।', en: 'Bunty: because two minuses always make a plus.' } },
      { id: 'D', tag: 'other', label: { hi: 'दोनों सही हैं: दोनों ने अलग तरीके से किया।', en: 'Both: they just used different methods.' } },
    ],
    model: { hi: 'A: 6 − (−2) = 8। आशा ने "घटाने से हमेशा छोटा" मानकर −2 को 2 की तरह घटाया। ₹2 का उधार हटने से हिसाब ₹2 बढ़ता है।', en: 'A: 6 − (−2) = 8. Asha assumed "subtracting always makes it smaller" and subtracted −2 as if it were 2. Removing ₹2 of udhaar raises the account by ₹2.' },
    hints: [
      { hi: '6 से शुरू करो। −2 घटाना = कौन-सी दिशा?', en: 'Start at 6. Subtracting −2 = which direction?' },
      { hi: 'उत्तर 8 है। अब देखो किसका कारण दिशा या उधार से है, रटे नियम से नहीं।', en: 'The answer is 8. Now see whose reason uses direction or udhaar, not a memorised rule.' },
    ],
    feedback: {
      correct: [
        J('सही! बंटी सही है, और तुमने आशा की गलती भी पकड़ी। गलती पहचानना पक्की समझ की निशानी है।', "Correct! Bunty is right, and you also caught Asha's mistake. Spotting an error shows solid understanding."),
        Q('आशा को समझाने के लिए एक लाइन सोचो।', 'Think of one line to explain it to Asha.'),
      ],
      M1: [
        J('यह आशा वाली गलती है: "घटाने से हमेशा छोटा" सिर्फ़ धनात्मक संख्या घटाने पर सही है।', 'That\'s Asha\'s mistake: "subtracting always makes it smaller" is only true when subtracting a positive.'),
        X('संख्या रेखा पर 6 से शुरू करो। −2 को घटाना = 2 कदम दाईं ओर।', 'Start at 6 on the number line. Subtracting −2 = 2 steps right.'),
      ],
      M2: [
        J('बंटी सही है ✓, पर "दो माइनस हमेशा प्लस" वाला कारण गलत है।', 'Bunty is right ✓, but the reason "two minuses ALWAYS make a plus" is wrong.'),
        Q('अगर यह हमेशा सही होता, तो −4 + (−3) भी +7 होता। बंटी का कारण, उधार हटना, बेहतर है।', "If that were always true, −4 + (−3) would be +7 too. Bunty's reason, removing udhaar, is better."),
      ],
      other: [
        J('यह विकल्प सही नहीं है।', 'That option is not right.'),
        X('एक सवाल के दो अलग उत्तर (4 और 8) दोनों सही नहीं हो सकते। संख्या रेखा पर 6 से शुरू करके देखो।', "One question can't have two different correct answers (4 and 8). Start at 6 on the number line and check."),
      ],
    },
  },
]

// The disagreement moment (REPORT.md D3 Part C)
export const DISAGREE = {
  title: { hi: '🤝 दो राय हैं: तुम तय करो', en: '🤝 Two views: you decide' },
  jaanch: J('उत्तर 8 सही है ✓। तुम्हारा कारण भी इस सवाल में सही है: −(−3) सच में +3 होता है। मेरे हिसाब से यह ठीक है।', '8 is correct ✓. Your reason is also valid in this question: −(−3) really is +3. In my view, this is fine.'),
  sawaal: Q('मैं सहमत नहीं हूँ। यह नियम रटा हुआ है: यह नहीं बताता कि क्यों। ऐसे नियम अक्सर गलत जगह लग जाते हैं, जैसे −2 + (−5) में।', "I don't agree. This rule is memorised: it doesn't say WHY. Rules like this often get used in the wrong place, like in −2 + (−5)."),
  sawaalHistory: (taskNo) => Q(`सवाल ${taskNo} में यही नियम गलत जगह लगा था: वहाँ उत्तर प्लस लिखा गया था।`, `In question ${taskNo} this same rule was used in the wrong place: the answer there was written as plus.`),
  viewJ: { hi: 'जाँच: "कारण इस सवाल में सही है।"', en: 'Jaanch: "The reason is valid in this question."' },
  viewS: { hi: 'सवाल: "कारण रटा हुआ है, हर जगह नहीं चलेगा।"', en: 'Sawaal: "The reason is memorised; it won\'t work everywhere."' },
  note: { hi: 'ℹ️ सही उत्तर पर कोई बहस नहीं; बहस सिर्फ़ कारण पर है।', en: 'ℹ️ No one disputes the answer; the debate is only about the reason.' },
  choices: {
    test: { hi: '🔍 सवाल की बात परखो', en: "🔍 Test Sawaal's example" },
    continue: { hi: '➡️ मेरा कारण ठीक है, आगे चलो', en: '➡️ My reason is fine, continue' },
    ask: { hi: '🙋 टीचर से पूछो', en: '🙋 Ask my teacher' },
  },
  test: { start: -2, move: -5, correct: -7, expr: '−2 + (−5) = ?' },
  testRight: [
    J('सही, −7! नियम सही जगह लगा: यहाँ दो माइनस होने पर भी उत्तर प्लस नहीं बना।', "Correct, −7! The rule was used in the right place: two minus signs, yet the answer didn't become plus."),
    Q('बढ़िया, मेरी चिंता दूर हुई।', 'Great, my concern is settled.'),
    X('दोनों की बात में सच था: "−(−) = +" सही शॉर्टकट है, पर सिर्फ़ तब जब ऋणात्मक संख्या घटाई जाए। जोड़ने पर उधार बढ़ता है।', 'Both had a point: "−(−) = +" is a correct shortcut, but only when a negative is SUBTRACTED. When ADDED, the udhaar grows.'),
  ],
  testWrong: [
    J('यहाँ उत्तर −7 है, +7 नहीं। सवाल की चिंता सही निकली।', "Here the answer is −7, not +7. Sawaal's concern was right."),
    X('यहाँ ऋणात्मक संख्या जोड़ी जा रही है: −2 से 5 कदम बाईं ओर → −7। "दो माइनस = प्लस" सिर्फ़ −(−) पर लगता है।', 'Here a negative is being added: 5 steps left from −2 → −7. "Two minuses = plus" applies only to −(−).'),
  ],
  continueMsg: { hi: 'ठीक है, तुम्हारा फ़ैसला! यह बातचीत टीचर को भी दिखेगी।', en: 'Okay, your call! This conversation will also be shown to your teacher.' },
  askMsg: { hi: 'तुम्हारा सवाल टीचर तक पहुँच गया। अगली बार ऐप खोलने पर उनका जवाब यहीं मिलेगा।', en: 'Your question has reached the teacher. Their reply will be here next time you open the app.' },
  teacherJ: { hi: 'टीचर: जाँच की बात सही है, तुम्हारा शॉर्टकट इस सवाल में ठीक है। बस ध्यान रखना कि यह सिर्फ़ −(−) पर लगता है।', en: 'Teacher: Jaanch is right, your shortcut is fine in this question. Just remember it applies only to −(−).' },
  teacherS: { hi: 'टीचर: सवाल की बात सही है। नियम रटने के बजाय दिशा से सोचो: + (−) में बाईं ओर, − (−) में दाईं ओर।', en: 'Teacher: Sawaal is right. Instead of memorising the rule, think in directions: +(−) goes left, −(−) goes right.' },
}
