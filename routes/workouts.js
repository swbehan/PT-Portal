import express from 'express';
import workoutsCollection from '../db/workout-db.js';

import mongodb from 'mongodb';

const { ObjectId } = mongodb;

const workoutRouter = express.Router();

// GET /workouts -> PT passes nothing (all plans); patient passes ?patientId=...
workoutRouter.get('/workouts', async (req, res) => {
  try {
    const query = {};
    if (req.query.patientId) {
      // Patient view: only their plans
      query.patientId = new ObjectId(req.query.patientId);
    }
    const workouts = await workoutsCollection.getWorkouts({ query });
    res.json({ workouts });
  } catch (error) {
    console.error('Error fetcing workouts', error);
    res.status(500).json({ error: 'Internal Server Error', workouts: [] });
  }
});

// POST /workouts -> Create a plan
workoutRouter.post('/workouts', async (req, res) => {
  try {
    const result = await workoutsCollection.postWorkouts(req.body);
    res
      .status(201)
      .json({ message: 'Successfully created workout plan', result });
  } catch (error) {
    console.error('Error posting workout to the DB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /workouts/:id -> Going to edit a plan
workoutRouter.put('/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await workoutsCollection.updateWorkout(id, req.body);
    res
      .status(200)
      .json({ message: 'Successfully updated workout plan', result });
  } catch (error) {
    console.error('Error updating workout in DB', error);
    res.status(500).json({ error: 'Internal Server Error ' });
  }
});

// DELETE /workouts/:id/exercises/:exerciseId
workoutRouter.delete(
  '/workouts/:id/exercises/:exerciseId',
  async (req, res) => {
    try {
      const { id, exerciseId } = req.params;
      const result = await workoutsCollection.deleteExercise(id, exerciseId);
      res
        .status(200)
        .json({ message: 'Successfully deleted exercise', result });
    } catch (error) {
      console.error('Error deleting exercise from the DB', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

export default workoutRouter;
