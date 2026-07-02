'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import WigCard from '../components/WigCard';
import ExportModal from '../components/ExportModal';
import { mockUsers, UserPerformance } from '../data/mockData';
import { analytics } from '../lib/firebase';
import dynamic from 'next/dynamic';
import { 
  fetchFirestoreUsers, 
  saveUserWigData, 
  initializeFirestoreCollection,
  createDefaultQuarterlyMetrics,
  generateWeeklyHistory
} from '../lib/firestoreService';

const ScoreboardChart = dynamic(() => import('../components/ScoreboardChart'), {
  ssr: false,
});

const CommitmentPanel = dynamic(() => import('../components/CommitmentPanel'), {
  ssr: false,
});

const TeamScoreboard = dynamic(() => import('../components/TeamScoreboard'), {
  ssr: false,
});

const Loader = dynamic(() => import('../components/Loader'), {
  ssr: false,
});

const Leaderboard = dynamic(() => import('../components/Leaderboard'), {
  ssr: false,
});

const ProjectHead = dynamic(() => import('../components/ProjectHead'), {
  ssr: false,
});

export default function Home() {
  const [users, setUsers] = useState<UserPerformance[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>('gitanjali');
  const [viewMode, setViewMode] = useState<'individual' | 'overview' | 'leaderboard' | 'project_head'>('individual');
  const [allAnalytics, setAllAnalytics] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'wigs' | 'commitments'>('wigs');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [loggedInUserKey, setLoggedInUserKey] = useState<string>('');
  const [activeTeam, setActiveTeam] = useState<'Executive Board' | 'Open Program'>('Executive Board');
  const [sessionActive, setSessionActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [goalFilter, setGoalFilter] = useState('all');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  // Quarter & Date Pickers states (Indian Financial Year: April - March)
  const todayStr = typeof window !== 'undefined' ? new Date().toISOString().substring(0, 10) : '2026-07-02';
  const [selectedQuarter, setSelectedQuarter] = useState<'q1' | 'q2' | 'q3' | 'q4'>('q1');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState(todayStr);

  // WIG Editing states
  const [editingWig, setEditingWig] = useState<{ type: 'revenue' | 'pipeline' | 'seats'; title: string; currentVal: number } | null>(null);
  const [inputVal, setInputVal] = useState<string>('');

  // FreJun Call data states
  const [calls, setCalls] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [errorCalls, setErrorCalls] = useState<string | null>(null);

  // FreJun independent date controls
  const [frejunStartDate, setFrejunStartDate] = useState('2026-07-01');
  const [frejunEndDate, setFrejunEndDate] = useState(todayStr);
  const [frejunTimeframe, setFrejunTimeframe] = useState<'today' | 'yesterday' | 'last_week' | 'this_month' | 'ytd' | 'custom'>('ytd');

  const router = useRouter();

  // Load authorized credentials and active users quarterly WIG progress from Firestore/localStorage
  useEffect(() => {
    const isAuth = localStorage.getItem('isLoggedIn') === 'true';
    if (!isAuth) {
      router.replace('/login');
      return;
    }

    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 5000);

    const loadWigData = async () => {
      let currentUsersList: any[] = [];
      let loadedFromFirestore = false;

      // Data version: bump this when commitment schema changes to force re-initialization
      const DATA_VERSION = 'v3_progress_commitments';
      const storedVersion = localStorage.getItem('wig_data_version');
      if (storedVersion !== DATA_VERSION) {
        // Clear stale data so commitments re-initialize as empty per-user
        localStorage.removeItem('users_fy26_frejun_wig_data');
        localStorage.setItem('wig_data_version', DATA_VERSION);
      }

      try {
        // Try fetching from Firestore first
        currentUsersList = await fetchFirestoreUsers();
        if (currentUsersList && currentUsersList.length > 0) {
          loadedFromFirestore = true;
          // Reconcile Firestore data with current mockUsers:
          // - Remove users no longer in mockUsers (deleted users)
          // - Add any new users from mockUsers not yet in Firestore
          const validIds = new Set(mockUsers.map((u) => u.id));
          currentUsersList = currentUsersList.filter((u: any) => validIds.has(u.id));
          const existingIds = new Set(currentUsersList.map((u: any) => u.id));

          let needsSync = false;
          for (const user of mockUsers) {
            if (!existingIds.has(user.id)) {
              const newUser = {
                ...user,
                quarterlyMetrics: createDefaultQuarterlyMetrics()
              };
              currentUsersList.push(newUser);
              // Save the new user to Firestore
              await saveUserWigData(user.id, newUser);
              needsSync = true;
            }
          }
          if (needsSync) {
            // Re-fetch to ensure data is in sync
            currentUsersList = await fetchFirestoreUsers();
            currentUsersList = currentUsersList.filter((u: any) => validIds.has(u.id));
          }
        } else {
          // Firestore collection is empty, initialize it
          currentUsersList = await initializeFirestoreCollection(mockUsers);
          loadedFromFirestore = true;
        }
        addToast('Synced with cloud database', 'success');
      } catch (err) {
        console.warn('Firestore load failed, falling back to localStorage:', err);
        // Fallback to localStorage if Firestore is unavailable
        const savedWigData = localStorage.getItem('users_fy26_frejun_wig_data');
        if (savedWigData) {
          try {
            currentUsersList = JSON.parse(savedWigData);
          } catch (e) {
            currentUsersList = [];
          }
        }

        // Reconcile localStorage data with current mockUsers:
        const validIds = new Set(mockUsers.map((u) => u.id));
        currentUsersList = currentUsersList.filter((u: any) => validIds.has(u.id));
        const existingIds = new Set(currentUsersList.map((u: any) => u.id));

        const createDefaultQuarterlyUser = (user: any) => ({
          ...user,
          quarterlyMetrics: createDefaultQuarterlyMetrics()
        });

        for (const user of mockUsers) {
          if (!existingIds.has(user.id)) {
            currentUsersList.push(createDefaultQuarterlyUser(user));
          }
        }

        if (currentUsersList.length === 0) {
          currentUsersList = mockUsers.map(createDefaultQuarterlyUser);
        }
        addToast('Loaded offline cached data', 'info');
      }

      // Sync local storage as backup cache
      localStorage.setItem('users_fy26_frejun_wig_data', JSON.stringify(currentUsersList));
      setUsers(currentUsersList);

      const loggedInUser = localStorage.getItem('loggedInUser') || 'admin';
      const role = (localStorage.getItem('userRole') || 'admin') as 'admin' | 'user';
      const savedUserId = localStorage.getItem('userId') || 'gitanjali';

      setUserRole(role);
      setLoggedInUserKey(loggedInUser);
      setViewMode(role === 'admin' ? 'overview' : 'individual');

      if (role === 'user') {
        setActiveUserId(savedUserId);
        const selectedUser = currentUsersList.find((u) => u.id === savedUserId);
        if (selectedUser) {
          setActiveTeam(selectedUser.team);
        }
      } else {
        const defaultUser = currentUsersList.find((u) => u.id === savedUserId) || currentUsersList[0];
        if (defaultUser) {
          setActiveUserId(defaultUser.id);
          setActiveTeam(defaultUser.team);
        }
      }

      setAuthorized(true);
    };

    loadWigData();

    return () => clearTimeout(timer);
  }, [router]);

  // Helper: calculate commitment score based on progress (current/target)
  const calcCommitmentAverage = (commitmentsList: any[], fallbackMetrics?: any) => {
    if (commitmentsList.length > 0) {
      const weeklyScores = commitmentsList.map((c: any) => {
        if (c.items.length === 0) return 0;
        const itemScores = c.items.map((i: any) => {
          if (i.target && i.target > 0) return Math.min((i.current || 0) / i.target, 1) * 100;
          return i.completed ? 100 : 0; // backward compat for old data
        });
        return itemScores.reduce((a: number, b: number) => a + b, 0) / c.items.length;
      });
      const sum = weeklyScores.reduce((acc: number, val: number) => acc + val, 0);
      return Math.round(sum / commitmentsList.length);
    }
    if (fallbackMetrics) {
      return Math.round(
        (fallbackMetrics.revenue.progress +
          fallbackMetrics.pipeline.progress +
          fallbackMetrics.seats.progress) / 3
      );
    }
    return 0;
  };

  // Derived state: Get activeUser performance mapped to the selected quarter
  const activeUser = React.useMemo(() => {
    const rawUser = users.find((u) => u.id === activeUserId);
    if (!rawUser) return null;

    const quarterly = (rawUser as any).quarterlyMetrics;
    const metricsForQuarter = quarterly ? quarterly[selectedQuarter] : rawUser.metrics;
    const commitmentsList = metricsForQuarter ? metricsForQuarter.commitments || [] : [];

    const commitmentAverage = calcCommitmentAverage(commitmentsList, metricsForQuarter);

    return {
      ...rawUser,
      commitmentAverage,
      metrics: metricsForQuarter,
      weeklyHistory: metricsForQuarter?.weeklyHistory || [],
      commitments: commitmentsList
    } as any;
  }, [users, activeUserId, selectedQuarter]);

  // Helper to set FreJun timeframe presets
  const handleFrejunTimeframe = (tf: 'today' | 'yesterday' | 'last_week' | 'this_month' | 'ytd' | 'custom') => {
    setFrejunTimeframe(tf);
    const now = new Date();
    if (tf === 'today') {
      const d = now.toISOString().substring(0, 10);
      setFrejunStartDate(d);
      setFrejunEndDate(d);
    } else if (tf === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const d = y.toISOString().substring(0, 10);
      setFrejunStartDate(d);
      setFrejunEndDate(d);
    } else if (tf === 'last_week') {
      const end = new Date(now);
      end.setDate(end.getDate() - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      setFrejunStartDate(start.toISOString().substring(0, 10));
      setFrejunEndDate(end.toISOString().substring(0, 10));
    } else if (tf === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setFrejunStartDate(start.toISOString().substring(0, 10));
      setFrejunEndDate(now.toISOString().substring(0, 10));
    } else if (tf === 'ytd') {
      setFrejunStartDate('2026-07-01');
      setFrejunEndDate(now.toISOString().substring(0, 10));
    }
  };

  // Fetch FreJun calling data when active user or frejun dates change
  useEffect(() => {
    if (!authorized || !activeUser?.email) return;

    let isMounted = true;
    const fetchFrejunData = async () => {
      setLoadingCalls(true);
      setErrorCalls(null);
      try {
        const queryUrl = `/api/frejun?email=${encodeURIComponent(activeUser.email)}&date_start=${frejunStartDate}&date_end=${frejunEndDate}`;
        const res = await fetch(queryUrl);
        if (!res.ok) {
          throw new Error(`Server returned status code: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted) {
          if (data.success) {
            setCalls(data.calls || []);
            setAnalyticsData(data.analytics || null);
            setAllAnalytics(data.allAnalytics && Object.keys(data.allAnalytics).length > 0 ? data.allAnalytics : {
              "gitanjali@xmonks.com": { total_calls: 154, answered_calls: 122, total_minutes: 384.5 },
              "chirag.khurana@xmonks.com": { total_calls: 210, answered_calls: 145, total_minutes: 512.2 },
              "priyanka@xmonks.com": { total_calls: 95, answered_calls: 78, total_minutes: 245.8 }
            });
          } else {
            throw new Error(data.error || 'Failed to fetch calling data');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorCalls(err.message);
          // Fallback to mock calling data if API fails or is offline
          setAllAnalytics({
            "gitanjali@xmonks.com": { total_calls: 154, answered_calls: 122, total_minutes: 384.5 },
            "chirag.khurana@xmonks.com": { total_calls: 210, answered_calls: 145, total_minutes: 512.2 },
            "priyanka@xmonks.com": { total_calls: 95, answered_calls: 78, total_minutes: 245.8 }
          });
        }
      } finally {
        if (isMounted) {
          setLoadingCalls(false);
        }
      }
    };

    fetchFrejunData();

    return () => {
      isMounted = false;
    };
  }, [activeUser?.email, frejunStartDate, frejunEndDate, authorized]);

  // Synchronize team switching for admin
  const handleSelectTeam = (team: 'Executive Board' | 'Open Program') => {
    setActiveTeam(team);
    const firstTeamMember = users.find((user) => user.team === team);
    if (firstTeamMember) {
      setActiveUserId(firstTeamMember.id);
      addToast(`Switched to team: ${team}`, 'info');
    }
  };

  // Switch quarter ranges
  const handleSelectQuarter = (q: 'q1' | 'q2' | 'q3' | 'q4') => {
    setSelectedQuarter(q);
    const year = '2026';
    if (q === 'q1') {
      setStartDate(`${year}-04-01`);
      setEndDate(`${year}-06-30`);
    } else if (q === 'q2') {
      setStartDate(`${year}-07-01`);
      setEndDate(`${year}-09-30`);
    } else if (q === 'q3') {
      setStartDate(`${year}-10-01`);
      setEndDate(`${year}-12-31`);
    } else if (q === 'q4') {
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-03-31`);
    }
    addToast(`Switched to ${q.toUpperCase()} view`, 'info');
  };

  // Monitor custom dates changes to highlight the matching quarter
  useEffect(() => {
    const startMonth = startDate.substring(5, 7);
    const startDay = startDate.substring(8, 10);
    const endMonth = endDate.substring(5, 7);
    const endDay = endDate.substring(8, 10);

    let matchedQ: 'q1' | 'q2' | 'q3' | 'q4' | null = null;
    if (startMonth === '04' && startDay === '01' && endMonth === '06' && endDay === '30') matchedQ = 'q1';
    else if (startMonth === '07' && startDay === '01' && endMonth === '09' && endDay === '30') matchedQ = 'q2';
    else if (startMonth === '10' && startDay === '01' && endMonth === '12' && endDay === '31') matchedQ = 'q3';
    else if (startMonth === '01' && startDay === '01' && endMonth === '03' && endDay === '31') matchedQ = 'q4';

    if (matchedQ && matchedQ !== selectedQuarter) {
      setSelectedQuarter(matchedQ);
    }
  }, [startDate, endDate, selectedQuarter]);

  // Toast notifier helper
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Stopwatch timer for the active session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const getFormattedSessionTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  const handleToggleSession = () => {
    if (sessionActive) {
      setSessionActive(false);
      addToast('Session stopped', 'error');
    } else {
      setSessionActive(true);
      addToast('Session started successfully!', 'success');
    }
  };

  const handleGoalFilterChange = (filter: string) => {
    setGoalFilter(filter);
    const filterLabel = 
      filter === 'all' ? 'All Goals' : 
      filter === 'revenue' ? 'Revenue Goal Only' :
      filter === 'pipeline' ? 'Pipeline Goal Only' : 'Seat Goal Only';
    addToast(`Goal view updated: ${filterLabel}`, 'info');
  };

  // Update target progress and localstorage + firestore
  const handleUpdateWig = async (newVal: number) => {
    if (!editingWig || !activeUser) return;

    let updatedUserObj: any = null;

    const updatedUsers = users.map((u) => {
      if (u.id === activeUser.id) {
        const quarterly = (u as any).quarterlyMetrics;
        if (!quarterly) return u;

        const currentQuarterMetrics = quarterly[selectedQuarter];
        const metric = currentQuarterMetrics[editingWig.type];
        const progress = Math.min(Math.round((newVal / metric.target) * 100), 100);

        const updatedQuarterMetrics = {
          ...currentQuarterMetrics,
          [editingWig.type]: {
            ...metric,
            current: newVal,
            progress,
          },
        };

        const updatedQuarterly = {
          ...quarterly,
          [selectedQuarter]: {
            ...updatedQuarterMetrics,
            weeklyHistory: generateWeeklyHistory(
              updatedQuarterMetrics.revenue.target, updatedQuarterMetrics.revenue.current,
              updatedQuarterMetrics.pipeline.target, updatedQuarterMetrics.pipeline.current,
              updatedQuarterMetrics.seats.target, updatedQuarterMetrics.seats.current
            )
          },
        };

        const commitmentsList = updatedQuarterly[selectedQuarter].commitments || [];
        const commitmentAverage = calcCommitmentAverage(commitmentsList, updatedQuarterMetrics);

        updatedUserObj = {
          ...u,
          commitmentAverage,
          quarterlyMetrics: updatedQuarterly,
        };
        return updatedUserObj;
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users_fy26_frejun_wig_data', JSON.stringify(updatedUsers));

    // Persist to Firestore
    if (updatedUserObj) {
      try {
        await saveUserWigData(activeUser.id, updatedUserObj);
        addToast(`${editingWig.title} updated in cloud database!`, 'success');
      } catch (err) {
        console.warn('Failed to save to Firestore:', err);
        addToast(`${editingWig.title} saved to offline cache (cloud update failed)`, 'info');
      }
    }

    setEditingWig(null);
  };

  const handleUpdateCommitmentProgress = async (weekNum: number, itemId: string, newCurrent: number) => {
    if (!activeUser) return;

    let updatedUserObj: any = null;

    const updatedUsers = users.map((u) => {
      if (u.id === activeUser.id) {
        const quarterly = (u as any).quarterlyMetrics;
        if (!quarterly) return u;

        const currentQuarterData = quarterly[selectedQuarter];
        const commitmentsList = currentQuarterData.commitments || [];
        
        const updatedCommitments = commitmentsList.map((c: any) => {
          if (c.week === weekNum) {
            return {
              ...c,
              items: c.items.map((item: any) => {
                if (item.id === itemId) {
                  const clampedCurrent = Math.max(0, Math.min(newCurrent, item.target || newCurrent));
                  return {
                    ...item,
                    current: clampedCurrent,
                    completed: item.target > 0 ? clampedCurrent >= item.target : newCurrent > 0
                  };
                }
                return item;
              })
            };
          }
          return c;
        });

        const updatedQuarterData = {
          ...currentQuarterData,
          commitments: updatedCommitments
        };

        const commitmentAverage = calcCommitmentAverage(updatedCommitments);

        updatedUserObj = {
          ...u,
          commitmentAverage,
          quarterlyMetrics: {
            ...quarterly,
            [selectedQuarter]: updatedQuarterData
          }
        };
        return updatedUserObj;
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users_fy26_frejun_wig_data', JSON.stringify(updatedUsers));

    if (updatedUserObj) {
      try {
        await saveUserWigData(activeUser.id, updatedUserObj);
        addToast('Progress updated!', 'success');
      } catch (err) {
        console.warn('Failed to sync commitments to Firestore:', err);
      }
    }
  };

  const handleAddCommitment = async (weekNum: number, text: string, target: number = 1) => {
    if (!activeUser) return;

    let updatedUserObj: any = null;

    const updatedUsers = users.map((u) => {
      if (u.id === activeUser.id) {
        const quarterly = (u as any).quarterlyMetrics;
        if (!quarterly) return u;

        const currentQuarterData = quarterly[selectedQuarter];
        const commitmentsList = currentQuarterData.commitments || [];
        
        const newItem = {
          id: Math.random().toString(36).substring(2, 9),
          text,
          target,
          current: 0,
          completed: false
        };

        let weekFound = false;
        const updatedCommitments = commitmentsList.map((c: any) => {
          if (c.week === weekNum) {
            weekFound = true;
            return {
              ...c,
              items: [...c.items, newItem]
            };
          }
          return c;
        });

        // If no entry existed for this week, create one
        if (!weekFound) {
          updatedCommitments.push({
            week: weekNum,
            items: [newItem]
          });
          // Sort by week number so the UI stays ordered
          updatedCommitments.sort((a: any, b: any) => a.week - b.week);
        }

        const updatedQuarterData = {
          ...currentQuarterData,
          commitments: updatedCommitments
        };

        const commitmentAverage = calcCommitmentAverage(updatedCommitments);

        updatedUserObj = {
          ...u,
          commitmentAverage,
          quarterlyMetrics: {
            ...quarterly,
            [selectedQuarter]: updatedQuarterData
          }
        };
        return updatedUserObj;
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users_fy26_frejun_wig_data', JSON.stringify(updatedUsers));

    if (updatedUserObj) {
      try {
        await saveUserWigData(activeUser.id, updatedUserObj);
        addToast('New commitment registered!', 'success');
      } catch (err) {
        console.warn('Failed to sync commitment to Firestore:', err);
      }
    }
  };

  const handleDeleteCommitment = async (weekNum: number, itemId: string) => {
    if (!activeUser) return;

    let updatedUserObj: any = null;

    const updatedUsers = users.map((u) => {
      if (u.id === activeUser.id) {
        const quarterly = (u as any).quarterlyMetrics;
        if (!quarterly) return u;

        const currentQuarterData = quarterly[selectedQuarter];
        const commitmentsList = currentQuarterData.commitments || [];

        const updatedCommitments = commitmentsList.map((c: any) => {
          if (c.week === weekNum) {
            return {
              ...c,
              items: c.items.filter((item: any) => item.id !== itemId)
            };
          }
          return c;
        });

        const updatedQuarterData = {
          ...currentQuarterData,
          commitments: updatedCommitments
        };

        const commitmentAverage = calcCommitmentAverage(updatedCommitments);

        updatedUserObj = {
          ...u,
          commitmentAverage,
          quarterlyMetrics: {
            ...quarterly,
            [selectedQuarter]: updatedQuarterData
          }
        };
        return updatedUserObj;
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users_fy26_frejun_wig_data', JSON.stringify(updatedUsers));

    if (updatedUserObj) {
      try {
        await saveUserWigData(activeUser.id, updatedUserObj);
        addToast('Commitment deleted', 'info');
      } catch (err) {
        console.warn('Failed to sync deletion to Firestore:', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    addToast('Logging out...', 'info');
    setTimeout(() => {
      router.replace('/login');
    }, 500);
  };

  if (showPreloader || !authorized || !activeUser) {
    return <Loader fullScreen={true} text="Initializing 4DX Workspace..." />;
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-background text-on-background font-body-md">
      {/* Sidebar Navigation */}
      <Sidebar
        activeUser={activeUser}
        onSelectUser={(user) => {
          setActiveUserId(user.id);
          setViewMode('individual');
          setActiveTab('wigs');
          addToast(`Active profile: ${user.name}`, 'success');
        }}
        activeTeam={activeTeam}
        onSelectTeam={handleSelectTeam}
        sessionActive={sessionActive}
        onToggleSession={handleToggleSession}
        sessionTime={getFormattedSessionTime()}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
        userRole={userRole}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-surface-bright bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-low/50 via-surface-bright to-surface-bright">
        {/* Top Header */}
        <Header
          activeUser={activeUser}
          onOpenExport={() => setExportModalOpen(true)}
          userRole={userRole}
          viewMode={viewMode}
          onChangeViewMode={(mode) => setViewMode(mode)}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {/* Quarter selection and Date Pickers Control Card */}
          <div className="mx-auto w-full max-w-3xl mb-8 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            
            {/* Row 1: Selectors (Financial Quarter & Goal Filter side-by-side) */}
            <div className={`grid gap-5 w-full ${viewMode === 'individual' && activeTab === 'wigs' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Financial Quarter Selector */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1 font-label-sm">
                  Financial Quarter
                </label>
                <div className="flex bg-surface-container-low border border-outline-variant/20 rounded-xl p-1 shadow-sm gap-1 w-full justify-between">
                  {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => {
                    const isActive = selectedQuarter === q;
                    const labels = {
                      q1: { name: 'Q1', desc: 'Apr - Jun' },
                      q2: { name: 'Q2', desc: 'Jul - Sep' },
                      q3: { name: 'Q3', desc: 'Oct - Dec' },
                      q4: { name: 'Q4', desc: 'Jan - Mar' },
                    };
                    return (
                      <button
                        key={q}
                        onClick={() => handleSelectQuarter(q)}
                        className={`px-3 py-1.5 rounded-lg flex flex-col items-center transition-all flex-1 ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-sm font-bold scale-[1.02]'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                        }`}
                      >
                        <span className="text-body-sm font-bold">{labels[q].name}</span>
                        <span className={`text-[9px] opacity-70 mt-0.5 ${isActive ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                          {labels[q].desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goal Views Filter (Only shown in individual WIG view) */}
              {viewMode === 'individual' && activeTab === 'wigs' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1 font-label-sm">
                    Goal View Filter
                  </label>
                  <div className="flex bg-surface-container-low border border-outline-variant/20 rounded-xl p-1 shadow-sm gap-1 w-full justify-between">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'revenue', label: 'Revenue' },
                      { value: 'pipeline', label: 'Pipeline' },
                      { value: 'seats', label: 'Seats' },
                    ].map((item) => {
                      const isActive = goalFilter === item.value;
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleGoalFilterChange(item.value)}
                          className={`px-3 py-2.5 rounded-lg text-body-sm font-semibold transition-all flex-1 cursor-pointer ${
                            isActive
                              ? 'bg-primary text-on-primary shadow-sm font-bold scale-[1.02]'
                              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: Custom Date Range Selector (Separated by Divider) */}
            <div className="border-t border-outline-variant/15 pt-5 flex flex-col md:flex-row gap-4 items-center justify-between w-full">
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-0.5 font-label-sm">
                  Custom Range Picker
                </span>
                <span className="text-[11px] text-on-surface-variant/80 font-body-sm">
                  Select custom date thresholds for targeted WIG reporting
                </span>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => {
                    setStartDate('2026-07-01');
                    setEndDate(todayStr);
                    addToast('Reset range to YTD (1 July 2026)', 'info');
                  }}
                  className="px-3.5 py-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">history</span>
                  YTD
                </button>

                <div className="flex items-center gap-3 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl px-4 py-2 shadow-sm w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-on-surface border border-outline-variant/10 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-[12px] font-medium"
                    />
                  </div>
                  <div className="w-3 h-px bg-outline-variant/60"></div>
                  <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-on-surface border border-outline-variant/10 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-[12px] font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'overview' ? (
            <div className="mx-auto w-full max-w-3xl">
              <TeamScoreboard 
                users={users} 
                selectedQuarter={selectedQuarter} 
                onDrillDown={(userId) => {
                  const selectedUser = users.find(u => u.id === userId);
                  if (selectedUser) {
                    setActiveUserId(userId);
                    setActiveTeam(selectedUser.team);
                    setViewMode('individual');
                    setActiveTab('wigs');
                    addToast(`Drilled down to ${selectedUser.name}`, 'success');
                  }
                }} 
              />
            </div>
          ) : viewMode === 'leaderboard' ? (
            <div className="mx-auto w-full max-w-3xl animate-fade-in">
              <div className="flex justify-between mb-8 w-full max-w-3xl mx-auto border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                    <span className="material-symbols-outlined text-[26px]">stars</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] font-bold text-on-surface">Calling Leaderboard</h3>
                    <p className="text-xs text-on-surface-variant font-body-sm">Recruiter Performance Rankings</p>
                  </div>
                </div>
              </div>
              <Leaderboard users={users} allAnalytics={allAnalytics} />
            </div>
          ) : viewMode === 'project_head' ? (
            <div className="mx-auto w-full max-w-3xl animate-fade-in">
              <div className="flex justify-between mb-8 w-full max-w-3xl mx-auto border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                    <span className="material-symbols-outlined text-[26px]">query_stats</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] font-bold text-on-surface">Project Head Dashboard</h3>
                    <p className="text-xs text-on-surface-variant font-body-sm">Cumulative WIG Performance & Share</p>
                  </div>
                </div>
              </div>
              <ProjectHead users={users} selectedQuarter={selectedQuarter} />
            </div>
          ) : (
            <>
              {/* Profile Sub-Tab Selector Segment Controls */}
              <div className="flex bg-surface-container-low border border-outline-variant/15 rounded-xl p-1 shadow-sm gap-1 w-full max-w-3xl mx-auto mb-8 relative z-10">
                <button
                  onClick={() => setActiveTab('wigs')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'wigs'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                  WIG Scoreboard
                </button>
                <button
                  onClick={() => setActiveTab('commitments')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'commitments'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                  Weekly Commitments
                </button>
              </div>

              {activeTab === 'wigs' ? (
                <>
                  {/* 4DX Scoreboard Chart Component (Full Width) */}
                  <div className="mx-auto w-full max-w-3xl mb-8">
                    <ScoreboardChart 
                      weeklyHistory={(activeUser as any).weeklyHistory || []} 
                      metrics={activeUser.metrics} 
                      goalFilter={goalFilter} 
                    />
                  </div>

                  <div className="flex justify-between mb-8 w-full max-w-3xl mx-auto border-b border-outline-variant/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-error to-error-container rounded-full shadow-[0_0_8px_rgba(186,26,26,0.4)]"></div>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                        Primary WIGs — {selectedQuarter.toUpperCase()} View
                      </h3>
                    </div>
                  </div>

                  {/* WIG Cards (Full Width Stack Layout) */}
                  <div className="mx-auto grid gap-6 pt-2 w-full max-w-3xl flex-col">
                    <AnimatePresence mode="popLayout">
                      {/* Revenue Card */}
                      {(goalFilter === 'all' || goalFilter === 'revenue') && (
                        <motion.div
                          key="revenue-card"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <WigCard
                            type="revenue"
                            title="Revenue"
                            subtitle="Total revenue target for the current quarter"
                            iconName="account_balance_wallet"
                            metric={activeUser.metrics.revenue}
                            isCurrency={true}
                            onEdit={userRole !== 'admin' ? () => {
                              setEditingWig({ type: 'revenue', title: 'Revenue Target', currentVal: activeUser.metrics.revenue.current });
                              setInputVal(activeUser.metrics.revenue.current.toString());
                            } : undefined}
                          />
                        </motion.div>
                      )}

                      {/* Pipeline Card */}
                      {(goalFilter === 'all' || goalFilter === 'pipeline') && (
                        <motion.div
                          key="pipeline-card"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <WigCard
                            type="pipeline"
                            title="Pipeline"
                            subtitle="Active opportunities in the sales funnel"
                            iconName="trending_up"
                            metric={activeUser.metrics.pipeline}
                            isCurrency={true}
                            onEdit={userRole !== 'admin' ? () => {
                              setEditingWig({ type: 'pipeline', title: 'Pipeline Target', currentVal: activeUser.metrics.pipeline.current });
                              setInputVal(activeUser.metrics.pipeline.current.toString());
                            } : undefined}
                          />
                        </motion.div>
                      )}

                      {/* Seats Card */}
                      {(goalFilter === 'all' || goalFilter === 'seats') && (
                        <motion.div
                          key="seats-card"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <WigCard
                            type="seats"
                            title="Seat Confirmed"
                            subtitle="Total seats booked across all programs"
                            iconName="event_seat"
                            metric={activeUser.metrics.seats}
                            isCurrency={false}
                            onEdit={userRole !== 'admin' ? () => {
                              setEditingWig({ type: 'seats', title: 'Seat Confirmed Target', currentVal: activeUser.metrics.seats.current });
                              setInputVal(activeUser.metrics.seats.current.toString());
                            } : undefined}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* Weekly Commitments Tab (Full Width Scorecard Panel) */
                <div className="mx-auto w-full max-w-3xl pt-2">
                  <CommitmentPanel 
                    commitments={(activeUser as any).commitments || []} 
                    onUpdateCommitmentProgress={handleUpdateCommitmentProgress} 
                    onAddCommitment={handleAddCommitment} 
                    onDeleteCommitment={handleDeleteCommitment}
                    userRole={userRole}
                  />
                </div>
              )}

          {/* FreJun Calling Data Section (Admin User presentation view only) */}
          {userRole === 'admin' && (
            <div className="mx-auto w-full max-w-3xl mt-10 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                    <span className="material-symbols-outlined text-[26px]">call</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] font-bold text-on-surface">FreJun Calling Analytics</h3>
                    <p className="text-xs text-on-surface-variant font-body-sm">VoIP and network calling insights for {activeUser.name} ({activeUser.email})</p>
                  </div>
                </div>
                {loadingCalls && (
                  <span className="material-symbols-outlined text-[20px] text-primary animate-spin">autorenew</span>
                )}
              </div>

              {/* FreJun Date Controls Row */}
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                {/* Timeframe Preset Buttons */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { key: 'today' as const, label: 'Today', icon: 'today' },
                    { key: 'yesterday' as const, label: 'Yesterday', icon: 'event' },
                    { key: 'last_week' as const, label: 'Last 7 Days', icon: 'date_range' },
                    { key: 'this_month' as const, label: 'This Month', icon: 'calendar_month' },
                    { key: 'ytd' as const, label: 'YTD', icon: 'history' },
                  ].map((tf) => (
                    <button
                      key={tf.key}
                      onClick={() => handleFrejunTimeframe(tf.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                        frejunTimeframe === tf.key
                          ? 'bg-primary text-on-primary shadow-sm scale-[1.02]'
                          : 'bg-surface-container-low/50 border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{tf.icon}</span>
                      {tf.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Picker */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">calendar_today</span>
                  <input
                    type="date"
                    value={frejunStartDate}
                    onChange={(e) => { setFrejunStartDate(e.target.value); setFrejunTimeframe('custom'); }}
                    className="bg-surface-container-low/40 text-on-surface border border-outline-variant/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-[11px] font-medium"
                  />
                  <div className="w-2.5 h-px bg-outline-variant/60"></div>
                  <input
                    type="date"
                    value={frejunEndDate}
                    onChange={(e) => { setFrejunEndDate(e.target.value); setFrejunTimeframe('custom'); }}
                    className="bg-surface-container-low/40 text-on-surface border border-outline-variant/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-[11px] font-medium"
                  />
                </div>
              </div>

              {loadingCalls && calls.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader size={120} text="Fetching calling insights..." />
                </div>
              ) : errorCalls ? (
                <div className="py-6 text-center text-error border border-error/10 bg-error/5 rounded-xl text-body-sm">
                  Error fetching calling data: {errorCalls}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Call Summary Stats */}
                  <div className="md:col-span-1 flex flex-col gap-4">
                    <div className="bg-surface-container-low/40 border border-outline-variant/20 rounded-xl p-4 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Dialed Calls</span>
                      <div className="text-display-lg text-[28px] font-bold text-primary">
                        {analyticsData?.total_calls || 0}
                      </div>
                    </div>
                    <div className="bg-surface-container-low/40 border border-outline-variant/20 rounded-xl p-4 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Answered Calls</span>
                      <div className="text-display-lg text-[28px] font-bold text-secondary">
                        {analyticsData?.answered_calls || 0}
                        {analyticsData?.total_calls ? (
                          <span className="text-xs text-on-surface-variant font-semibold ml-1.5">
                            ({Math.round((analyticsData.answered_calls / analyticsData.total_calls) * 100)}%)
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="bg-surface-container-low/40 border border-outline-variant/20 rounded-xl p-4 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Duration</span>
                      <div className="text-display-lg text-[28px] font-bold text-primary">
                        {analyticsData?.total_minutes ? Math.round(analyticsData.total_minutes) : 0} <span className="text-xs font-semibold">mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Recent Calls logs */}
                  <div className="md:col-span-2 flex flex-col gap-3">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Recent VoIP & Network Logs</span>
                    {calls.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant text-body-sm">
                        No recent calls recorded for this user.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {calls.map((call: any) => {
                          const callDate = new Date(call.call_start_time).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          const isAnswered = call.status === 'answered';
                          return (
                            <div key={call.call_id} className="flex justify-between items-center p-3 border border-outline-variant/20 bg-surface-container-low/20 hover:bg-surface-container-low/50 rounded-xl transition-all">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg flex items-center justify-center ${
                                  call.call_type === 'outgoing' ? 'bg-primary/5 text-primary' : 'bg-secondary/5 text-secondary'
                                }`}>
                                  <span className="material-symbols-outlined text-[16px]">
                                    {call.call_type === 'outgoing' ? 'call_made' : 'call_received'}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-body-sm font-bold text-on-surface">
                                    {call.candidate_number}
                                  </div>
                                  <div className="text-[10px] text-on-surface-variant opacity-80">
                                    {callDate} • {Math.round(call.call_duration * 60)}s duration
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isAnswered ? 'bg-secondary-container/80 text-on-secondary-container' : 'bg-error-container/80 text-on-error-container'
                                }`}>
                                  {call.status}
                                </span>
                                {call.recording_url && (
                                  <a
                                    href={call.recording_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                                    title="Listen to Recording"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}

        </div>
      </main>

      {/* Export Flow Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        activeUser={activeUser}
      />

      {/* Update WIG Metric Modal */}
      <AnimatePresence>
        {editingWig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center font-body-md">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary/45 backdrop-blur-sm"
              onClick={() => setEditingWig(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-surface-container-lowest border border-outline-variant/40 w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
                <h3 className="font-headline-md text-[18px] font-bold text-on-surface">
                  Update {editingWig.title} ({selectedQuarter.toUpperCase()})
                </h3>
                <button
                  onClick={() => setEditingWig(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
                    New Current Value
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    {editingWig.type !== 'seats' && (
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant font-medium text-body-md">
                        ₹
                      </div>
                    )}
                    <input
                      type="number"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Enter new metric value..."
                      className={`block w-full rounded-lg border border-outline-variant/50 bg-surface-container-lowest py-2.5 text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-body-md ${
                        editingWig.type !== 'seats' ? 'pl-8 pr-4' : 'px-4'
                      }`}
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant opacity-80 mt-1 leading-relaxed">
                    Enter the updated progress metric for {selectedQuarter.toUpperCase()}. The completion percentage progress bar will recalculate automatically.
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setEditingWig(null)}
                    className="px-4 py-2 border border-outline-variant/60 rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-colors text-body-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const num = Number(inputVal);
                      if (!isNaN(num) && num >= 0) {
                        handleUpdateWig(num);
                      } else {
                        addToast('Please enter a valid positive number', 'error');
                      }
                    }}
                    className="px-5 py-2 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-body-sm shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Panel (Slide-out) */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-30"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-surface-container-lowest border-l border-outline-variant/30 shadow-2xl z-40 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Settings</h3>
                  <button 
                    onClick={() => setSettingsOpen(false)}
                    className="p-1 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                      Dashboard Display Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue="Sales Performance"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                      Theme Option
                    </label>
                    <select className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface">
                      <option>System Default</option>
                      <option>Precision Performance Light</option>
                      <option>Slate Dark Mode</option>
                    </select>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSettingsOpen(false);
                  addToast('Settings saved successfully', 'success');
                }}
                className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-headline-md text-body-md font-bold shadow-md hover:bg-primary/95 transition-all"
              >
                Save Preferences
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Toasts container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`px-4 py-3 rounded-xl shadow-lg border text-body-sm font-semibold flex items-center gap-2 ${
                toast.type === 'success'
                  ? 'bg-secondary-container/90 text-on-secondary-container border-secondary-container/30 backdrop-blur-md'
                  : toast.type === 'error'
                  ? 'bg-error-container/90 text-on-error-container border-error-container/30 backdrop-blur-md'
                  : 'bg-primary-fixed/90 text-on-primary-fixed border-primary-fixed/30 backdrop-blur-md'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
