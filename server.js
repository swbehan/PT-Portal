import express from 'express';
import appointmentsRouter from './routes/appointments.js';
import workoutRouter from './routes/workouts.js';
import usersRouter from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

// in express the way we serve static files is with the express app.use(express.static("folder-name"))
app.use(express.static('frontend'));

app.use(express.json());
app.use('/api', appointmentsRouter);
app.use('/api', workoutRouter);
app.use('/api', usersRouter);

// second parameter is the function callback when the server is ready and running.
// The callback function you give will ONLY be called directly by express.
// Since we are giving a callback function, we are not calling it anywere, Express will us that callback function when the server is ready and connected to the port
app.listen(PORT, () => {
  console.log(`Created a server listening on port ${PORT}`);
});
