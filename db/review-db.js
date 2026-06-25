import { connect } from './config.js';
import mongodb from 'mongodb';

const { ObjectId } = mongodb;

function ReviewsCollection({ collectionName = 'reviews' } = {}) {
  const me = {};

  const reviews = connect(collectionName);
-> Feedback: Great job on using comments to describe the functions and what job they complete for understandability purposes.
  // used by the pt to view the patient reviews about their progress and exercise feedback
  me.getReviews = async ({ query = {}, pageSize = 20, page = 0 } = {}) => {
    try {
      const data = await reviews
        .find(query)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
      return data;
    } catch (error) {
      console.error('Error fetching reviews from MongoDB', error);
      throw error;
    }
  };

  // used by the patient to post a review for the PT to see
  me.postReviewToDb = async (reviewData) => {
    try {
      const newReviewData = {
        ...reviewData,
        patientId: new ObjectId(reviewData.patientId),
        createdAt: new Date(),
      };
      const result = await reviews.insertOne(newReviewData);
      console.log('Posted review to MongoDB 📝');
      return result;
    } catch (error) {
      console.error('Error posting new review to MongoDB', error);
      throw error;
    }
  };
  return me;
}

const reviewsCollection = ReviewsCollection();
export default reviewsCollection;
