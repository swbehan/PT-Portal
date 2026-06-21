// scripts/review-milestone-seed.js — populate appointments, milestones, and reviews with mock data.
// Runnable from the project root with: node scripts/review-milestone-seed.js
// Existing patients are left untouched; new PTs/doctors are added on top.
import { connect, CLIENT } from '../db/config.js';
import { MOCK_PERSONAS } from '../db/users-db.js';

const users = connect('users');
const appointments = connect('appointments');
const milestones = connect('milestones');
const reviews = connect('reviews');

// --- name pools (kept in the existing "Dr. ..." style) -------------------
const PT_NAMES = [
  'Dr. Emily Carter',
  'Dr. James Whitman',
  'Dr. Priya Nadar',
  'Dr. Marcus Bell',
  'Dr. Olivia Reyes',
  'Dr. Daniel Cho',
  'Dr. Hannah Brooks',
  'Dr. Victor Ramos',
  'Dr. Grace Lin',
  'Dr. Noah Pearce',
];

const DOCTOR_NAMES = [
  'Dr. Alan Frost',
  'Dr. Rachel Goldberg',
  'Dr. Samuel Okafor',
  'Dr. Nina Petrova',
  'Dr. Thomas Wade',
  'Dr. Lena Hoffman',
  'Dr. Raj Mehta',
  'Dr. Claire Dubois',
  'Dr. Ethan Park',
  'Dr. Maria Santos',
];

const LOCATIONS = [
  'Boston, MA',
  'Cambridge, MA',
  'Somerville, MA',
  'Brookline, MA',
  'Quincy, MA',
];

const TIMES = ['09:00', '10:30', '12:45', '14:00', '15:30', '16:15'];

// short, realistic recovery progress notes (1-2 sentences)
const RECOVERY_NOTES = [
  'Patient regained near-full range of motion in the knee and reports minimal pain when walking.',
  'Completed the first round of weight-bearing exercises without discomfort.',
  'Swelling has reduced significantly; cleared to begin light strength training.',
  'Able to climb a full flight of stairs unassisted for the first time since surgery.',
  'Reports improved balance and stability during single-leg stance drills.',
  'Shoulder mobility is improving steadily and the arm can now be raised above shoulder height.',
  'Demonstrated proper squat form and tolerated increased resistance band tension.',
  'No longer relying on crutches for short-distance walking.',
  'Pain levels are down to 2/10 after staying consistent with the home exercise routine.',
  'Successfully completed a full gait-training session on the treadmill.',
  'Hamstring flexibility has improved; cleared to start a jogging progression.',
  'Posture and core engagement are noticeably better during functional movements.',
];

// short, realistic patient reviews (paired with a 1-5 rating, stored as strings to match existing docs)
const REVIEW_TEXTS = [
  {
    text: 'The stretches really helped with my hip mobility, though my knee was a little sore the next morning.',
    rating: '4',
  },
  {
    text: 'Felt strong during the resistance band work today and had almost no pain afterward.',
    rating: '5',
  },
  {
    text: 'Balance exercises are getting easier, but I still wobble on my left leg toward the end of the set.',
    rating: '3',
  },
  {
    text: 'Did the full home routine three times this week and my range of motion is noticeably better.',
    rating: '5',
  },
  {
    text: 'The wall sits were tough and my quad fatigued fast, but no sharp pain which is a good sign.',
    rating: '4',
  },
  {
    text: 'Shoulder still clicks when I raise my arm overhead, but the soreness is much less than last week.',
    rating: '3',
  },
];

// --- helpers -------------------------------------------------------------
const today = new Date();

// returns a YYYY-MM-DD string `daysAhead` days from today (always in the future)
const futureDate = (daysAhead) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// inclusive random integer in [min, max]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// non-mutating Fisher–Yates shuffle
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// --- 1. insert PTs and doctors ------------------------------------------
const ptResult = await users.insertMany(
  PT_NAMES.map((name) => ({ name, role: 'pt' })),
);
const pts = PT_NAMES.map((name, i) => ({
  _id: ptResult.insertedIds[i],
  name,
  role: 'pt',
}));

const doctorResult = await users.insertMany(
  DOCTOR_NAMES.map((name) => ({ name, role: 'doctor' })),
);
const doctors = DOCTOR_NAMES.map((name, i) => ({
  _id: doctorResult.insertedIds[i],
  name,
  role: 'doctor',
}));

console.log(`Inserted ${pts.length} PTs and ${doctors.length} doctors 👤`);

// --- 2. grab the existing patients (left untouched) ----------------------
const patients = await users.find({ role: 'patient' }).toArray();
if (patients.length === 0) {
  throw new Error(
    'No existing patients found — cannot seed booked appointments.',
  );
}
console.log(`Found ${patients.length} existing patients to reference 🧍`);

// --- 3. build appointments ----------------------------------------------
const appointmentDocs = [];
// tracks which patients each PT has booked appointments with (for milestones)
const bookedPatientsByPt = [];
let doctorCursor = 0; // global cursor so doctors are distributed evenly across all booked appts

for (const pt of pts) {
  // 3-5 unbooked appointments with future dates
  const numUnbooked = randInt(3, 5);
  for (let i = 0; i < numUnbooked; i++) {
    appointmentDocs.push({
      date: futureDate(randInt(1, 60)),
      time: pick(TIMES),
      location: pick(LOCATIONS),
      booked: false,
      patientId: null,
      patientName: '',
      ptId: pt._id,
      ptOfAppointment: pt.name,
      createdAt: new Date(),
    });
  }

  // 5-8 booked appointments with future dates, each with a distinct existing patient
  const numBooked = randInt(5, 8);
  const bookedPatients = shuffle(patients).slice(0, numBooked);
  for (const patient of bookedPatients) {
    const doctor = doctors[doctorCursor % doctors.length];
    doctorCursor++;
    appointmentDocs.push({
      date: futureDate(randInt(1, 60)),
      time: pick(TIMES),
      location: pick(LOCATIONS),
      booked: true,
      patientId: patient._id,
      patientName: patient.name,
      ptId: pt._id,
      ptOfAppointment: pt.name,
      referringDoctor: doctor.name,
      referringDoctorId: doctor._id,
      createdAt: new Date(),
    });
  }

  bookedPatientsByPt.push({ pt, bookedPatients });
}

const apptResult = await appointments.insertMany(appointmentDocs);
console.log(`Inserted ${apptResult.insertedCount} appointments 📅`);

// --- 4. build milestones (3 per patient for any PT with a booked appt) ---
const milestoneDocs = [];
for (const { pt, bookedPatients } of bookedPatientsByPt) {
  if (bookedPatients.length === 0) continue;
  for (const patient of bookedPatients) {
    const notes = shuffle(RECOVERY_NOTES).slice(0, 3);
    for (const note of notes) {
      milestoneDocs.push({
        textMileStone: note,
        patientId: patient._id,
        patientName: patient.name,
        ptId: pt._id,
        ptName: pt.name,
        createdAt: new Date(),
      });
    }
  }
}

const milestoneResult = await milestones.insertMany(milestoneDocs);
console.log(`Inserted ${milestoneResult.insertedCount} milestones 🏁`);

// --- 5. targeted data for the three hardcoded personas -------------------
// These are the users you actually "log in as" (see MOCK_PERSONAS in users-db.js),
// so each needs its own visible data. We wire them into one coherent story:
// the patient persona (+ a few other patients) make up the PT persona's caseload,
// all referred by the doctor persona — so all three pages light up together.
const ptPersona = await users.findOne({ name: MOCK_PERSONAS.pt, role: 'pt' });
const doctorPersona = await users.findOne({
  name: MOCK_PERSONAS.doctor,
  role: 'doctor',
});
const patientPersona = await users.findOne({
  name: MOCK_PERSONAS.patient,
  role: 'patient',
});

if (!ptPersona || !doctorPersona || !patientPersona) {
  throw new Error(
    'Could not find one of the hardcoded personas from MOCK_PERSONAS — check users-db.js.',
  );
}

// the PT persona's caseload: the patient persona + 5 other distinct existing patients
const otherCaseload = shuffle(
  patients.filter((p) => !p._id.equals(patientPersona._id)),
).slice(0, 5);
const personaCaseload = [patientPersona, ...otherCaseload];

const personaAppointments = [];
// unbooked availability so the PT persona's availability page has open slots
for (let i = 0; i < 4; i++) {
  personaAppointments.push({
    date: futureDate(randInt(1, 45)),
    time: pick(TIMES),
    location: pick(LOCATIONS),
    booked: false,
    patientId: null,
    patientName: '',
    ptId: ptPersona._id,
    ptOfAppointment: ptPersona.name,
    createdAt: new Date(),
  });
}
// one booked appointment per caseload patient, all referred by the doctor persona
for (const patient of personaCaseload) {
  personaAppointments.push({
    date: futureDate(randInt(1, 45)),
    time: pick(TIMES),
    location: pick(LOCATIONS),
    booked: true,
    patientId: patient._id,
    patientName: patient.name,
    ptId: ptPersona._id,
    ptOfAppointment: ptPersona.name,
    referringDoctor: doctorPersona.name,
    referringDoctorId: doctorPersona._id,
    createdAt: new Date(),
  });
}
await appointments.insertMany(personaAppointments);
console.log(
  `Inserted ${personaAppointments.length} appointments for ${ptPersona.name} (incl. booked for ${patientPersona.name}, referred by ${doctorPersona.name}) 📅`,
);

// milestones + reviews for each caseload patient so the PT and doctor pages are populated
const personaMilestones = [];
const personaReviews = [];
for (const patient of personaCaseload) {
  for (const note of shuffle(RECOVERY_NOTES).slice(0, 3)) {
    personaMilestones.push({
      textMileStone: note,
      patientId: patient._id,
      patientName: patient.name,
      ptId: ptPersona._id,
      ptName: ptPersona.name,
      createdAt: new Date(),
    });
  }
  for (const review of shuffle(REVIEW_TEXTS).slice(0, 2)) {
    personaReviews.push({
      reviewText: review.text,
      rating: review.rating,
      patientName: patient.name,
      patientId: patient._id,
      createdAt: new Date(),
    });
  }
}
await milestones.insertMany(personaMilestones);
await reviews.insertMany(personaReviews);
console.log(
  `Inserted ${personaMilestones.length} milestones and ${personaReviews.length} reviews across ${ptPersona.name}'s caseload 📝`,
);

console.log('Seed complete ✅');
await CLIENT.close();
process.exit(0);
