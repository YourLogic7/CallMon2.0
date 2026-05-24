/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { QM_CATEGORIES } from './qmParameters';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [findings, setFindings] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [sdmList, setSdmList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('qm_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, findingsRes, tlsRes, sdmRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/findings'),
          fetch('/api/team-leaders'),
          fetch('/api/sdm')
        ]);

        const [usersData, findingsData, tlsData, sdmData] = await Promise.all([
          usersRes.json(),
          findingsRes.json(),
          tlsRes.json(),
          sdmRes.json()
        ]);

        setUsers(usersData);
        setFindings(findingsData);
        setTeamLeaders(tlsData);
        setSdmList(sdmData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('qm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('qm_current_user');
    }
  }, [currentUser]);

  const login = (username, password) => {
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Username atau password salah!' };
  };

  const signup = async (name, username, password, role) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, role })
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [newUser, ...prev]);
        return { success: true, user: newUser };
      } else {
        const error = await res.json();
        return { success: false, message: error.message };
      }
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== id));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
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

      const res = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...findingData,
          auditorName: currentUser ? currentUser.name : 'System Auditor',
          score: totalScore
        })
      });

      if (res.ok) {
        const savedFinding = await res.json();
        setFindings(prev => [savedFinding, ...prev]);
        return savedFinding;
      }
    } catch (err) {
      console.error('Error adding finding:', err);
    }
  };

  const addTeamLeader = async (name, nik) => {
    try {
      const res = await fetch('/api/team-leaders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nik })
      });
      if (res.ok) {
        const newTL = await res.json();
        setTeamLeaders(prev => [...prev, newTL]);
        return { success: true };
      }
    } catch (err) {
      return { success: false };
    }
  };

  const deleteTeamLeader = async (id) => {
    try {
      const res = await fetch(`/api/team-leaders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamLeaders(prev => prev.filter(tl => tl._id !== id));
        return { success: true };
      }
    } catch (err) {
      return { success: false };
    }
  };

  const addSDM = async (name, nik, teamName) => {
    try {
      const res = await fetch('/api/sdm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nik, teamName })
      });
      if (res.ok) {
        const newSDM = await res.json();
        setSdmList(prev => [...prev, newSDM]);
        return { success: true };
      }
    } catch (err) {
      return { success: false };
    }
  };

  const deleteSDM = async (id) => {
    try {
      const res = await fetch(`/api/sdm/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSdmList(prev => prev.filter(s => s._id !== id));
        return { success: true };
      }
    } catch (err) {
      return { success: false };
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
        deleteUser,
        logout,
        addFinding,
        addTeamLeader,
        deleteTeamLeader,
        addSDM,
        deleteSDM
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
