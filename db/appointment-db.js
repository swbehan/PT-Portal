import { connect } from './config.js';
import mongodb from 'mongodb';
import usersCollection from './users-db.js';

function AppointmentsCollection({ collectionName = 'appointments' } = {}) {
  const me = {};

  const appointments = connect(collectionName);

  // Only fetches appointments that have not already passed
  me.getAppointments = async ({ query = {}, pageSize = 10, page = 0 } = {}) => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

      const filteredQuery = {
        ...query,
        $or: [
          { date: { $gt: today } },
          { date: today, time: { $gte: currentTime } },
        ],
      };

      const data = await appointments
        .find(filteredQuery)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
      console.log(
        `Fetched booked=${query.booked} appointments from MongoDB ⭐`,
      );
      return data;
    } catch (err) {
      console.error('Error fetching appointments from MongoDB', err);
      throw err;
    }
  };

  //only used by pt
  me.postAppointments = async (appointmentData) => {
    try {
      const ptPersona = await usersCollection.getUser({
        name: 'Dr. Sarah Nikki',
        role: 'pt',
      });
      const newAppointmentData = {
        date: appointmentData.date,
        time: appointmentData.time,
        location: appointmentData.location,
        booked: false,
        patientId: null,
        patientName: '',
        ptId: ptPersona._id,
        ptOfAppointment: ptPersona.name,
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

  //only used by pt
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

  //only used by patient
  me.bookAppointment = async (id) => {
    try {
      const patientUser = await usersCollection.getUser({
        name: 'Sofia Terry',
        role: 'patient',
      });

      const result = await appointments.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            booked: true,
            patientName: patientUser.name,
            patientId: patientUser._id,
          },
        },
      );
      console.log('Booked appointment in MongoDB 📅');
      return result;
    } catch (error) {
      console.error('Error booking appointment in MongoDB', error);
      throw error;
    }
  };

  return me;
}

const appointmentsCollection = AppointmentsCollection();
export default appointmentsCollection;
