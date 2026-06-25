import express from 'express';
import appointmentsRouter from './routes/appointments.js';
import workoutRouter from './routes/workouts.js';
import usersRouter from './routes/users.js';
import reviewsRouter from './routes/reviews.js';
import milestonesRouter from './routes/milestones.js';
-> Feedback: missing 'import process from 'process'; - this will help the PORT variable to recognize the use of the 'proces' module when its used as an object, otherwise it may return an error.

const app = express();
const PORT = process.env.PORT || 3000;

// in express the way we serve static files is with the express app.use(express.static("folder-name"))
app.use(express.static('frontend'));

app.use(express.json());
app.use('/api', appointmentsRouter);
app.use('/api', workoutRouter);
app.use('/api', usersRouter);
app.use('/api', reviewsRouter);
app.use('/api', milestonesRouter);

app.listen(PORT, () => {
  console.log(`Created a server listening on port ${PORT}`);
});
