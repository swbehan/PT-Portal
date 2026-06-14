import { connect } from "./config.js";

function AppointmentsCollection({ collectionName = "appointments" } = {}) {
  const me = {};

  const appointments = connect(collectionName);

  me.getAppointments = async ({ query = {}, pageSize = 10, page = 0 } = {}) => {
    try {
      // Will return a cursor that needs to be shifted into an Array
      const data = await appointments
        .find(query)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
      console.log("Fecthed appointments from MongoDB", data);
      return data;
    } catch (err) {
      console.error("Error fetching appointments from MongoDB", err);
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
            createdAt: new Date()
          };
        const result = await appointments.insertOne(newAppointmentData);
        return result;
    } catch (error) {
        console.error("Error posting new appointment to MongoDB", error);
        throw error;
    }
  }
  return me;
}

const appointmentsCollection = AppointmentsCollection();
export default appointmentsCollection;
