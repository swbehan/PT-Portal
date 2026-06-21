import { connect } from './config.js';
import mongodb from 'mongodb';
import usersCollection from './users-db.js';

function AppointmentsCollection({ collectionName = 'appointments' } = {}) {
  const me = {};

  const appointments = connect(collectionName);

  me.getAppointments = async ({
    query = {},
    pageSize = 10,
    page = 0,
    filteredByDate = true,
  } = {}) => {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentTime = now.toTimeString().slice(0, 5);

      const filteredQuery = filteredByDate
        ? {
            ...query,
            $or: [
              { date: { $gt: today } },
              { date: today, time: { $gte: currentTime } },
            ],
          }
        : { ...query };

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

  //only used by pt which has one user persona, so hardcoding Pt into post route
  me.postAppointments = async (appointmentData) => {
    try {
      const ptPersona = await usersCollection.getCurrentUser('pt');
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

  //only used by pt, can only delete appointments before they are booked by a patient
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

  //only used by patient to book appointments that are available from PT's
  me.bookAppointment = async (id) => {
    try {
      const patientUser = await usersCollection.getCurrentUser('patient');

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
