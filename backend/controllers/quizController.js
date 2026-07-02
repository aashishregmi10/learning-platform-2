import asyncHandler from "express-async-handler";

import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Chapter from "../models/Chapter.js";
import { assertSubjectWritable } from "../utils/teacherScope.js";
import { canAccessChapter } from "../utils/access.js";

// strip answer keys for student-facing responses
const publicQuiz = (quiz) => ({
  _id: quiz._id,
  chapter: quiz.chapter,
  title: quiz.title,
  description: quiz.description,
  passingScore: quiz.passingScore,
  timeLimitMinutes: quiz.timeLimitMinutes,
  maxAttempts: quiz.maxAttempts,
  questions: quiz.questions.map((q) => ({ questionText: q.questionText, options: q.options, points: q.points })),
});

// @route POST /api/quizzes  (teacher/admin-scoped)
export const createQuiz = asyncHandler(async (req, res) => {
  const { chapter: chapterId, title, description, questions, passingScore, timeLimitMinutes, maxAttempts, isPublished } = req.body;
  const chapter = await Chapter.findOne({ _id: chapterId, isDeleted: false });
  if (!chapter) {
    res.status(404);
    throw new Error("Chapter not found");
  }
  await assertSubjectWritable(req.user, chapter.subject, res);

  const quiz = await Quiz.create({
    chapter: chapterId,
    subject: chapter.subject,
    title,
    description,
    questions,
    passingScore,
    timeLimitMinutes,
    maxAttempts,
    isPublished: !!isPublished,
  });
  await Chapter.findByIdAndUpdate(chapterId, { $inc: { quizCount: 1 } });
  res.status(201).json({ data: quiz, message: "Quiz created" });
});

// @route GET /api/quizzes/list?chapter=  (staff sees keys; students would use /:id)
export const listQuizzes = asyncHandler(async (req, res) => {
  const { chapter } = req.query;
  const quizzes = await Quiz.find({ ...(chapter && { chapter }), isDeleted: false }).sort({ createdAt: 1 });
  res.status(200).json({ data: quizzes, message: "OK" });
});

// @route GET /api/quizzes/:id  (student, gated) — answer keys stripped
export const getQuizForStudent = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false });
  if (!quiz || !quiz.isPublished) {
    res.status(404);
    throw new Error("Quiz not available");
  }
  const chapter = await Chapter.findById(quiz.chapter).select("subject isFreePreview");
  const studentId = req.user.role === "student" ? req.user._id : null;

  if (req.user.role === "student") {
    const allowed = await canAccessChapter({ chapter, studentId });
    if (!allowed) {
      res.status(403);
      throw new Error("Purchase required to take this quiz");
    }
  }

  const attemptsUsed = await QuizAttempt.countDocuments({ student: req.user._id, quiz: quiz._id });
  res.status(200).json({
    data: { ...publicQuiz(quiz), attemptsUsed },
    message: "OK",
  });
});

// @route POST /api/quizzes/:id/submit  (student, gated) — score server-side
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers = [] } = req.body; // [{ questionIndex, selectedOptionIndex }]
  const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false });
  if (!quiz || !quiz.isPublished) {
    res.status(404);
    throw new Error("Quiz not available");
  }
  const chapter = await Chapter.findById(quiz.chapter).select("subject isFreePreview");
  const allowed = await canAccessChapter({ chapter, studentId: req.user._id });
  if (!allowed) {
    res.status(403);
    throw new Error("Purchase required to take this quiz");
  }

  const attemptsUsed = await QuizAttempt.countDocuments({ student: req.user._id, quiz: quiz._id });
  if (quiz.maxAttempts && attemptsUsed >= quiz.maxAttempts) {
    res.status(400);
    throw new Error("No attempts remaining");
  }

  // score against stored keys
  const totalPoints = quiz.questions.reduce((a, q) => a + (q.points || 1), 0);
  let earnedPoints = 0;
  const graded = quiz.questions.map((q, i) => {
    const ans = answers.find((a) => a.questionIndex === i);
    const isCorrect = ans && ans.selectedOptionIndex === q.correctOptionIndex;
    if (isCorrect) earnedPoints += q.points || 1;
    return {
      questionIndex: i,
      selectedOptionIndex: ans?.selectedOptionIndex,
      isCorrect: !!isCorrect,
      correctOptionIndex: q.correctOptionIndex, // ok to reveal now (post-submit)
      explanation: q.explanation,
    };
  });

  const score = totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= quiz.passingScore;

  const attempt = await QuizAttempt.create({
    student: req.user._id,
    quiz: quiz._id,
    answers: graded.map(({ questionIndex, selectedOptionIndex, isCorrect }) => ({ questionIndex, selectedOptionIndex, isCorrect })),
    score,
    totalPoints,
    earnedPoints,
    passed,
    attemptNumber: attemptsUsed + 1,
    startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date(),
    submittedAt: new Date(),
  });

  res.status(200).json({
    data: { attemptNumber: attempt.attemptNumber, score, passed, earnedPoints, totalPoints, results: graded },
    message: "Submitted",
  });
});

// @route GET /api/quizzes/:id/attempts  (student) — own attempt history
export const listMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ student: req.user._id, quiz: req.params.id }).sort({ attemptNumber: -1 });
  res.status(200).json({ data: attempts, message: "OK" });
});

// @route PUT /api/quizzes/:id  (teacher/admin-scoped)
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false });
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }
  const chapter = await Chapter.findById(quiz.chapter).select("subject");
  await assertSubjectWritable(req.user, chapter.subject, res);

  ["title", "description", "questions", "passingScore", "timeLimitMinutes", "maxAttempts", "isPublished"].forEach((f) => {
    if (req.body[f] !== undefined) quiz[f] = req.body[f];
  });
  await quiz.save();
  res.status(200).json({ data: quiz, message: "Quiz updated" });
});

// @route DELETE /api/quizzes/:id  (teacher/admin-scoped)
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz || quiz.isDeleted) {
    res.status(404);
    throw new Error("Quiz not found");
  }
  const chapter = await Chapter.findById(quiz.chapter).select("subject");
  await assertSubjectWritable(req.user, chapter.subject, res);
  quiz.isDeleted = true;
  await quiz.save();
  await Chapter.findByIdAndUpdate(quiz.chapter, { $inc: { quizCount: -1 } });
  res.status(200).json({ data: {}, message: "Quiz deleted" });
});
