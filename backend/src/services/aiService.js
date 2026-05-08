const { generateWithOllama } = require('../config/ollama');

const techModel = process.env.OLLAMA_TECH_MODEL || 'deepseek-coder:1.3b';
const hrModel = process.env.OLLAMA_HR_MODEL || 'phi3:mini';
const evalModel = process.env.OLLAMA_EVAL_MODEL || 'deepseek-r1:1.5b';
const feedbackModel = process.env.OLLAMA_FEEDBACK_MODEL || 'gemma2:2b';

function buildFallbackQuestion({ domain, difficulty, interviewType }) {
  if (interviewType === 'HR') {
    return `Tell me about a time you handled a challenge while learning ${domain}.`;
  }

  return `Explain the core concept of ${domain} at a ${difficulty.toLowerCase()} level and how you would use it in a project.`;
}

function extractJson(text) {
  if (!text) {
    return null;
  }

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch (_error) {
    return null;
  }
}

async function generateInterviewQuestion({ domain, difficulty, interviewType, previousQuestions = [] }) {
  const model = interviewType === 'HR' ? hrModel : techModel;
  const prompt = `
Generate one ${difficulty.toLowerCase()} level ${interviewType.toLowerCase()} interview question for a student preparing for ${domain}.
Keep it practical, concise, and suitable for a viva or mock interview.
Avoid numbering, extra explanation, or multiple questions.
${previousQuestions.length ? `Do not repeat these questions: ${previousQuestions.join(' | ')}` : ''}
Respond in English only.
`;

  const response = await generateWithOllama({
    model,
    prompt,
    system: 'You are an interview question generator. Return a single clear question only.',
  });

  return (response || buildFallbackQuestion({ domain, difficulty, interviewType })).trim();
}

async function evaluateAnswer({ question, answer, domain, difficulty, interviewType }) {
  const prompt = `
You are evaluating a mock interview answer.

Question: ${question}
Answer: ${answer}
Domain: ${domain}
Difficulty: ${difficulty}
Interview type: ${interviewType}

Return ONLY valid JSON in this format:
{
  "score": 0,
  "strengths": "",
  "weaknesses": "",
  "suggestions": "",
  "feedback": ""
}

Use a score out of 10. Be fair, practical, and student-friendly.
Respond in English only.
`;

  const response = await generateWithOllama({
    model: evalModel,
    prompt,
    system: 'You are a strict but supportive interview evaluator. Output only JSON.',
  });

  const parsed = extractJson(response);

  if (parsed) {
    return normalizeEvaluation(parsed);
  }

  return fallbackEvaluation({ question, answer });
}

async function generateFeedbackSummary({ score, strengths, weaknesses, suggestions }) {
  const prompt = `
Create a short professional interview feedback summary.

Score: ${score}/10
Strengths: ${strengths}
Weaknesses: ${weaknesses}
Suggestions: ${suggestions}

Keep it to 2-3 lines.
Respond in English only.
`;

  const response = await generateWithOllama({
    model: feedbackModel,
    prompt,
    system: 'You generate concise feedback for students preparing for interviews.',
  });

  return response?.trim() || `Your response shows a ${score}/10 performance. Focus on clarity, structure, and more precise examples.`;
}

function normalizeEvaluation(evaluation) {
  const score = Number(evaluation.score ?? 0);
  const strengths = String(evaluation.strengths ?? 'Clear attempt at answering the question.');
  const weaknesses = String(evaluation.weaknesses ?? 'Could be more structured and specific.');
  const suggestions = String(evaluation.suggestions ?? 'Add examples and explain your reasoning more clearly.');
  const feedback = String(evaluation.feedback ?? 'Keep improving with focused practice.');

  return { score: clampScore(score), strengths, weaknesses, suggestions, feedback };
}

function fallbackEvaluation({ question, answer }) {
  const hasSubstance = answer && answer.trim().length > 40;
  const score = hasSubstance ? 7.2 : 5.4;

  return {
    score,
    strengths: 'You attempted to answer the question and showed domain awareness.',
    weaknesses: 'The response can be more structured, concise, and technically accurate.',
    suggestions: `Revise the concept behind: ${question}. Add a short example and explain your reasoning in steps.`,
    feedback: 'Strong base, but you should improve clarity, structure, and depth with regular practice.',
  };
}

function clampScore(score) {
  if (Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(10, Number(score.toFixed(2))));
}

module.exports = {
  generateInterviewQuestion,
  evaluateAnswer,
  generateFeedbackSummary,
};
