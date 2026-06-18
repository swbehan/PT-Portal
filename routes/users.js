import express from 'express';
import userCollection from '../db/users-db.js';

const usersRouter = express.Router();

// GET /users?role=patient
usersRouter.get('/users', async (req, res) => {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    const users = await userCollection.getUsers({ query });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ error: 'Internal Server Error', users: [] });
  }
});

export default usersRouter;
