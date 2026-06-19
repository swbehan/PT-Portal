import { connect } from './config.js';
import mongodb from 'mongodb';

const { ObjectId } = mongodb;

function WorkoutsCollection({ collectionName = 'workouts' } = {}) {
  const me = {};
  const workouts = connect(collectionName);

  // used by PT to view/edit/delete existing plans already posted and Patient to view plans assigned to them
  me.getWorkouts = async ({ query = {}, pageSize = 50, page = 0 } = {}) => {
    try {
      const data = await workouts
        .find(query)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
      return data;
    } catch (error) {
      console.error('Error fetching workouts from MongoDB', error);
      throw error;
    }
  };

  // Only used by PT to post workouts for patients
  me.postWorkouts = async (workoutData) => {
    try {
      const newWorkout = {
        title: workoutData.title,
        patientId: new ObjectId(workoutData.patientId),
        patientName: workoutData.patientName,
        exercises: (workoutData.exercises || []).map((ex) => ({
          _id: new ObjectId(),
          name: ex.name,
          description: ex.description,
          videoLink: ex.videoLink,
        })),
        createdAt: new Date(),
      };
      const result = await workouts.insertOne(newWorkout);
      return result;
    } catch (error) {
      console.error('Error posting new workout to MongoDB', error);
      throw error;
    }
  };

  // Only used by PT to update an already posted workout plan for a patient
  me.updateWorkout = async (id, workoutData) => {
    try {
      const updateFields = {
        title: workoutData.title,
        exercises: (workoutData.exercises || []).map((ex) => ({
          _id: ex._id ? new ObjectId(ex._id) : new ObjectId(),
          name: ex.name,
          description: ex.description,
          videoLink: ex.videoLink,
        })),
      };
      const result = await workouts.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields },
      );
      return result;
    } catch (error) {
      console.error('Error updating workout in MongoDB', error);
      throw error;
    }
  };

  // Only used by the PT to delete an existing plan already posted
  me.deleteExercise = async (workoutId, exerciseId) => {
    try {
      const result = await workouts.updateOne(
        { _id: new ObjectId(workoutId) },
        { $pull: { exercises: { _id: new ObjectId(exerciseId) } } },
      );
      return result;
    } catch (error) {
      console.error('Error deleting exerice from workout in MongoDb', error);
      throw error;
    }
  };

  return me;
}

const workoutsCollection = WorkoutsCollection();
export default workoutsCollection;
