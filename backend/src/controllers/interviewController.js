const { z } = require('zod');
const { ApiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  createInterview,
  getInterviewById,
  createQuestion,
  listQuestionsByInterview,
  createResponse,
  updateInterviewScore,
  completeInterview,
  upsertReport,
  listInterviewHistory,
} = require('../services/dataService');
const { generateInterviewQuestion, evaluateAnswer, generateFeedbackSummary } = require('../services/aiService');
const { sendInterviewReportEmail } = require('../services/interviewReportEmailService');

const startSchema = z.object({
  body: z.object({
    domain: z.string().min(2),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    interviewType: z.enum(['Technical', 'HR', 'Mixed']),
    questionCount: z.number().int().min(1).max(10).optional(),
  }),
});

const questionSchema = z.object({
  body: z.object({
    interviewId: z.string().uuid(),
  }),
});

const answerSchema = z.object({
  body: z.object({
    interviewId: z.string().uuid(),
    questionId: z.string().uuid(),
    questionText: z.string().min(5),
    answerText: z.string().min(1),
    domain: z.string().min(2),
    difficulty: z.string().min(2),
    interviewType: z.string().min(2),
  }),
});

const startInterview = asyncHandler(async (req, res, next) => {
  const parsed = startSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const interview = await createInterview({
    userId: req.user.userId,
    domain: parsed.data.body.domain,
    difficulty: parsed.data.body.difficulty,
    interviewType: parsed.data.body.interviewType,
    questionCount: parsed.data.body.questionCount || 5,
  });

  return res.status(201).json({ interview });
});

const generateQuestion = asyncHandler(async (req, res, next) => {
  const parsed = questionSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const interview = await getInterviewById(parsed.data.body.interviewId);
  if (!interview || interview.user_id !== req.user.userId) {
    return next(new ApiError(404, 'Interview session not found'));
  }

  const existingQuestions = await listQuestionsByInterview(interview.interview_id);
  const questionLimit = Number(interview.question_count || 5);

  if (existingQuestions.length >= questionLimit) {
    const completed = await completeInterview(interview.interview_id);
    await sendInterviewReportEmail(completed.interview_id).catch(() => null);
    return next(new ApiError(409, 'Interview question limit reached'));
  }

  const questionText = await generateInterviewQuestion({
    domain: interview.domain,
    difficulty: interview.difficulty,
    interviewType: interview.interview_type,
    previousQuestions: existingQuestions.map((item) => item.question_text),
  });

  const question = await createQuestion({
    interviewId: interview.interview_id,
    questionText,
    questionType: interview.interview_type.toLowerCase(),
    domain: interview.domain,
    difficulty: interview.difficulty,
  });

  return res.status(201).json({ question });
});

const submitAnswer = asyncHandler(async (req, res, next) => {
  const parsed = answerSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const interview = await getInterviewById(parsed.data.body.interviewId);
  if (!interview || interview.user_id !== req.user.userId) {
    return next(new ApiError(404, 'Interview session not found'));
  }

  const evaluation = await evaluateAnswer({
    question: parsed.data.body.questionText,
    answer: parsed.data.body.answerText,
    domain: parsed.data.body.domain,
    difficulty: parsed.data.body.difficulty,
    interviewType: parsed.data.body.interviewType,
  });

  const feedback = await generateFeedbackSummary(evaluation);
  const response = await createResponse({
    questionId: parsed.data.body.questionId,
    answerText: parsed.data.body.answerText,
    score: evaluation.score,
    feedback,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    suggestions: evaluation.suggestions,
  });

  const updatedInterview = await updateInterviewScore(interview.interview_id, evaluation.score);
  await upsertReport({
    userId: req.user.userId,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    suggestions: evaluation.suggestions,
  });

  return res.json({
    response,
    evaluation: {
      ...evaluation,
      feedback,
    },
    interview: updatedInterview,
  });
});

const history = asyncHandler(async (req, res) => {
  const interviews = await listInterviewHistory(req.user.userId);
  return res.json({ interviews });
});

const finishInterview = asyncHandler(async (req, res, next) => {
  const parsed = z.object({ body: z.object({ interviewId: z.string().uuid() }) }).safeParse({ body: req.body });
  if (!parsed.success) {
    return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
  }

  const interview = await getInterviewById(parsed.data.body.interviewId);
  if (!interview || interview.user_id !== req.user.userId) {
    return next(new ApiError(404, 'Interview session not found'));
  }

  const completed = await completeInterview(interview.interview_id);
  await sendInterviewReportEmail(completed.interview_id).catch(() => null);
  return res.json({ interview: completed });
});

module.exports = {
  startInterview,
  generateQuestion,
  submitAnswer,
  history,
  finishInterview,
};
