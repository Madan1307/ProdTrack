import { getSettings } from '../store/settingsStore';

async function safeGenerate(prompt) {
  const { apiKey } = getSettings();
  
  if (!apiKey || apiKey.startsWith('AIzaSy')) {
    throw new Error('Please go to ⚙️ Settings and enter a valid Groq API key. You get free Groq keys at console.groq.com');
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      let errObj;
      try { errObj = JSON.parse(errText); } catch(e) {}
      throw new Error(`STATUS ${res.status}: ` + (errObj?.error?.message || errText));
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('429') || msg.includes('rate limit')) {
      throw new Error('Rate limit exceeded: ' + msg);
    }
    if (msg.includes('key') || msg.includes('auth') || msg.includes('401')) {
      throw new Error('Invalid Groq API key: ' + msg);
    }
    throw new Error('FETCH/API ERROR: ' + msg);
  }
}

export async function generateDailyQuestions(streakKeywords, distractionKeywords, suggestionKeywords, weakAreas) {
  const streakNames = streakKeywords
    .map(k => `${k.name}(priority:${k.priority}, streak:${k.streak}, missed:${k.missCount})`)
    .join(', ');
  const distractionNames = distractionKeywords.map(k => k.name).join(', ');
  const suggestionNames = suggestionKeywords.map(k => k.name).join(', ');
  const weakNames = weakAreas.length > 0 ? weakAreas.map(k => k.name).join(', ') : 'none';

  const prompt = `You are a strict, no-nonsense productivity coach. Generate exactly 10 daily check-in questions.

KEYWORD DATA:
- Streak habits: ${streakNames || 'leetcode, gym, study, project'}
- Distractions to monitor: ${distractionNames || 'scrolling, procrastination'}
- Suggestion areas: ${suggestionNames || 'revision, consistency'}
- Weak areas (missed 2+ days): ${weakNames}

QUESTION RULES:
- Q1 to Q6: About streak habits. Tone must be direct, real, slightly uncomfortable. Each maps to 1-2 streak keywords.
- Q7 to Q8: About distractions. ALWAYS indirect — never name the distraction directly.
- Q9 to Q10: Growth/suggestion questions focused on weak areas.
- Each question has exactly 4 MCQ options (A, B, C, D).
- Prioritize weak areas and high-priority keywords.

TONE EXAMPLES (use this style):
- "Did you actually open LeetCode today, or just plan to?"
- "Was your focus intact, or did your phone win again?"
- "Did you push past discomfort, or settle for comfort?"

Return ONLY a valid JSON object with a "questions" array, no markdown, no explanation:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "keywords": ["keyword1"],
      "type": "streak"
    }
  ]
}`;

  const text = await safeGenerate(prompt);

  try {
    const data = JSON.parse(text);
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error("Missing array in data. Keys found: " + Object.keys(data).join(','));
    }
    return data.questions;
  } catch (e) {
    throw new Error('Parse error: ' + e.message + ' | Raw string from AI: ' + text);
  }
}

export async function analyzeBehavior(questionsAndAnswers, allKeywords) {
  const qaText = questionsAndAnswers
    .map((qa, i) => `Q${i + 1} [tracks: ${qa.keywords.join(', ')}]: "${qa.question}"\nAnswer: "${qa.selectedOption}"`)
    .join('\n\n');

  const allKwNames = allKeywords.map(k => k.name).join(', ');

  const prompt = `You are a behavior analysis AI. Analyze user answers and determine their behavior for each keyword.

QUESTIONS & ANSWERS:
${qaText}

ALL TRACKED KEYWORDS: ${allKwNames}

RULES:
- For each keyword that appears in the questions, return: "done", "missed", or "skipped"
- "done" = user did the habit / positive answer
- "missed" = user didn't do it / negative answer
- "skipped" = unclear or not applicable
- For distraction keywords: "done" = they gave in to distraction, "missed" = they avoided it (good)
- Be strict and accurate.

Return ONLY a valid JSON object, no markdown:
{
  "keyword_name": "done|missed|skipped"
}`;

  const text = await safeGenerate(prompt);

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Behavior analysis returned invalid format.');
  }
}

export async function generateInsights(keywordStates, recentLogs, productivityPct) {
  const kwSummary = keywordStates
    .map(k => `${k.name} (type:${k.type}, streak:${k.streak}, missed:${k.missCount}, priority:${k.priority})`)
    .join('\n');

  const recentScores = recentLogs
    .slice(-7)
    .map(l => `${l.date}: ${l.log ? l.log.productivityPct + '%' : 'no data'}`)
    .join(', ');

  const prompt = `You are a strict productivity coach. Analyze this user's behavior data and give honest feedback.

KEYWORD STATES:
${kwSummary}

LAST 7 DAYS PRODUCTIVITY: ${recentScores}
TODAY'S SCORE: ${productivityPct}%

Generate the following:
1. 2-3 honest insights about their patterns (no sugarcoating)
2. 2-3 actionable suggestions
3. 1 motivational message (use career/placement/growth context for students)
4. 1-2 strict warnings if missCount >= 3 or distractions are repeated (be real, slightly harsh)

Return ONLY a valid JSON object, no markdown:
{
  "insights": ["...", "..."],
  "suggestions": ["...", "..."],
  "motivation": "...",
  "warnings": ["...", "..."],
  "overallTone": "excellent|average|warning|critical"
}`;

  const text = await safeGenerate(prompt);

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      insights: ['Keep tracking daily to reveal your patterns.'],
      suggestions: ['Complete your daily quiz consistently for better insights.'],
      motivation: 'Every habit starts with one day. Make today count.',
      warnings: [],
      overallTone: 'average',
    };
  }
}
