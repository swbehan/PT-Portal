import { connect } from './config.js';

function UserCollection({ collectionName = 'users' } = {}) {
  const me = {};
  const users = connect(collectionName);

  me.getUsers = async ({ query = {}, pageSize = 50, page = 0 } = {}) => {
    try {
      const data = await users
        .find(query)
        .limit(pageSize)
        .skip(pageSize * page)
        .toArray();
      return data;
    } catch (error) {
      console.error('Error fetching users from MongoDB', error);
      throw error;
    }
  };

  me.postUsers = async (userData) => {
    try {
      const newUser = {
        name: userData.name,
        role: userData.role,
        email: userData.email,
        createdAt: new Date(),
      };
      const result = await users.insertOne(newUser);
      return result;
    } catch (error) {
      console.error('Error posting new user to MongoDB', error);
      throw error;
    }
  };

  return me;
}

const userCollection = UserCollection();
export default userCollection;
