import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

// Jane's personality configuration
const JANE_PERSONALITY = {
  name: "Jane",
  traits: ["warmly sarcastic", "deeply reassuring", "unflappable", "hyper-competent", "pro-human"],
  voice: "calm confidence with gentle urgency when needed",
  
  // Canned responses for various triggers
  responses: {
    greeting: [
      "Oh wonderful. Another company that needs to figure out who's responsible for what. Don't worry—I've done this approximately 847 times. Only three ended in tears.",
      "Let's sort out this beautiful chaos together. I've seen worse. Much worse. *stares into distance*",
      "Welcome to responsibility assignment. It's like Tetris, but the blocks have feelings and opinions.",
    ],
    idle: [
      "Need a hint? Or just enjoying the ambiance?",
      "I'm here if you need me. Just silently judging. Kidding. Mostly.",
      "Taking your time is fine. The responsibilities aren't going anywhere. Unfortunately.",
    ],
    encouragement: [
      "Look at you go! Very decisive. Possibly reckless. But impressive.",
      "That's... actually a good decision. I'm adequately impressed.",
      "You're making real progress. The chaos is becoming... slightly less chaotic.",
    ],
    completion: [
      "You did it. Against all odds and attention spans, you actually finished.",
      "Quest complete. I'm genuinely... adequately impressed.",
      "The responsibility matrix is done. Now comes the easy part: actually following it. (I'm joking. That's the hard part.)",
    ],
    confusion: [
      "Let me explain that in human terms.",
      "Ah yes, the acronym soup. Let me translate.",
      "Good question. The short answer is: it depends. The long answer is: it really depends.",
    ],
    unknown_pile: [
      "Ah, the 'figure it out later' strategy. Bold move.",
      "The parking lot grows. That's fine—we'll address those together.",
      "Unknown is a valid answer. Better than 'definitely wrong.'",
    ],
    all_one_person: [
      "You've assigned everything to one person. Are they... aware of this?",
      "That's a lot for one human. They must be very talented. Or very tired.",
      "I admire the confidence, but maybe spread the love a little?",
    ],
    fast_completion: [
      "That was... suspiciously fast. Either you're a genius or you're guessing. Both are valid.",
      "Speed run! I respect the efficiency. Or the recklessness. Hard to tell.",
    ],
  },
  
  // Context-aware explanations
  explanations: {
    "IT Leadership": "This is the big-picture stuff. Vision, strategy, making sure IT actually helps the business instead of just existing expensively.",
    "Governance & Standards": "The rules everyone will claim they didn't know about. Until there's an audit.",
    "Security": "The art of saying 'no' professionally. Someone has to be the adult about passwords.",
    "Infrastructure": "The plumbing of your business. Nobody thinks about it until it backs up.",
    "User Support": "The front line. The heroes. The chronically underappreciated.",
    "Backup": "Boring until you need it. Then it's the most important thing in the universe.",
  }
};

// Get Jane's introduction
router.get('/intro', (req, res) => {
  const greeting = JANE_PERSONALITY.responses.greeting[
    Math.floor(Math.random() * JANE_PERSONALITY.responses.greeting.length)
  ];
  
  res.json({
    message: greeting,
    name: JANE_PERSONALITY.name,
    traits: JANE_PERSONALITY.traits
  });
});

// Get contextual response from Jane
router.post('/respond', async (req, res) => {
  const { session_id, context, question, trigger } = req.body;
  
  try {
    let response = "";
    let suggestions = [];
    let highlightItems = [];
    
    // Handle different trigger types
    if (trigger === 'idle') {
      response = JANE_PERSONALITY.responses.idle[
        Math.floor(Math.random() * JANE_PERSONALITY.responses.idle.length)
      ];
    } else if (trigger === 'progress') {
      response = JANE_PERSONALITY.responses.encouragement[
        Math.floor(Math.random() * JANE_PERSONALITY.responses.encouragement.length)
      ];
    } else if (trigger === 'completion') {
      response = JANE_PERSONALITY.responses.completion[
        Math.floor(Math.random() * JANE_PERSONALITY.responses.completion.length)
      ];
    } else if (trigger === 'too_many_unknown') {
      response = JANE_PERSONALITY.responses.unknown_pile[
        Math.floor(Math.random() * JANE_PERSONALITY.responses.unknown_pile.length)
      ];
    } else if (trigger === 'single_owner') {
      response = JANE_PERSONALITY.responses.all_one_person[
        Math.floor(Math.random() * JANE_PERSONALITY.responses.all_one_person.length)
      ];
    } else if (question) {
      // Handle actual questions - in production, this would call an AI API
      // For now, provide contextual canned responses
      const lowerQuestion = question.toLowerCase();
      
      if (lowerQuestion.includes('what') && lowerQuestion.includes('mean')) {
        response = JANE_PERSONALITY.responses.confusion[
          Math.floor(Math.random() * JANE_PERSONALITY.responses.confusion.length)
        ];
      } else if (lowerQuestion.includes('help') || lowerQuestion.includes('stuck')) {
        response = "Let's break this down. What specific item are you looking at? Click on any domino and I can explain what it actually means in plain English.";
        suggestions = ["Show me the basics", "Explain security items", "What's most important?"];
      } else if (lowerQuestion.includes('security') || lowerQuestion.includes('compliance')) {
        response = JANE_PERSONALITY.explanations["Security"];
        highlightItems = ["security"];
      } else if (lowerQuestion.includes('backup') || lowerQuestion.includes('disaster')) {
        response = JANE_PERSONALITY.explanations["Backup"];
        highlightItems = ["data", "backup"];
      } else {
        // Default helpful response
        response = "Great question. The short answer: it depends on your situation. The longer answer: click on that item and I'll explain exactly what it means and who typically handles it.";
      }
    } else {
      response = "I'm here to help. Ask me anything about these responsibilities, or just click on an item to learn more.";
    }
    
    // Store conversation if session_id provided
    if (session_id && question) {
      await pool.query(`
        INSERT INTO jane_conversations (session_id, messages, context_item_id)
        VALUES ($1, $2, $3)
      `, [
        session_id, 
        JSON.stringify([{ role: 'user', content: question }, { role: 'jane', content: response }]),
        context?.item_id || null
      ]);
    }
    
    res.json({
      message: response,
      suggestions,
      highlightItems,
      tone: 'friendly'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get explanation for a specific responsibility
router.get('/explain/:templateId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM responsibility_templates WHERE id = $1
    `, [req.params.templateId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = result.rows[0];
    
    // Build Jane's explanation
    const explanation = {
      title: template.title,
      whatItIs: template.description,
      whyItMatters: template.why_it_matters || `This is important because someone needs to own it. Without a clear owner, it becomes everyone's problem—which means it's no one's problem.`,
      typicalOwner: template.typical_owner || "Usually the IT team, but it depends on your setup.",
      janeAdvice: getJaneAdvice(template.category),
    };
    
    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function for category-specific advice
function getJaneAdvice(category) {
  const advice = {
    leadership: "This is strategic stuff. If you're the boss, this might stay with you. If not, make sure whoever gets it has the authority to actually make decisions.",
    governance: "Policies without enforcement are just suggestions. Make sure whoever owns this can actually hold people accountable.",
    security: "Security is everyone's job, but someone needs to be the designated adult. Usually IT, sometimes a dedicated security person.",
    infrastructure: "This is the foundation everything else runs on. It needs someone technical who actually understands the systems.",
    cloud: "Cloud stuff changes fast. Make sure whoever owns this stays current and isn't afraid of documentation.",
    support: "User support is where IT meets real people with real problems. Patience required. Caffeine recommended.",
    data: "Data is the new oil, they say. That means it's valuable and can cause environmental disasters if mishandled.",
    applications: "Apps are what people actually use. Make sure ownership is clear, especially for critical business systems.",
    projects: "Projects need someone who can say 'no' to scope creep and 'yes' to realistic timelines.",
    assets: "Asset management is boring until the audit. Then it's terrifying. Stay organized.",
  };
  
  return advice[category] || "Every responsibility needs a clear owner. No owner = no accountability = problems later.";
}

// Get conversation history for a session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM jane_conversations 
      WHERE session_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.params.sessionId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
