/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

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
    date: '2026-03-10',
    agentName: 'Andi Agent',
    auditorName: 'Rina Quality Control',
    softSkills: 85,
    productKnowledge: 90,
    processCompliance: 100,
    isFatal: false,
    score: 93,
    notes: 'Komunikasi sangat ramah, pemahaman produk mantap.',
  },
  {
    id: 'AUD-1002',
    date: '2026-03-15',
    agentName: 'Siti Agent',
    auditorName: 'Budi Team Leader',
    softSkills: 75,
    productKnowledge: 80,
    processCompliance: 0,
    isFatal: true,
    score: 0,
    notes: 'Proses verifikasi identitas terlewat (Fatal Error!).',
  },
  {
    id: 'AUD-1003',
    date: '2026-03-22',
    agentName: 'Dewi Agent',
    auditorName: 'Rina Quality Control',
    softSkills: 90,
    productKnowledge: 85,
    processCompliance: 100,
    isFatal: false,
    score: 93,
    notes: 'Kepatuhan SOP sangat tinggi, intonasi suara bersahabat.',
  },
  {
    id: 'AUD-1004',
    date: '2026-04-05',
    agentName: 'Andi Agent',
    auditorName: 'Budi Team Leader',
    softSkills: 80,
    productKnowledge: 85,
    processCompliance: 100,
    isFatal: false,
    score: 90,
    notes: 'Penyelesaian masalah cepat dan tepat sasaran.',
  },
  {
    id: 'AUD-1005',
    date: '2026-04-12',
    agentName: 'Siti Agent',
    auditorName: 'Rina Quality Control',
    softSkills: 88,
    productKnowledge: 82,
    processCompliance: 100,
    isFatal: false,
    score: 91,
    notes: 'Ada peningkatan di empati dibanding audit sebelumnya.',
  },
  {
    id: 'AUD-1006',
    date: '2026-04-20',
    agentName: 'Dewi Agent',
    auditorName: 'Budi Team Leader',
    softSkills: 92,
    productKnowledge: 90,
    processCompliance: 100,
    isFatal: false,
    score: 95,
    notes: 'Luar biasa, sangat profesional dalam menghadapi komplain.',
  },
  {
    id: 'AUD-1007',
    date: '2026-05-02',
    agentName: 'Andi Agent',
    auditorName: 'Rina Quality Control',
    softSkills: 70,
    productKnowledge: 75,
    processCompliance: 100,
    isFatal: false,
    score: 84,
    notes: 'Perlu peningkatan di penjelasan promo cashback terbaru.',
  },
  {
    id: 'AUD-1008',
    date: '2026-05-10',
    agentName: 'Siti Agent',
    auditorName: 'Budi Team Leader',
    softSkills: 85,
    productKnowledge: 85,
    processCompliance: 100,
    isFatal: false,
    score: 91,
    notes: 'Verifikasi lengkap, penutupan telepon hangat.',
  },
  {
    id: 'AUD-1009',
    date: '2026-05-18',
    agentName: 'Dewi Agent',
    auditorName: 'Rina Quality Control',
    softSkills: 95,
    productKnowledge: 95,
    processCompliance: 100,
    isFatal: false,
    score: 97,
    notes: 'Hasil sempurna! Sangat menguasai materi update sistem.',
  },
  {
    id: 'AUD-1010',
    date: '2026-05-22',
    agentName: 'Andi Agent',
    auditorName: 'Budi Team Leader',
    softSkills: 80,
    productKnowledge: 80,
    processCompliance: 0,
    isFatal: true,
    score: 0,
    notes: 'Tidak mengkonfirmasi nama pelanggan di awal (Fatal Error!).',
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
    const nextId = `AUD-${1000 + findings.length + 1}`;
    
    // Perhitungan nilai QMS
    // Soft skills (30%), Product Knowledge (30%), Process Compliance (40%)
    // Jika isFatal = true, maka QMS Score = 0
    const soft = Number(findingData.softSkills);
    const prod = Number(findingData.productKnowledge);
    const compliance = findingData.isFatal ? 0 : 100;
    const finalScore = findingData.isFatal 
      ? 0 
      : Math.round(soft * 0.3 + prod * 0.3 + compliance * 0.4);

    const newFinding = {
      id: nextId,
      date: findingData.date,
      agentName: findingData.agentName,
      auditorName: currentUser ? currentUser.name : 'System Auditor',
      softSkills: soft,
      productKnowledge: prod,
      processCompliance: compliance,
      isFatal: findingData.isFatal,
      score: finalScore,
      notes: findingData.notes,
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
