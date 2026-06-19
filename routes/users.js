import { Router } from 'express';
import usersCollection from '../db/users-db.js';

const usersRouter = Router();

// Returns the list of users for a role (used to populate dropdowns).
usersRouter.get('/users', async (req, res) => {
  try {
    const role = req.query.role || null;
    const users = await usersCollection.getUsersByRole(role);
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mocked auth: returns the single strict persona that is "signed in" for a role.
usersRouter.get('/current-user', async (req, res) => {
  try {
    const role = req.query.role || null;
    const user = await usersCollection.getCurrentUser(role);
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching current user', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default usersRouter;
