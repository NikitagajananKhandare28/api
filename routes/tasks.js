const express = require('express');
const { pool } = require('../db/db');
const { requireAuth } = require('../middleware/auth');
const { validateTaskCreate, validateTaskUpdate } = require('../utils/validate');

const router = express.Router();

router.use(requireAuth);

// GET /api/tasks
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const task = result.rows[0];
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post('/', async (req, res, next) => {
  try {
    const errors = validateTaskCreate(req.body || {});
    if (errors.length) return res.status(400).json({ errors });

    const { title, description = '', completed = false } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, completed) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description, completed]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res, next) => {
  try {
    const existingResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    const errors = validateTaskUpdate(req.body || {});
    if (errors.length) return res.status(400).json({ errors });

    const title = req.body.title !== undefined ? req.body.title : existing.title;
    const description = req.body.description !== undefined ? req.body.description : existing.description;
    const completed = req.body.completed !== undefined ? req.body.completed : existing.completed;

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = now() WHERE id = $4 RETURNING *`,
      [title, description, completed, existing.id]
    );
    res.status(200).json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existingResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    await pool.query('DELETE FROM tasks WHERE id = $1', [existing.id]);
    res.status(200).json({ message: 'Task deleted.', id: existing.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
