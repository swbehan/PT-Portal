import { connect } from './config.js';
import mongodb from 'mongodb';
import usersCollection from './users-db.js';

const { ObjectId } = mongodb;

function AppointmentsCollection({ collectionName = 'appointments' } = {}) {
  const me = {};

  const appointments = connect(collectionName);

  // used by a pt to view appointments they have booked and still available
  // used by a patient to view appointments that all pts have posted
  // used by doctors to filter appointments by their id to get a list of patients they should see milestones for
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

  // used by PT, who maps to a single persona; the PT is resolved here via getCurrentUser('pt')
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
      const doctorUser = await usersCollection.getCurrentUser('doctor');

      const result = await appointments.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            booked: true,
            patientName: patientUser.name,
            patientId: patientUser._id,
            referringDoctor: doctorUser.name,
            referringDoctorId: doctorUser._id,
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
