/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { QM_CATEGORIES } from './qmParameters';

export const AppContext = createContext();

const DUMMY_USERS = [
  { username: 'superadmin', name: 'Rian Superadmin', password: 'admin123', role: 'superadmin' },
  { username: 'qc1', name: 'Rina Quality Control', password: 'qc123', role: 'QC' },
  { username: 'tl1', name: 'Budi Team Leader', password: 'tl123', role: 'TL' },
  { username: 'agent1', name: 'Andi Agent', password: 'agent123', role: 'Agent' },
  { username: 'agent2', name: 'Siti Agent', password: 'agent123', role: 'Agent' },
  { username: 'agent3', name: 'Dewi Agent', password: 'agent123', role: 'Agent' },
];

const INITIAL_FINDINGS = [
  {
    id: 'AUD-1001',
    date: '2026-05-24',
    agentName: 'Andi Agent',
    auditorName: 'Rina Quality Control',
    score: 95,
    isFatal: false,
    notes: 'Performa sangat baik, hanya sedikit kurang di penutup.',
    paramScores: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1 },
    failedSubParams: { 2: [0] },
    msisdn: '08123456789',
    noTiket: 'IN123456',
    noCWC: 'CWC-999',
    duration: '05:20',
    callDate: '2026-05-24',
    callTime: '10:30'
  }
];

export const AppContextProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('qm_users');
    return savedUsers ? JSON.parse(savedUsers) : DUMMY_USERS;
  });

  const [findings, setFindings] = useState(() => {
    const savedFindings = localStorage.getItem('qm_findings');
    return savedFindings ? JSON.parse(savedFindings) : INITIAL_FINDINGS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('qm_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('qm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('qm_findings', JSON.stringify(findings));
  }, [findings]);

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

  const signup = (name, username, password, role) => {
    const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username sudah digunakan!' };
    }
    const newUser = { name, username, password, role };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addFinding = (findingData) => {
    const nextId = "AUD-" + (1000 + findings.length + 1);
    let totalScore = 0;
    const allParams = QM_CATEGORIES.flatMap(cat => cat.parameters);
    allParams.forEach(param => {
      if (findingData.paramScores[param.id] === 1) {
        totalScore += param.weight;
      }
    });

    const newFinding = {
      id: nextId,
      ...findingData,
      auditorName: currentUser ? currentUser.name : 'System Auditor',
      score: totalScore,
    };

    setFindings((prev) => [newFinding, ...prev]);
    return newFinding;
  };

  return (
    <AppContext.Provider
      value={{
        users,
        findings,
        currentUser,
        login,
        signup,
        logout,
        addFinding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
