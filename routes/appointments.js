import express from "express";
import appointmentsCollection from "../db/appointment-db.js";

const appointmentsRouter = express.Router();

// THIS IS A DATA ENDPOINT that the route will send information back to the client side
appointmentsRouter.get("/appointments", async (req, res) => {
  try {
    const appointments = await appointmentsCollection.getAppointments()
    res.json({
        appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments", error);
    res.status(500).json({ error: "Internal Server Error", appointments: [] });
  }
});


appointmentsRouter.post("/add-appointment-availability", async (req, res) => {
  try {
    console.log(req.body)
    const result = await appointmentsCollection.postAppointments(req.body)
    res.status(201).json(result);
  } catch (error) {
    console.error("Error posting data to the DB", error);
    res.status(500).json({ error: "Internal Server Error"});
  }
});

export default appointmentsRouter;