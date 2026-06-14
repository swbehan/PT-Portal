import express from 'express';
import appointmentsCollection from '../db/appointment-db.js';

const appointmentsRouter = express.Router();

// THIS IS A DATA ENDPOINT that the route will send information back to the client side
appointmentsRouter.get('/appointments-not-booked', async (req, res) => {
  try {
    const appointmentsUnbooked = await appointmentsCollection.getAppointments({
      query: { booked: false },
    });
    res.json({
      appointmentsUnbooked,
    });
  } catch (error) {
    console.error('Error fetching appointments that are not booked', error);
    res.status(500).json({ error: 'Internal Server Error', appointments: [] });
  }
});

appointmentsRouter.get('/appointments-booked', async (req, res) => {
  try {
    const appointments = await appointmentsCollection.getAppointments({
      query: { booked: true },
    });
    res.json({
      appointments,
    });
  } catch (error) {
    console.error('Error fetching booked appointments', error);
    res.status(500).json({ error: 'Internal Server Error', appointments: [] });
  }
});

appointmentsRouter.post('/add-appointment-availability', async (req, res) => {
  try {
    console.log(req.body);
    const result = await appointmentsCollection.postAppointments(req.body);
    res.status(201).json({ message: 'Successfully posted unbooked appointment', result });
  } catch (error) {
    console.error('Error posting data to the DB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

appointmentsRouter.delete('/delete-appointment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await appointmentsCollection.deleteAppointment(id);
    res.status(200).json({ message: 'Successfully deleted unbooked appointment', result });
  } catch (error) {
    console.error('Error deleting appointment from the DB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default appointmentsRouter;
