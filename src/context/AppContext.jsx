/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { QM_CATEGORIES } from './qmParameters';
import axios from 'axios';

export const AppContext = createContext();

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
    const checkLoggedIn = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, username, password, role) => {
    try {
      const res = await api.post('/signup', { name, username, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    delete api.defaults.headers.common['Authorization'];
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
      throw err; // Rethrow to let the component handle it
    }
  };

  const addTeamLeader = async (name, nik) => {
    try {
      const res = await api.post('/team-leaders', { name, nik });
      setTeamLeaders(prev => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add Team Leader' };
    }
  };

  const deleteTeamLeader = async (id) => {
    try {
      await api.delete(`/team-leaders/${id}`);
      setTeamLeaders(prev => prev.filter(tl => tl._id !== id));
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to delete Team Leader' };
    }
  };

  const addSDM = async (name, nik, teamName) => {
    try {
      const res = await api.post('/sdm', { name, nik, teamName });
      setSdmList(prev => [...prev, res.data]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add Agent' };
    }
  };

  const deleteSDM = async (id) => {
    try {
      await api.delete(`/sdm/${id}`);
      setSdmList(prev => prev.filter(sdm => sdm._id !== id));
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to delete Agent' };
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      return { success: true };
    } catch {
      return { success: false, message: 'Failed to delete user' };
    }
  };

  const deleteFinding = async (id) => {
    try {
      await api.delete(`/findings/${id}`);
      setFindings(prev => prev.filter(f => (f.id || f._id) !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting finding:', err);
      return { success: false, message: 'Failed to delete finding' };
    }
  };

  const updateFinding = async (id, updateData) => {
    try {
      const res = await api.put(`/findings/${id}`, updateData);
      setFindings(prev => prev.map(f => (f.id || f._id) === id ? res.data : f));
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Error updating finding:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to update finding' };
    }
  };

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
        deleteFinding,
        updateFinding,
        addTeamLeader,
        deleteTeamLeader,
        addSDM,
        deleteSDM,
        deleteUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
