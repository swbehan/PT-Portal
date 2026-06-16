import { Router } from 'express';
import usersCollection from '../db/users-db.js';

const usersRouter = Router();

usersRouter.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const users = await usersCollection.getUser({ role });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default usersRouter;