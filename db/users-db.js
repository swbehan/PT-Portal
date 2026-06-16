import { connect } from './config.js';

function UsersCollection({ collectionName = 'users' } = {}) {
  const me = {};

  const users = connect(collectionName);

  me.getUser = async ({ name = null, role = null } = {}) => {
    try {
      const query = {};
      if (name) query.name = name;
      if (role) query.role = role;
      
      const result = role && !name
        ? await users.find(query).toArray()
        : await users.findOne(query);
        
      console.log('Fetched user from MongoDB 👤');
      return result;
    } catch (error) {
      console.error('Error fetching user from MongoDB', error);
      throw error;
    }
  };

  return me;
}

const usersCollection = UsersCollection();
export default usersCollection;
