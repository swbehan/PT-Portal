import { connect } from './config.js';
import mongodb from 'mongodb';

const { ObjectId } = mongodb;

function MileStonesCollection({ collectionName = 'milestones' } = {}) {
  const me = {};

  const milestones = connect(collectionName);

  // used by the doctor to view how the patient has been progressing along their recovery
  me.getMilestones = async ({ query = {}, pageSize = 20, page = 0 } = {}) => {
    try {
      const data = await milestones
        .find(query)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
      return data;
    } catch (error) {
      console.error('Error fetching milestones from MongoDB', error);
      throw error;
    }
  };

  // used by the pt to post a milestone for the doctor to see
  me.postMilestoneToDb = async (milestoneData) => {
    try {
      const newMilestoneData = {
        ...milestoneData,
        patientId: new ObjectId(milestoneData.patientId),
        ptId: new ObjectId(milestoneData.ptId),
        createdAt: new Date(),
      };
      const result = await milestones.insertOne(newMilestoneData);
      console.log('Posted milestone to MongoDB 📝');
      return result;
    } catch (error) {
      console.error('Error posting new milestone to MongoDB', error);
      throw error;
    }
  };
  return me;
}

const milestonesCollection = MileStonesCollection();
export default milestonesCollection;
