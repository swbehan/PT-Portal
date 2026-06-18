// scripts/seed-workouts.js — one-off utility to populate the workouts collection
import { connect } from '../db/config.js';
import mongodb from 'mongodb';

const { ObjectId } = mongodb;
const workouts = connect('workouts');
const users = connect('users');

// Grabbing 10 real patients so our plans reference _ids that actually exist
const patients = await users.find({ role: 'patient' }).limit(10).toArray();

// A small pool of exercises to draw from (real-ish PT content)
const EXERCISE_POOL = [
  {
    name: 'Hamstring Curls',
    description: '3 sets of 12, slow tempo',
    videoLink: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
  },
  {
    name: 'Glute Bridges',
    description: '3 sets of 15, hold 2s at top',
    videoLink: 'https://www.youtube.com/watch?v=wPM8icPu6H8',
  },
  {
    name: 'Wall Sits',
    description: '3 rounds of 30 seconds',
    videoLink: 'https://www.youtube.com/watch?v=y-wV4Venusw',
  },
  {
    name: 'Calf Raises',
    description: '3 sets of 20',
    videoLink: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
  },
  {
    name: 'Clamshells',
    description: '2 sets of 15 each side',
    videoLink: 'https://www.youtube.com/watch?v=kZN3CCQVXgk',
  },
  {
    name: 'Step-Ups',
    description: '3 sets of 10 each leg',
    videoLink: 'https://www.youtube.com/watch?v=WCFCdxzFBa4',
  },
];

const TITLES = [
  'Week 1 – Knee Recovery',
  'Week 2 – Strength Build',
  'Lower Body Rehab',
  'Post-Op Mobility',
  'ACL Recovery Phase 1',
];

// Build one workout doc per patient
const plans = patients.map((patient, i) => ({
  title: TITLES[i % TITLES.length],
  patientId: patient._id, // real ObjectId reference
  patientName: patient.name, // denormalized copy (Step 1)
  exercises: EXERCISE_POOL.slice(0, 3 + (i % 3)).map((ex) => ({
    _id: new ObjectId(), // each embedded exercise gets its own id
    ...ex,
  })),
  createdAt: new Date(),
}));

const result = await workouts.insertMany(plans);
console.log(`Seeded ${result.insertedCount} workout plans`);
process.exit(0);
