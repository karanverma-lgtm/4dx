export interface Metric {
  current: number;
  target: number;
  formattedTarget: string;
  progress: number; // percentage
}

export interface UserPerformance {
  id: string;
  name: string;
  avatarUrl: string;
  commitmentAverage: number;
  team: 'Executive Board' | 'Open Program';
  email: string;
  metrics: {
    revenue: Metric;
    pipeline: Metric;
    seats: Metric;
  };
}

export const mockUsers: UserPerformance[] = [
  {
    id: "rahul-bhatia",
    name: "Rahul Bhatia",
    avatarUrl: "https://xmonks.com/ourteam-assets/images/rahul_bhatia.png",
    commitmentAverage: 71,
    team: "Open Program",
    email: "saurav.tiwari@xmonks.com",
    metrics: {
      revenue: {
        current: 1750000,
        target: 2500000,
        formattedTarget: "25 Lakhs",
        progress: 70,
      },
      pipeline: {
        current: 5550000,
        target: 7500000,
        formattedTarget: "75 Lakhs",
        progress: 74,
      },
      seats: {
        current: 78,
        target: 125,
        formattedTarget: "125",
        progress: 62,
      },
    },
  },
  {
    id: "gitanjali",
    name: "Gitanjali",
    avatarUrl: "https://xmonks.com/ourteam-assets/images/geetanjali.png",
    commitmentAverage: 88,
    team: "Executive Board",
    email: "gitanjali@xmonks.com",
    metrics: {
      revenue: {
        current: 2175000,
        target: 2500000,
        formattedTarget: "25 Lakhs",
        progress: 87,
      },
      pipeline: {
        current: 6825000,
        target: 7500000,
        formattedTarget: "75 Lakhs",
        progress: 91,
      },
      seats: {
        current: 112,
        target: 125,
        formattedTarget: "125",
        progress: 90,
      },
    },
  },
  {
    id: "chirag",
    name: "Chirag",
    avatarUrl: "https://xmonks.com/ourteam-assets/images/chirag.png",
    commitmentAverage: 51,
    team: "Open Program",
    email: "chirag.khurana@xmonks.com",
    metrics: {
      revenue: {
        current: 1300000,
        target: 2500000,
        formattedTarget: "25 Lakhs",
        progress: 52,
      },
      pipeline: {
        current: 4050000,
        target: 7500000,
        formattedTarget: "75 Lakhs",
        progress: 54,
      },
      seats: {
        current: 59,
        target: 125,
        formattedTarget: "125",
        progress: 47,
      },
    },
  },
  {
    id: "priyanka",
    name: "Priyanka",
    avatarUrl: "https://xmonks.com/ourteam-assets/images/priyanka_bedi.png",
    commitmentAverage: 77,
    team: "Executive Board",
    email: "priyanka@xmonks.com",
    metrics: {
      revenue: {
        current: 1950000,
        target: 2500000,
        formattedTarget: "25 Lakhs",
        progress: 78,
      },
      pipeline: {
        current: 6075000,
        target: 7500000,
        formattedTarget: "75 Lakhs",
        progress: 81,
      },
      seats: {
        current: 90,
        target: 125,
        formattedTarget: "125",
        progress: 72,
      },
    },
  },
];

export interface UserCredential {
  username: string;
  password: string;
  role: 'admin' | 'user';
  userId: string;
  name: string;
}

export const USER_CREDENTIALS: UserCredential[] = [
  { username: 'admin', password: 'nimda', role: 'admin', userId: 'admin', name: 'System Administrator' },
  { username: 'rahul', password: 'luhar', role: 'user', userId: 'rahul-bhatia', name: 'Rahul Bhatia' },
  { username: 'gitanjali', password: 'ilajnatig', role: 'user', userId: 'gitanjali', name: 'Gitanjali' },
  { username: 'chirag', password: 'garihc', role: 'user', userId: 'chirag', name: 'Chirag' },
  { username: 'priyanka', password: 'aknayirp', role: 'user', userId: 'priyanka', name: 'Priyanka' },
];
