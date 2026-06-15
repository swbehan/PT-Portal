import express from 'express';
import appointmentsCollection from '../db/appointment-db.js';

const appointmentsRouter = express.Router();

appointmentsRouter.get('/appointments', async (req, res) => {
  try {
    const booked = req.query.booked === 'true';
    const appointments = await appointmentsCollection.getAppointments({
      query: { booked: booked },
    });
    console.log(appointments);
    res.json({
        appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments that are not booked', error);
    res.status(500).json({ error: 'Internal Server Error', appointments: [] });
  }
});

appointmentsRouter.post('/appointments', async (req, res) => {
  try {
    console.log(req.body);
    const result = await appointmentsCollection.postAppointments(req.body);
    res.status(201).json({ message: 'Successfully posted unbooked appointment', result });
  } catch (error) {
    console.error('Error posting data to the DB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

appointmentsRouter.delete('/appointment/:id', async (req, res) => {
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
