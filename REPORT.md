# Ganit Chaupal (गणित चौपाल): Report

| Roll no. | P | T | L | C |
|---|---|---|---|---|
| 23B2107 | P3 Multi-agent collaborative learning environment | P3-T1 Integers: operations with negative numbers (Class 7) | L1 Rural government-school student (Class 6–8), regional-language medium, parent's Android phone ~30 min/evening | C5 Teacher-in-the-loop |

**Card:** P3 Multi-agent collaborative learning · T1 Integers: operations with negative numbers (Class 7) ·
L1 Rural government school, regional-language medium, parent's Android phone for about 30 min in the evening ·
C5 Teacher-in-the-loop
**Author:** Tushar Bajaj (23B2107) · **Live app:** https://et617-23b2107.vercel.app

*Chaupal* is the village meeting place where people discuss a matter and each person states their view. In the app,
three AI agents discuss the learner's answer, and **the learner decides**.

> **Language:** the learner sees **Hindi first**, with an English toggle. Hindi is the regional medium of instruction in
> our assumed setting, rural Madhya Pradesh. The Hindi lines below are the exact text shown in the app; the English
> lines (in italics) are translations for evaluators.

---

## D1. Educational problem

### Problem
In rural Hindi-medium government schools, Class 7 learners mostly meet integer operations as memorised sign rules
("minus-minus is plus"), without a picture of what a negative number means. As a result they make two predictable
errors:
- treating subtraction of a negative like subtraction of a positive: **5 − (−3) = 2**
- stretching "two minuses make a plus" to addition: **−4 + (−3) = 7**

One maths teacher handles Classes 6–8, and parents often cannot help with this topic, so these errors go unnoticed until
test papers are marked. The learner's only practice window is about 30 minutes on a parent's Android phone in the
evening, on weak, shared prepaid data. The learner needs practice that makes them **reason, not just answer**, catches
the misconception when it appears, and lets the teacher see and correct the AI's feedback the next day.

### Learning outcomes

| # | After the activity, the learner will be able to… | Bloom level (revised) | Measured by | Success criterion |
|---|---|---|---|---|
| **LO1** | **Predict** the sign of, and **compute**, the result of adding or subtracting integers that include negative numbers, e.g. −4 + (−3), 5 − (−3) | Apply | Tasks T1–T4 plus one check item | ≥ 4 of 5 correct on the first attempt |
| **LO2** | **Explain**, using a number-line move or an *udhaar* (shop-credit) story, why subtracting a negative number makes the result larger, e.g. 5 − (−3) = 8 | Understand | Task T5 (choose a reason, then explain in own words) | Picks the meaning-based reason, **or** scores ≥ 2/3 on the explanation rubric |
| **LO3** | **Compare** two worked solutions, **identify** the wrong one, and **name** the misconception it uses | Evaluate | Task T6, plus the check item in the "two views" moment | Correct choice **with** the correct reason |

### Context of use
- **Where:** at home in the village, often with siblings and family around. Sound can't be relied on, and the learner
  may be interrupted.
- **When:** about 7:30–8:00 pm, after the parent returns from the fields and hands over the phone; about 30 minutes, and
  the phone may be taken back for a call at any time.
- **Device:** the parent's low-cost Android phone (about 6.5″ screen, 2–3 GB RAM, Chrome), on a shared daily prepaid data
  pack with a weak 4G/3G signal indoors.
- **Teacher (C5):** reviews the class on her own phone in the staff room the next morning, and approves or overrides
  AI feedback before the learner's next evening session.

---

## D2. Learner persona: Kavita, 12

| Field | Kavita |
|---|---|
| **Name, age, class** | Kavita, 12, Class 7, Government Middle School in a village in Vidisha district, Madhya Pradesh *(location assumed)* |
| **Context and support** | Parents farm soybean and wheat. Her father studied up to Class 8, her mother up to Class 5 *(assumption)*, so they can't explain negative numbers. No tuition in the village. One maths teacher (Meena Ma'am) teaches Classes 6–8, about 90 students. |
| **Device** | Father's Android phone, about ₹7,000, 6.5″ screen, 2–3 GB RAM, Chrome. Shared daily prepaid data; the signal drops indoors in the evening. |
| **Time** | About 30 minutes, roughly 7:30–8:00 pm, after her father returns. Often cut short when he needs the phone. |
| **Language** | Hindi at home and at school (Hindi-medium). Reads Devanagari comfortably and knows the textbook terms *ऋणात्मक* (negative), *धनात्मक* (positive), *संख्या रेखा* (number line). Writes digits and + − = as in the textbook. Reads only a little English. |
| **Prior knowledge of prerequisites** | **Secure:** whole-number addition and subtraction; reading a number line; placing −3 on a number line and knowing −5 °C means "below zero" (met integers in Class 6, *assumed*). **Shaky:** ordering negatives (thinks −8 > −3 "because 8 > 3"); adding numbers with mixed signs. **Memorised without meaning:** "minus-minus is plus", picked up from class and an older cousin. |
| **Primary goal (her words)** | "माइनस वाले सवालों में बार-बार गलती होती है। मुझे समझना है कि कब प्लस बनता है।" *"I keep making mistakes in minus questions. I want to understand when it becomes plus."* |
| **Biggest barrier** | When she is stuck at home, there is nobody to ask. Her two memorised rules conflict, and she can't tell which one applies. |
| **Motivation** | Wants to stop losing marks on "minus" questions in the half-yearly exam. Enjoys being trusted with the phone for "real" study. Likes being asked her opinion. **Gives up** after 2–3 wrong attempts with no explanation, and goes quiet when corrected in front of others. |
| **Theory link** | *Rules learned without meaning* → she needs concrete models (number line plus a money story; situated learning, dual coding). *Stuck without a tutor* → hints at the moment she is stuck (ZPD, scaffolding). *Fear of being wrong* → private, encouraging feedback (affective filter). *Two conflicting rules* → let her resolve the conflict herself, with evidence (cognitive conflict and conceptual change, Posner et al., 1982). *30-minute window* → small chunks, one task per screen (Cognitive Load Theory). |

### Two likely misconceptions

| | **M1: "Subtracting always makes it smaller"** (घटाने से हमेशा छोटा) | **M2: "Two minuses make a plus, everywhere"** (दो माइनस = प्लस, हर जगह) |
|---|---|---|
| **What she does** | Ignores the sign of the number being subtracted, so a − (−b) becomes a − b | Makes the answer positive whenever two minus signs appear, including in addition |
| **Typical wrong answers** | 5 − (−3) = **2** · −2 − (−6) = **−8** · 6 − (−2) = **4** | −4 + (−3) = **7** · −40 + (−25) = **65** · −2 − (−6) = **8** |
| **Why it arises** | Years of whole-number experience, where subtraction always makes the number smaller | A sign rule memorised without meaning (from −(−b) or from multiplication) and applied beyond where it holds |
| **How the app detects it** | The learner's answer equals the answer M1 would predict for that item | The learner's answer equals the answer M2 would predict, **or** they choose the rule-only reason in T5 and then fail the check item |

M1 *under*-applies the sign change and M2 *over*-applies it. The same learner can show both, which is why the agents
must share what each one has observed.

### A moment in Kavita's day
*7:40 pm. After dinner her father hands her his phone. She taps the "Ganit Chaupal" shortcut on the home screen. The
app remembers her from yesterday, with no password, and opens on the task she left. The signal drops twice, but the
tasks are already loaded, so she keeps going. When she writes −4 + (−3) = 7, the agents don't just say "wrong". The
number line shows her arrow going left, and Samjhao tells the udhaar story. At 8:05 her father needs the phone. She taps
"रुको" (pause); tomorrow she'll continue from the same place. Next morning, Meena Ma'am sees that Kavita chose to keep
her own reason in the "two views" moment, and writes her a one-line reply.*

### Secondary user (C5): Meena Ma'am, 38
The only maths teacher for Classes 6–8. Checks the teacher view on her own phone in the staff room at about 9:30 am.
**Needs:** in about 5 minutes, see who is stuck on which misconception, and approve or correct what the AI told each
child, before the child's next session.

---

## D3. Educational content: one complete learning activity

**Activity:** उधार और संख्या रेखा: ऋणात्मक संख्याओं का जोड़-घटाना
*(Udhaar and the number line: adding and subtracting negative numbers)*
**Duration:** about 20 minutes (concept about 5 min, 6 tasks about 12 min, summary about 2 min), which fits the 30-minute window.

**Who speaks** (three AI agents with distinct roles):

| Agent | Role | Speaks when |
|---|---|---|
| ✅ **Jaanch** (जाँच, "check") | Evaluator. States whether the answer is correct (verified by code, never by AI), names the misconception, judges the quality of explanations | After every attempt |
| 🧭 **Samjhao** (समझाओ, "explain") | Explainer. Number line and udhaar story, chosen to fit the misconception Jaanch found | After a wrong attempt, on a hint request, or to reconcile a disagreement |
| ❓ **Sawaal** (सवाल, "question") | Challenger. Asks "why?", offers counterexamples and extension questions, tests whether a rule really holds | After a correct attempt, or when the reasoning looks memorised |

### Part A: Concept explanation (4 short cards, each with an interactive number line from −10 to 10)

**Card 1: ऋणात्मक संख्या क्या है? (What is a negative number?)**
> संख्या रेखा पर 0 के दाईं ओर धनात्मक संख्याएँ (1, 2, 3…) हैं और बाईं ओर ऋणात्मक संख्याएँ (−1, −2, −3…)। −3 यानी 0 से
> 3 कदम बाईं ओर। पैसों में सोचो: **+5** = तुम्हारे पास ₹5 हैं। **−3** = तुम पर दुकान का ₹3 उधार है।
>
> *On the number line, positive numbers (1, 2, 3…) are right of 0 and negative numbers (−1, −2, −3…) are left. −3 means
> 3 steps left of 0. Think in money: +5 = you have ₹5. −3 = you owe the shop ₹3 (udhaar).*
> **Quick check (not scored):** "−3 पर टैप करो" *(Tap −3)*

**Card 2: जोड़ना = संख्या की दिशा में चलो (Adding = move in the number's direction)**
> धनात्मक संख्या जोड़ो → दाईं ओर चलो। ऋणात्मक संख्या जोड़ो → बाईं ओर चलो।
> उदाहरण: **2 + (−5)** → 2 से 5 कदम बाईं ओर → **−3**
> उदाहरण: **−1 + (−4)** → −1 से 4 कदम और बाईं ओर → **−5**
> पैसों में: उधार में उधार जोड़ो तो उधार बढ़ता है। ₹1 उधार + ₹4 उधार = ₹5 उधार, यानी −5 (+5 नहीं!)
>
> *Add a positive → move right. Add a negative → move left. 2 + (−5) = −3. −1 + (−4) = −5. In money: udhaar added to
> udhaar makes a bigger udhaar: ₹1 owed + ₹4 owed = ₹5 owed, i.e. −5 (not +5!)*

**Card 3: घटाना = उल्टी दिशा में चलो (Subtracting = move the opposite way)**
> किसी संख्या को घटाने का मतलब है उसकी उल्टी दिशा में चलना।
> उदाहरण: **−3 − 2** → 2 दाईं ओर वाली संख्या है; घटाना है, तो उल्टा: 2 कदम बाईं ओर → **−5**
> उदाहरण: **4 − (−2)** → −2 बाईं ओर वाली संख्या है; घटाना है, तो उल्टा: 2 कदम दाईं ओर → **6**
> पैसों में: तुम्हारे पास ₹6 हैं और दुकान का ₹2 उधार है, तो हिसाब 6 + (−2) = ₹4। दुकानदार ₹2 का उधार माफ़ कर दे, यानी
> उधार घटा दे: 4 − (−2) = ₹6। **उधार हटने से हिसाब बढ़ता है!**
>
> *Subtracting a number means moving opposite to its direction. −3 − 2 = −5 (2 points right, so go left).
> 4 − (−2) = 6 (−2 points left, so go right). In money: you have ₹6 and owe ₹2, so your account is 6 + (−2) = ₹4. If
> the shopkeeper waives the ₹2 udhaar (subtracts it): 4 − (−2) = ₹6. Removing a debt raises your account!*

**Card 4: "दो माइनस = प्लस" कब सही है? (When is "two minuses = plus" true?)**
> ✔ **− (−3) = +3**: ऋणात्मक संख्या घटाना = दाईं ओर चलना।
> ✘ **+ (−3) ≠ +3**: ऋणात्मक संख्या जोड़ना = बाईं ओर चलना। उत्तर और ऋणात्मक होता है।
> ✘ **−4 − 3 ≠ +7**: यहाँ धनात्मक 3 घटाया जा रहा है: 3 कदम बाईं ओर → −7।
> हर सवाल से पहले खुद से पूछो: **दाईं ओर जाना है या बाईं ओर?**
>
> *✔ −(−3) = +3, because subtracting a negative = moving right. ✘ +(−3) is not +3: adding a negative = moving left.
> ✘ −4 − 3 is not +7: a positive 3 is subtracted, 3 steps left gives −7. Before every question ask: right or left?*

### Part B: Tasks (6 tasks, 6 formats)

| # | Format | Item | LO | Correct | M1 predicts | M2 predicts |
|---|---|---|---|---|---|---|
| T1 | Tap on number line | −4 + (−3) | LO1 | **−7** | n/a | 7 |
| T2 | Predict sign (+/−), then type the number | 5 − (−3) | LO1 | **+, 8** | 2 | *(gets 8 via the shortcut)* |
| T3 | Multiple choice | −2 − (−6) | LO1 | **4** | −8 (A) | 8 (D) |
| T4 | Word problem (udhaar), type an integer | −40 + (−25) | LO1 | **−65** | n/a | 65 |
| T5 | Choose your reason + explain in own words (free text) | Why 5 − (−3) = 8 | LO2 | **A** (meaning-based) | C | B, then check item |
| T6 | Compare two worked solutions | 6 − (−2): Asha vs Bunty | LO3 | **A** | B | C |

Code computes every "correct" value and compares the learner's answer with the M1 and M2 predictions; the AI does not
decide correctness. Each task has a hint ladder from Samjhao (hint 1: nudge → hint 2: worked step → hint 3: animated
answer). The answer is revealed only after two attempts or hint 3.

---

#### T1: संख्या रेखा पर टैप करो (Tap on the number line) · LO1
**Question:** −4 + (−3) = ? जवाब संख्या रेखा पर टैप करो। *(Tap the answer on the number line.)*
**Model answer:** **−7.** −4 से शुरू। −3 जोड़ना = 3 कदम बाईं ओर: −5, −6, −7। *(Start at −4; adding −3 = 3 steps left.)*

- **✅ Correct (−7):**
  - *Jaanch:* "सही! −4 से 3 कदम बाईं ओर चलकर −7 आता है। ऋणात्मक संख्या जोड़ने से हम और बाईं ओर जाते हैं।"
    *Correct! Three steps left from −4 gives −7. Adding a negative takes us further left.*
  - *Sawaal:* "एक सवाल: यहाँ भी दो माइनस थे, फिर भी उत्तर प्लस क्यों नहीं बना?"
    *Question: there were two minus signs here too, so why didn't the answer become plus?*
- **⚠ M2 (+7):**
  - *Jaanch:* "उत्तर +7 नहीं है। लगता है 'दो माइनस = प्लस' वाला नियम यहाँ लग गया।"
    *The answer isn't +7. It looks like the 'two minuses = plus' rule got used here.*
  - *Samjhao:* "यहाँ ऋणात्मक संख्या जोड़ी जा रही है, घटाई नहीं जा रही। ₹4 उधार में ₹3 और उधार जुड़ा, तो कुल ₹7 उधार: −7। देखो, तीर बाईं ओर जाता है।"
    *Here a negative is being added, not subtracted. ₹4 owed plus ₹3 more owed = ₹7 owed: −7. See, the arrow goes left.*
  - → "फिर से करो" *(Try again)*
- **✖ Other wrong (e.g. −1, 1):**
  - *Samjhao:* "दिशा देखो: −3 जोड़ना = बाईं ओर। −4 पर उँगली रखो और 3 कदम बाईं ओर गिनो।"
    *Check the direction: adding −3 = left. Put a finger on −4 and count 3 steps left.*
- **M1:** not applicable (no subtraction in this item).

#### T2: पहले चिह्न का अनुमान, फिर उत्तर (Predict the sign, then answer) · LO1
**Question:** 5 − (−3) = ? **Step 1:** उत्तर धनात्मक (+) होगा या ऋणात्मक (−)? **Step 2:** उत्तर लिखो।
*(Step 1: will the answer be positive or negative? Step 2: type the answer.)*
**Model answer:** **+, 8.** −3 बाईं ओर वाली संख्या है; घटाना = उल्टी दिशा = 3 कदम दाईं ओर: 5 → 6, 7, 8।
*(−3 points left; subtracting = opposite = 3 steps right.)*

- **✅ Correct (+, 8):**
  - *Jaanch:* "सही, 8! ऋणात्मक संख्या घटाने पर हम दाईं ओर गए, इसलिए उत्तर 5 से बड़ा है।"
    *Correct, 8! Subtracting a negative moved us right, so the answer is bigger than 5.*
  - *Sawaal:* "दिलचस्प! घटाने पर संख्या बड़ी हो गई। क्या घटाने से हमेशा संख्या बड़ी होती है? 5 − 3 सोचकर देखो।"
    *Interesting! Subtracting made it bigger. Does subtracting always make it bigger? Think about 5 − 3.*
- **⚠ M1 (2):**
  - *Jaanch:* "उत्तर 2 नहीं है। लगता है −3 को 3 मानकर घटा दिया: ब्रैकेट के अंदर का माइनस छूट गया।"
    *The answer isn't 2. It looks like −3 was subtracted as if it were 3: the minus inside the bracket was missed.*
  - *Samjhao* (money model, chosen because Jaanch tagged M1): "सोचो: तुम्हारा हिसाब ₹5 है, जिसमें ₹3 का उधार भी जुड़ा है। दुकानदार वह ₹3 का उधार हटा दे, तो अब ज़्यादा होगा या कम? ज़्यादा! 5 − (−3) = 8।"
    *Think: your account is ₹5, and that includes ₹3 of udhaar. The shopkeeper removes that ₹3 udhaar. Now is it more or less? More! 5 − (−3) = 8.*
- **⚠ Sign predicted "−":**
  - *Samjhao:* "चिह्न फिर से सोचो: −3 को घटाना = दाईं ओर चलना। 5 से दाईं ओर जाएँ, तो उत्तर धनात्मक ही रहेगा।"
    *Rethink the sign: subtracting −3 = moving right. Moving right from 5 keeps it positive.*
- **M2:** an M2 learner gets 8 here, because the shortcut is valid for −(−). That is why T5 checks the *reason*.

#### T3: सही विकल्प चुनो (Multiple choice) · LO1
**Question:** −2 − (−6) = ? **A)** −8 **B)** 4 **C)** −4 **D)** 8
**Model answer:** **B) 4.** −6 बाईं ओर वाली संख्या; उसे घटाना = 6 कदम दाईं ओर: −2 → −1, 0, 1, 2, 3, 4।

- **✅ B (4):**
  - *Jaanch:* "सही, 4! −2 से 6 कदम दाईं ओर चलकर 0 पार होता है और 4 आता है।"
    *Correct, 4! Six steps right from −2 crosses 0 and lands on 4.*
- **⚠ A (−8), M1:**
  - *Jaanch:* "−8 तब आता जब +6 घटाया जाता। पर यहाँ ब्रैकेट में −6 है।"
    *−8 would come from subtracting +6. But the bracket has −6.*
  - *Samjhao:* "पैसों में: तुम्हारा हिसाब −2 है (₹2 उधार)। दुकानदार ₹6 का एक उधार माफ़ कर दे, तो हिसाब ₹6 बढ़ेगा: −2 → +4।"
    *In money: your account is −2 (₹2 owed). If the shopkeeper waives a ₹6 udhaar, your account rises by ₹6: −2 → +4.*
- **⚠ D (8), M2:**
  - *Jaanch:* "8 तब आता जब सारे माइनस हटाकर 2 + 6 किया जाए।"
    *8 would come from dropping all the minus signs: 2 + 6.*
  - *Samjhao:* "'दो माइनस = प्लस' सिर्फ़ −(−6) पर लगता है, यानी +6। पहला −2 वैसा ही रहता है: −2 + 6 = 4।"
    *'Two minuses = plus' applies only to −(−6), giving +6. The first −2 stays as it is: −2 + 6 = 4.*
- **✖ C (−4):**
  - *Samjhao:* "दिशा उलट गई। −6 को घटाना = दाईं ओर। −2 से 6 कदम दाईं ओर गिनो।"
    *The direction got reversed. Subtracting −6 = right. Count 6 steps right from −2.*

#### T4: उधार की कहानी (Udhaar story, type an integer) · LO1
**Question:** रामू के परिवार पर किराने की दुकान का ₹40 उधार है, यानी हिसाब −40। इस महीने उन्होंने ₹25 का सामान और उधार पर
लिया। अब उनका हिसाब कितना है? पूर्णांक में लिखो (जैसे −10)।
*(Ramu's family owes the grocery shop ₹40, so their account is −40. This month they bought ₹25 more on udhaar. What is
their account now? Write an integer, like −10.)*
**Model answer:** **−65.** −40 + (−25) = −65। उधार में उधार जुड़ा, तो उधार बढ़कर ₹65 हुआ।

- **✅ Correct (−65):**
  - *Jaanch:* "सही, −65! उधार में और उधार जुड़ा, तो उधार बढ़ा।"
    *Correct, −65! More udhaar was added to udhaar, so the udhaar grew.*
  - *Sawaal* (optional extension): "अब सोचो: अगर दुकानदार ₹30 का उधार माफ़ कर दे, तो हिसाब क्या होगा?"
    *Now think: if the shopkeeper waives ₹30 of udhaar, what is the account?* (Answer −35, checked by code.)
- **⚠ M2 (65):**
  - *Jaanch:* "65 का मतलब होता कि परिवार के पास ₹65 हैं!"
    *65 would mean the family has ₹65!*
  - *Samjhao:* "पर और उधार लेने से कोई अमीर नहीं होता। −40 + (−25) में दोनों उधार हैं, दोनों जुड़कर बड़ा उधार बनाते हैं: −65।"
    *But taking more udhaar doesn't make anyone richer. In −40 + (−25) both are udhaar; together they make a bigger udhaar: −65.*
- **✖ 15 or −15:**
  - *Samjhao:* "यहाँ 40 और 25 का अंतर निकल गया। पर दोनों उधार हैं, तो वे जुड़ेंगे: ₹65 का उधार, यानी −65।"
    *Here the difference of 40 and 25 was taken. But both are udhaar, so they add up: ₹65 owed, i.e. −65.*
- **M1:** not applicable.

#### T5: तुम कौन-सा कारण दोगे? (Which reason would you give?) + explain in your words · LO2
**Question:** 5 − (−3) = 8 क्यों है? तुम कौन-सा कारण दोगे? *(Why is 5 − (−3) = 8? Which reason would you give?)*
- **A)** "−3 बाईं ओर वाली संख्या है। घटाने का मतलब उल्टी दिशा, इसलिए 5 से 3 कदम दाईं ओर → 8।"
  *−3 points left; subtracting means the opposite direction, so 3 steps right from 5 → 8.*
- **B)** "दो माइनस मिलकर प्लस बनाते हैं: −(−3) = +3, तो 5 + 3 = 8।"
  *Two minuses together make a plus: −(−3) = +3, so 5 + 3 = 8.* (a valid shortcut here, but memorised)
- **C)** "घटाने से संख्या हमेशा छोटी होती है, इसलिए असल में उत्तर 2 होना चाहिए।"
  *Subtracting always makes a number smaller, so the answer should really be 2.*

**Then (optional free text):** "अब अपने शब्दों में एक-दो लाइन लिखो: संख्या रेखा या उधार की कहानी से।"
*(Now write one or two lines in your own words, using the number line or the udhaar story.)*

**Model answer:** **A.** Model explanation: "−3 घटाने का मतलब ₹3 का उधार हटाना है। उधार हटने से हिसाब ₹3 बढ़ता है: 5 + 3 = 8।"
*(Subtracting −3 means removing ₹3 of udhaar. Removing a debt raises the account by ₹3: 5 + 3 = 8.)*

**Explanation rubric (0–3)**, scored by Jaanch (AI) and shown to the teacher for approval:
- +1 uses a model (direction on the number line, or udhaar)
- +1 says subtracting a negative moves right or increases the value
- +1 reaches 8, consistent with that reason

- **✅ A:**
  - *Jaanch:* "बिल्कुल सही कारण! तुमने दिशा से समझाया, रटे हुए नियम से नहीं।"
    *Exactly the right reason! You explained with direction, not a memorised rule.*
  - *Sawaal:* "क्या यही कारण −1 − (−4) पर भी चलेगा? मन में करके देखो।"
    *Will the same reason work for −1 − (−4)? Try it in your head.* (Answer 3.)
- **⚠ B (shortcut):** → **the disagreement moment (Part C below).**
- **⚠ C, M1:**
  - *Jaanch:* "यह कारण ठीक नहीं है। 5 − (−3) सच में 8 है, 2 नहीं।"
    *This reason is not right. 5 − (−3) really is 8, not 2.*
  - *Samjhao:* "घटाने से संख्या तभी छोटी होती है जब धनात्मक संख्या घटाई जाए। उधार (ऋणात्मक संख्या) घटाने से हिसाब बढ़ता है।"
    *Subtracting makes a number smaller only when a positive number is subtracted. Subtracting udhaar (a negative) raises the account.*
- **Free text, example of Jaanch's AI feedback** on "minus minus plus hota hai isliye 8":
  - "उत्तर सही है ✓। कारण में दिशा या उधार की बात जोड़ो, तब यह हर सवाल में काम करेगा। (स्कोर 1/3)"
    *The answer is correct ✓. Add direction or udhaar to your reason, and it will work in every question. (Score 1/3)*
  - Labelled **"AI की राय: टीचर देखेंगी"** *(AI's view: the teacher will review)* until the teacher approves it.

#### T6: दो हल की तुलना (Compare two solutions) · LO3
**Question:** आशा और बंटी ने 6 − (−2) हल किया।
- **आशा:** 6 − (−2) = 4, "क्योंकि घटाने से संख्या छोटी होती है।"
- **बंटी:** 6 − (−2) = 8, "क्योंकि ₹2 का उधार हटने से हिसाब ₹2 बढ़ता है।"

कौन सही है, और क्यों? *(Who is right, and why?)*
- **A)** बंटी सही है: आशा ने −2 को 2 मानकर घटा दिया; उधार हटने से हिसाब बढ़ता है। *(Bunty: Asha treated −2 as 2; removing udhaar raises the account.)*
- **B)** आशा सही है: घटाने से संख्या हमेशा छोटी होती है। *(Asha: subtracting always makes it smaller.)*
- **C)** बंटी सही है: क्योंकि दो माइनस हमेशा प्लस बनाते हैं। *(Bunty: because two minuses always make a plus.)*
- **D)** दोनों सही हैं: दोनों ने अलग तरीके से किया। *(Both: they just used different methods.)*

**Model answer:** **A.** 6 − (−2) = 8. Asha believed "subtracting always makes it smaller" (M1) and subtracted −2 as if
it were 2 (6 − 2 = 4). Removing a ₹2 debt raises the account by ₹2: 6 + 2 = 8.

- **✅ A:**
  - *Jaanch:* "सही! बंटी सही है, और तुमने आशा की गलती भी पकड़ी। गलती पहचानना पक्की समझ की निशानी है।"
    *Correct! Bunty is right, and you also caught Asha's mistake. Spotting an error shows solid understanding.*
  - *Sawaal:* "आशा को समझाने के लिए एक लाइन लिखो।" *(Write one line to explain it to Asha.)* (optional explain-back)
- **⚠ B, M1:**
  - *Jaanch:* "यह आशा वाली गलती है: 'घटाने से हमेशा छोटा' सिर्फ़ धनात्मक संख्या घटाने पर सही है।"
    *That's Asha's mistake: 'subtracting always makes it smaller' is only true when subtracting a positive.*
  - *Samjhao:* "संख्या रेखा पर 6 से शुरू करो। −2 को घटाना = 2 कदम दाईं ओर → 8।"
    *Start at 6 on the number line. Subtracting −2 = 2 steps right → 8.*
- **⚠ C, M2 reason:**
  - *Jaanch:* "बंटी सही है ✓, पर 'दो माइनस *हमेशा* प्लस' वाला कारण गलत है।"
    *Bunty is right ✓, but the reason 'two minuses ALWAYS make a plus' is wrong.*
  - *Sawaal:* "अगर यह हमेशा सही होता, तो −4 + (−3) भी +7 होता। बंटी का कारण, उधार हटना, बेहतर है।"
    *If that were always true, −4 + (−3) would be +7 too. Bunty's reason, removing udhaar, is better.*
- **✖ D:**
  - *Samjhao:* "एक सवाल के दो अलग उत्तर (4 और 8) दोनों सही नहीं हो सकते। संख्या रेखा पर 6 से शुरू करके देखो।"
    *One question can't have two different correct answers (4 and 8). Start at 6 on the number line and check.*

### Part C: The disagreement moment (T5, option B)

Jaanch and Sawaal judge by **different, stated criteria**:
- **Jaanch** asks: *is the answer right, and is the reason valid for this question?*
- **Sawaal** asks: *will this reason still work in other questions?*

For option B both are partly right: "−(−3) = +3" is a valid shortcut here, but it is memorised and is the root of M2.
This is a real disagreement, not one agent simply being wrong.

1. **Jaanch:** "उत्तर 8 सही है ✓। तुम्हारा कारण भी इस सवाल में सही है: −(−3) सच में +3 होता है। मेरे हिसाब से यह ठीक है।"
   *8 is correct ✓. Your reason is also valid in this question: −(−3) really is +3. In my view, this is fine.*
2. **Sawaal:** "मैं सहमत नहीं हूँ। यह नियम रटा हुआ है: यह नहीं बताता कि *क्यों*। ऐसे नियम अक्सर गलत जगह लग जाते हैं, जैसे −2 + (−5) में।"
   *I don't agree. This rule is memorised: it doesn't say WHY. Rules like this often get used in the wrong place, like in −2 + (−5).*
   - If the learner's earlier work shows M2 (Sawaal reads the record Jaanch kept for T1 and T4):
     "Q1 में यही नियम गलत जगह लगा था: −4 + (−3) का उत्तर +7 लिखा गया था।"
     *In Q1 this same rule was used in the wrong place: the answer to −4 + (−3) was written as +7.*
3. **The learner sees one labelled card**, not two loose messages:
   > **🤝 दो राय हैं: तुम तय करो** *(Two views: you decide)*
   > ✅ **जाँच:** "कारण इस सवाल में सही है।" · ❓ **सवाल:** "कारण रटा हुआ है, हर जगह नहीं चलेगा।"
   > *ℹ️ सही उत्तर पर कोई बहस नहीं; बहस सिर्फ़ कारण पर है।* *(No one disputes the answer; the debate is only about the reason.)*
   > **[🔍 सवाल की बात परखो]** *(Test Sawaal's example)* · **[➡️ मेरा कारण ठीक है, आगे चलो]** *(My reason is fine, continue)* · **[🙋 टीचर से पूछो]** *(Ask my teacher)*
4. **Each choice is respected:**
   - **Test** → a number-line check item: **−2 + (−5) = ?**
     - **Answers −7:**
       - *Jaanch:* "सही, −7! नियम सही जगह लगा: यहाँ दो माइनस होने पर भी उत्तर प्लस नहीं बना।"
         *Correct, −7! The rule was used in the right place: two minus signs, yet the answer didn't become plus.*
       - *Sawaal:* "बढ़िया, मेरी चिंता दूर हुई।" *(Great, my concern is settled.)*
       - *Samjhao* (reconciles both): "दोनों की बात में सच था: '−(−) = +' सही शॉर्टकट है, पर सिर्फ़ तब जब ऋणात्मक संख्या *घटाई* जाए। *जोड़ने* पर उधार बढ़ता है।"
         *Both had a point: '−(−) = +' is a correct shortcut, but only when a negative is SUBTRACTED. When ADDED, the udhaar grows.*
     - **Answers +7:**
       - *Jaanch:* "यहाँ उत्तर −7 है, +7 नहीं। सवाल की चिंता सही निकली।"
         *Here the answer is −7, not +7. Sawaal's concern was right.*
       - → Samjhao's number-line explanation (from T1), and M2 is flagged for the teacher.
   - **Continue:** "ठीक है, तुम्हारा फ़ैसला! यह बातचीत टीचर को भी दिखेगी।" *(Okay, your call! This conversation will also be shown to your teacher.)* → saved as an *unresolved disagreement*.
   - **Ask teacher:** "तुम्हारा सवाल टीचर तक पहुँच गया। अगली बार ऐप खोलने पर उनका जवाब यहीं मिलेगा।" *(Your question has reached the teacher. Their reply will be here next time you open the app.)*
5. **Teacher view (C5):**
   - The item appears as: *"Kavita · T5 · Disagreement: Jaanch accepted the shortcut, Sawaal challenged it · learner chose: Continue"*.
   - Teacher options: **[Approve Jaanch] [Approve Sawaal] [Write my own feedback]**. Example override:
     "कविता, तुम्हारा शॉर्टकट सही है। कल क्लास में बताना कि यह −2 + (−5) पर क्यों नहीं चलता।"
     *Kavita, your shortcut is right. Tomorrow in class, tell us why it doesn't work for −2 + (−5).*
   - The learner sees this as **"👩‍🏫 टीचर का संदेश"** *(Teacher's message)* at the start of her next session.

### Part D: End-of-activity summary (what the learner sees)
> **आज की चौपाल** *(Today's chaupal)*
> ➕➖ जोड़-घटाना (LO1): 4/4 ✓ · 💬 समझाना (LO2): शॉर्टकट, फिर जाँचा ✓ · ⚖️ तुलना (LO3): ✓
> 🔁 "दो माइनस = प्लस": 1 बार गलत जगह लगा, फिर सुधरा। *(Used in the wrong place once, then corrected.)*
> **कल:** 3 मिनट का दोहराव, उन्हीं सवालों से जो गलत हुए थे। *(Tomorrow: a 3-minute review of the questions you missed.)*

---

## D4–D8
*To follow:* D4 (working app), D5 (two learner scenarios with screenshots), D6 (AI specification), D7 (pedagogical
rationale), D8 (evaluation plan).
