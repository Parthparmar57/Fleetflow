import express from 'express';

const router = express.Router();

// Example route
router.get('/users', (req, res) => {
  res.json({ message: 'Get all users' });
});

router.post('/users', (req, res) => {
  res.json({ message: 'Create a new user' });
});

export default router;
