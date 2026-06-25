import { Router } from 'express';
import milestonesCollection from '../db/milestone-db.js';
import mongodb from 'mongodb';
const { ObjectId } = mongodb;

const milestonesRouter = Router();
-> Great job with the CRUD operations for each route and not mistakingly doing server-side rendering rather than client-side rendering!
milestonesRouter.get('/milestones', async (req, res) => {
  try {
    const patientId = req.query.patientId || null;
    const query = {};
    if (patientId) query.patientId = new ObjectId(patientId);

    const milestones = await milestonesCollection.getMilestones({ query });
    res.status(200).json({ milestones });
  } catch (error) {
    console.error('Error fetching milestones', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

milestonesRouter.post('/milestones', async (req, res) => {
  try {
    const result = await milestonesCollection.postMilestoneToDb(req.body);
    res.status(201).json({ message: 'Successfully posted milestone', result });
  } catch (error) {
    console.error('Error posting milestone to the DB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default milestonesRouter;
