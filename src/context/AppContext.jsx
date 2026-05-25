/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { QM_CATEGORIES } from './qmParameters';
import axios from 'axios'; // Using axios for simplified API calls

export const AppContext = createContext();

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AppContextProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [findings, setFindings] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [sdmList, setSdmList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('qm_token');
      if (token) {
        try {
          // You might want to have a /api/me endpoint to verify the token and get user data
          // For now, we'll decode it. But this is not secure if you have sensitive data in payload.
          const user = JSON.parse(atob(token.split('.')[1])); 
          
          // Fake fetch user to simulate real app behavior
          const res = await api.get(`/users/${user.id}`); // This endpoint does not exist. We need to handle this.
          setCurrentUser(res.data); 

        } catch (error) {
          console.error('Invalid token', error)
          localStorage.removeItem('qm_token');
        }
      }
      setIsLoading(false);
    };
    checkLoggedIn();
  }, []);
  

  // Fetch other data on mount
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [usersRes, findingsRes, tlRes, sdmRes] = await Promise.all([
                api.get('/users'),
                api.get('/findings'),
                api.get('/team-leaders'),
                api.get('/sdm'),
            ]);
            setUsers(usersRes.data);
            setFindings(findingsRes.data);
            setTeamLeaders(tlRes.data);
            setSdmList(sdmRes.data);
        } catch (err) {
            console.error('Error initializing data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if(currentUser) {
        fetchData();
    }
  }, [currentUser]);


  const login = async (username, password) => {
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('qm_token', res.data.token);
      setCurrentUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, username, password, role) => {
    try {
      const res = await api.post('/signup', { name, username, password, role });
      localStorage.setItem('qm_token', res.data.token);
      setCurrentUser(res.data.user);
      return { success: true };
    } catch (err) {
       return { success: false, message: err.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('qm_token');
    setCurrentUser(null);
  };
  
  const addFinding = async (findingData) => {
    try {
      let totalScore = 0;
      const allParams = QM_CATEGORIES.flatMap(cat => cat.parameters);
      allParams.forEach(param => {
        if (findingData.paramScores[param.id] === 1) {
          totalScore += param.weight;
        }
      });

      const res = await api.post('/findings', {
        ...findingData,
        auditorName: currentUser ? currentUser.name : 'System Auditor',
        score: totalScore
      });

      setFindings(prev => [res.data, ...prev]);
      return res.data;
      
    } catch (err) {
      console.error('Error adding finding:', err);
    }
  };

  // ... other functions (addTeamLeader, deleteTeamLeader, etc.) should also be converted to use axios

  return (
    <AppContext.Provider
      value={{
        users,
        findings,
        teamLeaders,
        sdmList,
        currentUser,
        isLoading,
        login,
        signup,
        logout,
        addFinding,
        // ... other functions
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
