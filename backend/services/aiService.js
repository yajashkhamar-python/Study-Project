const { GoogleGenAI } = require('@google/genai');

/**
 * Smart Free AI Study Engine Fallback
 * Used ONLY when GEMINI_API_KEY is not configured in backend/.env
 */
const generateSmartFreeAIResponse = (userMessage, studentContext = '') => {
  const msgLower = userMessage.toLowerCase();

  // Extract key data points from context string if present
  const overdueMatch = studentContext.match(/Overdue Tasks:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  const pendingMatch = studentContext.match(/Pending Tasks:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  const examMatch = studentContext.match(/Upcoming Exams:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
  const statsMatch = studentContext.match(/Study Progress Stats:\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);

  const overdueText = overdueMatch ? overdueMatch[1].trim() : 'No overdue tasks.';
  const pendingText = pendingMatch ? pendingMatch[1].trim() : 'No pending tasks.';
  const examText = examMatch ? examMatch[1].trim() : 'No upcoming exams.';
  const statsText = statsMatch ? statsMatch[1].trim() : 'Active student.';

  // 1. Plan My Day / Daily Schedule
  if (msgLower.includes('plan my day') || msgLower.includes('schedule') || msgLower.includes('today')) {
    return `### 📅 Your Personalized Daily Study Plan

Based on your current StudyPulse data, here is an optimized study schedule for today:

#### 🚨 1. Urgent & Overdue Priority (Morning)
${overdueText.includes('- No overdue') ? '- Great news! You have no overdue tasks. Start with your highest priority pending task.' : overdueText}

#### 📚 2. Core Study Block (Afternoon - 90 mins)
${pendingText.includes('- No pending') ? '- Review your upcoming exam syllabus and start reading ahead.' : pendingText.split('\n').slice(0, 2).join('\n')}

#### 🎯 3. Focus & Exam Prep (Evening - 60 mins)
${examText.includes('- No upcoming') ? '- Dedicate 45 minutes to practice problem solving or review notes.' : examText}

#### 💡 Study Tips for Today:
- Use **Pomodoro mode** (25 mins focus + 5 mins break) to stay sharp.
- Drink water and take a 10-minute stretch break between focus sessions.
- Mark completed tasks in **StudyPulse** to maintain your streak!`;
  }

  // 2. Prepare for My Exam
  if (msgLower.includes('exam') || msgLower.includes('prepare')) {
    return `### 🎯 Targeted Exam Preparation Strategy

Here is your custom study roadmap for upcoming exams:

#### 📌 Scheduled Exams
${examText}

#### 🚀 Recommended 3-Step Strategy:
1. **Active Recall & Practice**: Don't just re-read notes. Solve past papers, practice exercises, or create flashcards.
2. **Focus on High-Yield Topics**: Review key topics from syllabus notes listed in your exam tracker.
3. **Task Alignment**: Complete pending assignments related to your exam subjects:
${pendingText}

#### ⏱️ Study Allocation Suggestion:
- **60% Time**: Practice problems & active recall.
- **30% Time**: Reviewing weak areas & notes.
- **10% Time**: Quick formula/definition recap before bed.`;
  }

  // 3. Analyze My Progress
  if (msgLower.includes('analyze') || msgLower.includes('progress') || msgLower.includes('stats')) {
    return `### 📊 StudyPulse Progress & Performance Analysis

#### 📈 Your Current Overview
${statsText}

#### 🔍 Analysis & Key Takeaways:
- **Tasks Remaining**: You have active tasks lined up. Focus on high-priority items first.
- **Overdue Attention**: ${overdueText.includes('- No overdue') ? 'Outstanding job! Zero overdue tasks.' : 'You have overdue tasks. Clearing these today will give you a major productivity boost!'}
- **Consistency**: Keep completing daily focus sessions to build momentum.

#### 💡 Actionable Recommendations:
1. Clear overdue items first thing in your next study session.
2. Break large tasks into smaller 30-minute micro-tasks.
3. Use the **Pomodoro Timer** on StudyPulse to log focused study hours!`;
  }

  // 4. Quiz Me
  if (msgLower.includes('quiz') || msgLower.includes('test')) {
    return `### 🧠 Quick Self-Assessment Quiz

Test your knowledge with these 3 practice questions:

**Question 1 (Computer Science / Logic):**
What is the primary difference between a Stack and a Queue in data structures?
*(Answer: A Stack is LIFO - Last In First Out; a Queue is FIFO - First In First Out).*

**Question 2 (General Study Strategy):**
What is the "Spaced Repetition" learning technique?
*(Answer: Reviewing material at increasing time intervals to boost long-term memory retention).*

**Question 3 (Time Management):**
How long is a standard Pomodoro study interval?
*(Answer: 25 minutes of focus followed by a 5 minute break).*

---
💡 *Tip: Re-test yourself on your actual exam subjects before your upcoming test date!*`;
  }

  // 5. Explain a Topic
  if (msgLower.includes('explain') || msgLower.includes('topic') || msgLower.includes('concept')) {
    return `### 📚 Topic Explanation Guide

To explain any concept effectively, use the **Feynman Technique**:

1. **Choose the Concept**: Identify the specific topic from your subject.
2. **Explain it to a 10-year-old**: Use simple words, analogies, and no complex jargon.
3. **Identify Gaps**: If you get stuck, return to your textbook or lecture notes.
4. **Simplify & Review**: Re-phrase until the explanation is crystal clear.

#### 💡 Example - *What is Normalization in Databases?*
> Normalization is like organizing a messy closet. Instead of putting clothes randomly everywhere, you categorize shirts, shoes, and pants into dedicated drawers so nothing gets duplicated or lost!

*Tell me which specific topic you'd like me to explain next!*`;
  }

  // 6. Default Fallback
  return `### 🤖 StudyPulse AI Assistant

Hello! I am your personal study assistant. Based on your current StudyPulse workspace context:

- **Pending Tasks**: ${pendingText.includes('- No pending') ? 'All caught up!' : 'Active tasks listed in your planner.'}
- **Upcoming Exams**: ${examText.includes('- No upcoming') ? 'No exams currently scheduled.' : 'Exams coming up soon.'}

#### How I can help you right now:
- Type **"Plan My Day"** for a tailored study schedule.
- Type **"Prepare for My Exam"** for an exam strategy.
- Type **"Analyze My Progress"** for productivity feedback.
- Type **"Quiz Me"** for practice questions.
- Ask any concept question to break down difficult topics!`;
};

/**
 * Generate AI response using official Google Gen AI SDK (@google/genai)
 * @param {string} userMessage - User prompt
 * @param {Array} history - Previous conversation messages [{ role: 'user'|'assistant', content: string }]
 * @param {string} studentContext - Structured string containing user profile, tasks, exams, analytics
 */
const generateAIResponse = async (userMessage, history = [], studentContext = '') => {
  let apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  apiKey = apiKey.replace(/^["']|["']$/g, '');

  // ONLY fallback if GEMINI_API_KEY is completely missing/unconfigured
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey === 'your_gemini_api_key_here') {
    console.log('[StudyPulse AI] No GEMINI_API_KEY configured. Using local Smart Free Engine fallback.');
    return generateSmartFreeAIResponse(userMessage, studentContext);
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const systemInstruction = `You are StudyPulse AI, a general-purpose AI assistant with a focus on helping students. You can answer general questions (weather, coding, science, general knowledge, math, etc.) as well as study-related questions. When StudyPulse student context is provided, use it to personalize study-related recommendations.

Current Student Context & Data:
${studentContext ? studentContext : 'No specific student data available.'}`;

  const maxHistory = 10;
  const recentHistory = Array.isArray(history) ? history.slice(-maxHistory) : [];

  const contents = [
    ...recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(msg.content || '') }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  try {
    console.log(`[Gemini AI] Prompting model '${modelName}'...`);
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    return responseText;
  } catch (err) {
    console.error(`[Gemini AI Error] Model: ${modelName} | Message: ${err.message}. Falling back to Smart Free Engine.`);
    return generateSmartFreeAIResponse(userMessage, studentContext);
  }
};

/**
 * Generate Note-specific AI response (Summarize, Explain, Quiz, Flashcards)
 * @param {Object} note - { title, content, subject }
 * @param {string} action - 'summarize' | 'explain' | 'quiz' | 'flashcards'
 */
const generateNoteAIResponse = async (note, action = 'summarize') => {
  let apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  apiKey = apiKey.replace(/^["']|["']$/g, '');

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const noteTitle = note.title || 'Untitled Note';
  const noteSubject = note.subject || 'General';
  const noteContent = note.content || '';

  // Prompt templates per action
  let systemInstruction = '';
  let userPrompt = '';

  if (action === 'summarize') {
    systemInstruction = 'You are StudyPulse AI, an expert academic study assistant. Summarize the provided student study note for high-yield exam revision.';
    userPrompt = `Please summarize the following study note for exam revision.
Subject: ${noteSubject}
Title: ${noteTitle}

Note Content:
${noteContent}

Requirements:
- Preserve core concepts, definitions, and key takeaways.
- Remove unnecessary repetition or fluff.
- Use clean Markdown with bold headings and bullet points.
- Make it clear, concise, and high-yield for quick study revision.`;
  } else if (action === 'explain') {
    systemInstruction = 'You are StudyPulse AI. Explain the concepts in the provided study note in beginner-friendly, crystal-clear language with simple analogies.';
    userPrompt = `Please explain the concepts in this study note in simple, beginner-friendly terms.
Subject: ${noteSubject}
Title: ${noteTitle}

Note Content:
${noteContent}

Requirements:
- Break down technical or difficult terms into simple explanations.
- Use real-world analogies or step-by-step examples.
- Use Markdown formatting.
- Help the student understand 'why' and 'how' this concept works.`;
  } else if (action === 'quiz') {
    systemInstruction = 'You are StudyPulse AI. Generate a 5-question practice quiz based ONLY on the provided study note content. Respond ONLY with a valid JSON object.';
    userPrompt = `Generate a 5-question multiple choice practice quiz based ONLY on the note content below.
Subject: ${noteSubject}
Title: ${noteTitle}

Note Content:
${noteContent}

CRITICAL: Respond ONLY with a raw JSON object (no markdown, no code block fences) formatted as:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why Option A is correct."
    }
  ]
}`;
  } else if (action === 'flashcards') {
    systemInstruction = 'You are StudyPulse AI. Generate 5 to 8 high-yield study flashcards based ONLY on the provided study note content. Respond ONLY with a valid JSON object.';
    userPrompt = `Generate 5 to 8 high-yield study flashcards based ONLY on the note content below.
Subject: ${noteSubject}
Title: ${noteTitle}

Note Content:
${noteContent}

CRITICAL: Respond ONLY with a raw JSON object (no markdown, no code block fences) formatted as:
{
  "flashcards": [
    {
      "front": "Question or Key Term on Front",
      "back": "Answer or Explanation on Back"
    }
  ]
}`;
  }

  // Handle local fallback if no API key present
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey === 'your_gemini_api_key_here') {
    console.log('[StudyPulse AI] Using local smart fallback for note AI tool.');
    if (action === 'summarize') {
      return `### 📌 Exam Summary: ${noteTitle}\n\n**Subject**: ${noteSubject}\n\n#### Key Points:\n- **Overview**: ${noteContent.slice(0, 150)}...\n- **Core Takeaway**: Focus on understanding the primary concepts and definitions in ${noteSubject}.\n- **Revision Tip**: Practice solving active recall questions based on this note.`;
    } else if (action === 'explain') {
      return `### 💡 Beginner Explanation: ${noteTitle}\n\nImagine **${noteTitle}** like organizing a personal toolkit:\n\n- **What it is**: A fundamental topic in **${noteSubject}**.\n- **Simplified View**: ${noteContent.slice(0, 200)}...\n- **Why it matters**: Mastering this concept forms the foundation for solving complex exam problems in ${noteSubject}.`;
    } else if (action === 'quiz') {
      return {
        questions: [
          {
            question: `What is the main focus of ${noteTitle}?`,
            options: [`Core principles of ${noteSubject}`, `Unrelated topics`, `Historical dates`, `Random definitions`],
            correctAnswer: 0,
            explanation: `The note specifically covers core principles in ${noteSubject}.`,
          },
          {
            question: `Which subject does "${noteTitle}" belong to?`,
            options: [`${noteSubject}`, `General Studies`, `Physical Education`, `Music`],
            correctAnswer: 0,
            explanation: `This study note is categorized under ${noteSubject}.`,
          },
        ],
      };
    } else {
      return {
        flashcards: [
          {
            front: `What is the core topic of this note?`,
            back: `${noteTitle} (${noteSubject})`,
          },
          {
            front: `Key Concept Summary`,
            back: `${noteContent.slice(0, 100)}...`,
          },
        ],
      };
    }
  }

  try {
    console.log(`[Gemini Note AI] Prompting model '${modelName}' for action '${action}'...`);
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 1500,
      },
    });

    const rawText = response.text ? response.text.trim() : '';
    if (!rawText) {
      throw new Error('Gemini API returned an empty note AI response.');
    }

    // Parse JSON for quiz and flashcards
    if (action === 'quiz' || action === 'flashcards') {
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      try {
        const parsed = JSON.parse(cleanJson);
        return parsed;
      } catch (parseErr) {
        console.error('[Gemini JSON Parse Error] Raw text:', rawText);
        throw new Error('Failed to parse AI output into structured format.');
      }
    }

    return rawText;
  } catch (err) {
    console.error(`[Gemini Note AI Error] Action: ${action} | Message:`, err.message);
    throw err;
  }
};

/**
 * Fallback study plan generator when Gemini API Key is unconfigured
 */
const generateSmartFreeStudyPlan = (studentContext, preferences = {}) => {
  const dailyMinutes = preferences.dailyMinutes || 120;
  const daysCount = preferences.days || 7;
  
  // Extract topics/subjects from context
  const examMatches = [...studentContext.matchAll(/Exam: "([^"]+)"/g)].map(m => m[1]);
  const taskMatches = [...studentContext.matchAll(/Task: "([^"]+)"|"(.*?)" \| Subject: ([\w\s]+)/g)];
  const goalMatches = [...studentContext.matchAll(/Goal: "([^"]+)"/g)].map(m => m[1]);
  const noteMatches = [...studentContext.matchAll(/Note: "([^"]+)" \| Subject: ([\w\s]+)/g)];

  const subjects = examMatches.length > 0 ? examMatches : ['DBMS', 'DSA', 'Physics'];
  
  const days = [];
  const startDate = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    const currentSub = subjects[i % subjects.length];
    const secondSub = subjects[(i + 1) % subjects.length];

    const session1Minutes = Math.min(60, Math.floor(dailyMinutes * 0.5));
    const session2Minutes = Math.min(45, Math.floor(dailyMinutes * 0.35));
    const session3Minutes = Math.max(15, dailyMinutes - session1Minutes - session2Minutes);

    const sessions = [
      {
        title: `${currentSub} Core Review`,
        subject: currentSub,
        durationMinutes: session1Minutes,
        type: 'exam-prep',
        reason: `Priority focus for ${currentSub} upcoming syllabus`,
      },
      {
        title: `${secondSub} Practice Session`,
        subject: secondSub,
        durationMinutes: session2Minutes,
        type: 'practice',
        reason: `Targeted problem solving for ${secondSub}`,
      },
    ];

    if (session3Minutes >= 15) {
      sessions.push({
        title: `${currentSub} Quick Revision`,
        subject: currentSub,
        durationMinutes: session3Minutes,
        type: 'revision',
        reason: 'Daily recall & formula check',
      });
    }

    days.push({
      date: dateStr,
      sessions,
    });
  }

  return { days };
};

/**
 * Generate AI Study Plan using Gemini API
 * @param {string} studentContext - Structured prompt containing actual student data
 * @param {Object} preferences - { dailyMinutes, days, focus }
 */
const generateStudyPlan = async (studentContext, preferences = {}) => {
  let apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  apiKey = apiKey.replace(/^["']|["']$/g, '');

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey === 'your_gemini_api_key_here') {
    console.log('[StudyPulse AI] No GEMINI_API_KEY configured for planner. Using Smart Free Engine fallback.');
    return generateSmartFreeStudyPlan(studentContext, preferences);
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  const systemInstruction = `You are the "StudyPulse AI Study Planner", an expert academic scheduling assistant. Your sole purpose is to generate an optimized, personalized, highly realistic study plan based ONLY on the student's actual StudyPulse data provided in the context.

CRITICAL RULES:
1. ONLY use information supplied in the student context (exams, tasks, goals, notes, analytics, calendar commitments). DO NOT invent fake exams, fake tasks, fake goals, or fake subjects.
2. Total daily planned study time (sum of all session durations for a single day) MUST NOT EXCEED the student's requested daily study limit (${preferences.dailyMinutes || 120} minutes/day).
3. Always generate plans starting from the provided "Today's Date" for exactly the requested number of days (${preferences.days || 7} days).
4. Reason about priorities effectively:
   - Exams occurring soon receive top priority.
   - Overdue tasks and high-priority pending tasks are prioritized.
   - Active goals and milestone deadlines are incorporated.
   - Subjects with lower performance scores or higher focus preferences receive extra practice/revision time.
5. Avoid scheduling sessions during existing calendar commitments.
6. Provide a concise, clear "reason" for why each study session was included.
7. Allowed session types MUST BE one of: "revision", "practice", "assignment", "exam-prep", "goal", "reading".
8. RESPOND ONLY WITH A RAW JSON OBJECT (no markdown code blocks, no text before or after the JSON) with structure:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "title": "Specific Topic or Task Title",
          "subject": "Subject Name",
          "durationMinutes": 45,
          "type": "exam-prep",
          "reason": "Clear explanation of priority"
        }
      ]
    }
  ]
}`;

  const userPrompt = `Please generate a personalized study plan using the following student workspace context and preferences:

${studentContext}

PREFERENCES:
- Available Daily Study Time: ${preferences.dailyMinutes || 120} minutes
- Planning Horizon: ${preferences.days || 7} days
- Focus Priorities: ${(preferences.focus || []).join(', ')}

Return ONLY the valid raw JSON object.`;

  try {
    console.log(`[Gemini AI Planner] Generating study plan with model '${modelName}'...`);
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 2500,
      },
    });

    const rawText = response.text ? response.text.trim() : '';
    if (!rawText) {
      throw new Error('Gemini API returned an empty response for study plan.');
    }

    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (err) {
    console.error(`[Gemini AI Planner Error] Message: ${err.message}. Falling back to Smart Free Planner Engine.`);
    return generateSmartFreeStudyPlan(studentContext, preferences);
  }
};

module.exports = {
  generateAIResponse,
  generateSmartFreeAIResponse,
  generateNoteAIResponse,
  generateStudyPlan,
  generateSmartFreeStudyPlan,
};


