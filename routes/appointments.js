import express from 'express';
import mongodb from 'mongodb';
import appointmentsCollection from '../db/appointment-db.js';

const { ObjectId } = mongodb;
const appointmentsRouter = express.Router();

appointmentsRouter.get('/appointments', async (req, res) => {
  try {
    const booked = req.query.booked === 'true';
    const ptId = req.query.ptId || null;
    const patientId = req.query.patientId || null;
    const filteredByDate = req.query.filteredByDate !== 'false'

    const query = { booked };
    if (ptId) query.ptId = new ObjectId(ptId);
    if (patientId) query.patientId = new ObjectId(patientId);

    const appointments = await appointmentsCollection.getAppointments({
      query,
      filteredByDate,
    });
    console.log(appointments);
    res.json({
      appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments', error);
    res.status(500).json({ error: 'Internal Server Error', appointments: [] });
  }
});

appointmentsRouter.post('/appointments', async (req, res) => {
  try {
    console.log(req.body);
    const result = await appointmentsCollection.postAppointments(req.body);
    res
      .status(201)
      .json({ message: 'Successfully posted unbooked appointment', result });
  } catch (error) {
    console.error('Error posting data to the DB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

appointmentsRouter.delete('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await appointmentsCollection.deleteAppointment(id);
    res
      .status(200)
      .json({ message: 'Successfully deleted unbooked appointment', result });
  } catch (error) {
    console.error('Error deleting appointment from the DB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

appointmentsRouter.put('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await appointmentsCollection.bookAppointment(
      id,
    );
    res
      .status(200)
      .json({ message: 'Appointment booked successfully', result });
  } catch (error) {
    console.error('Error booking appointment', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default appointmentsRouter;
