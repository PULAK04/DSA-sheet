import { Router } from 'express';
import { Topic } from '../models/Topic.js';
import { Subtopic } from '../models/Subtopic.js';
import { Question } from '../models/Question.js';
import { optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/tree', async (_req, res, next) => {
  try {
    const [topics, subtopics, questions] = await Promise.all([
      Topic.find().sort({ createdAt: 1 }).lean(),
      Subtopic.find().sort({ createdAt: 1 }).lean(),
      Question.find().sort({ createdAt: 1 }).lean()
    ]);

    const questionMap = new Map();
    for (const q of questions) {
      const id = String(q.subtopicId);
      if (!questionMap.has(id)) questionMap.set(id, []);
      questionMap.get(id).push(q);
    }

    const subtopicMap = new Map();
    for (const s of subtopics) {
      const id = String(s.topicId);
      if (!subtopicMap.has(id)) subtopicMap.set(id, []);
      subtopicMap.get(id).push({
        ...s,
        questions: questionMap.get(String(s._id)) || []
      });
    }

    const tree = topics.map((topic) => ({
      ...topic,
      subtopics: subtopicMap.get(String(topic._id)) || []
    }));

    res.json({ tree });
  } catch (error) {
    next(error);
  }
});

router.post('/topics', requireAdmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Topic name is required.' });
    const topic = await Topic.create({ name });
    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
});

router.patch('/topics/:id', requireAdmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Topic name is required.' });
    const topic = await Topic.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!topic) return res.status(404).json({ message: 'Topic not found.' });
    res.json(topic);
  } catch (error) { next(error); }
});

router.delete('/topics/:id', requireAdmin, async (req, res, next) => {
  try {
    const subtopics = await Subtopic.find({ topicId: req.params.id }).select('_id').lean();
    const ids = subtopics.map((s) => s._id);
    await Question.deleteMany({ subtopicId: { $in: ids } });
    await Subtopic.deleteMany({ topicId: req.params.id });
    await Topic.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
});

router.post('/topics/:topicId/subtopics', requireAdmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Subtopic name is required.' });
    const topic = await Topic.findById(req.params.topicId).lean();
    if (!topic) return res.status(404).json({ message: 'Topic not found.' });
    const subtopic = await Subtopic.create({ topicId: topic._id, name });
    res.status(201).json(subtopic);
  } catch (error) { next(error); }
});

router.patch('/subtopics/:id', requireAdmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Subtopic name is required.' });
    const subtopic = await Subtopic.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!subtopic) return res.status(404).json({ message: 'Subtopic not found.' });
    res.json(subtopic);
  } catch (error) { next(error); }
});

router.delete('/subtopics/:id', requireAdmin, async (req, res, next) => {
  try {
    await Question.deleteMany({ subtopicId: req.params.id });
    await Subtopic.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
});

router.post('/subtopics/:subtopicId/questions', requireAdmin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Question name is required.' });
    const subtopic = await Subtopic.findById(req.params.subtopicId).lean();
    if (!subtopic) return res.status(404).json({ message: 'Subtopic not found.' });
    const question = await Question.create({ subtopicId: subtopic._id, name });
    res.status(201).json(question);
  } catch (error) { next(error); }
});

router.get('/questions/:id', async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    res.json(question);
  } catch (error) { next(error); }
});

router.patch('/questions/:id', requireAdmin, async (req, res, next) => {
  try {
    const allowed = [
      'name', 'difficulty', 'externalUrl', 'platform', 'youtubeUrl',
      'tags', 'companies', 'priority', 'revisions', 'notes', 'approaches'
    ];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];
    if ('name' in updates && !String(updates.name).trim()) {
      return res.status(400).json({ message: 'Question name is required.' });
    }
    if ('name' in updates) updates.name = String(updates.name).trim();
    if ('difficulty' in updates && updates.difficulty === '') updates.difficulty = null;
    if ('priority' in updates) updates.priority = Math.max(0, Number(updates.priority) || 0);
    if ('revisions' in updates) updates.revisions = Math.max(0, Number(updates.revisions) || 0);
    const question = await Question.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    res.json(question);
  } catch (error) { next(error); }
});

router.delete('/questions/:id', requireAdmin, async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
