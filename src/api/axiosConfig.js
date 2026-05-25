import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://callmon-rev.vercel.app' 
  : 'http://localhost:3001';

// Create a re-usable axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

/*
  The logic to set the authorization header is now handled in AuthContext. 
  When a user logs in or the app initializes, AuthContext will set 
  the default authorization header for this 'api' instance.
*/

export default api;
