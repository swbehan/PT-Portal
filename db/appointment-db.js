import { connect } from './config.js';
import mongodb from 'mongodb';

function AppointmentsCollection({ collectionName = 'appointments' } = {}) {
  const me = {};

  const appointments = connect(collectionName);

  me.getAppointments = async ({ query = {}, pageSize = 10, page = 0 } = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filteredQuery = { ...query, date: { $gte: today } };

      const data = await appointments
        .find(filteredQuery)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
      console.log(`Fetched booked=${query.booked} appointments from MongoDB ⭐`);
      return data;
    } catch (err) {
      console.error('Error fetching appointments from MongoDB', err);
      throw err;
    }
  };

  me.postAppointments = async (appointmentData) => {
    try {
      const newAppointmentData = {
        date: appointmentData.date,
        time: appointmentData.time,
        location: appointmentData.location,
        booked: false,
        patientId: null,
        patientName: '',
        createdAt: new Date(),
      };
      const result = await appointments.insertOne(newAppointmentData);
      console.log('Posted appointment to MongoDB 📝');
      return result;
    } catch (error) {
      console.error('Error posting new appointment to MongoDB', error);
      throw error;
    }
  };

  const { ObjectId } = mongodb;

  me.deleteAppointment = async (id) => {
    try {
      const result = await appointments.deleteOne({ _id: new ObjectId(id) });
      console.log('Deleted appointment from MongoDB ❌');
      return result;
    } catch (error) {
      console.error('Error deleting appointment from MongoDB', error);
      throw error;
    }
  };

  return me;
}

const appointmentsCollection = AppointmentsCollection();
export default appointmentsCollection;
