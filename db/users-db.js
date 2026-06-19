import { connect } from './config.js';

// Mocked auth: each role maps to exactly one strict persona.
// This is the SINGLE source of truth for who the "current user" is
// nothing else (routes, frontend) should hardcode persona names.
export const MOCK_PERSONAS = {
  patient: 'Sofia Terry',
  pt: 'Dr. Sarah Nikki',
  // doctor: '<add when a doctor persona/page exists>',
};

function UsersCollection({ collectionName = 'users' } = {}) {
  const me = {};

  const users = connect(collectionName);

  // Returns the list of users for a role (used to populate dropdowns).
  me.getUsersByRole = async (role) => {
    try {
      const query = role ? { role } : {};
      const result = await users.find(query).toArray();
      console.log('Fetched users from MongoDB 👤');
      return result;
    } catch (error) {
      console.error('Error fetching users from MongoDB', error);
      throw error;
    }
  };

  // Mocked auth: resolves a role to its single strict persona.
  me.getCurrentUser = async (role) => {
    try {
      const name = MOCK_PERSONAS[role];
      if (!name) return null;
      const result = await users.findOne({ name, role });
      console.log('Fetched current user from MongoDB 👤');
      return result;
    } catch (error) {
      console.error('Error fetching current user from MongoDB', error);
      throw error;
    }
  };

  return me;
}

const usersCollection = UsersCollection();
export default usersCollection;
