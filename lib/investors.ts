export interface Investor {
  id: string;
  name: string;
  logoSrc: string;
  website?: string;
  type: 'fund' | 'foundation' | 'accelerator';
  featured?: boolean;
}

export const investors: Investor[] = [
  {
    id: 'investor-1',
    name: 'Investor 1',
    logoSrc: '/images/1.png',
    type: 'fund'
  },
  {
    id: 'investor-2', 
    name: 'Investor 2',
    logoSrc: '/images/2.png',
    type: 'fund'
  },
  {
    id: 'investor-3',
    name: 'Investor 3', 
    logoSrc: '/images/3.png',
    type: 'fund'
  },
  {
    id: 'investor-4',
    name: 'Investor 4',
    logoSrc: '/images/4.png',
    type: 'fund'
  },
  {
    id: 'investor-6',
    name: 'Investor 6',
    logoSrc: '/images/6.png',
    type: 'fund'
  },
  {
    id: 'investor-7',
    name: 'Investor 7',
    logoSrc: '/images/7.png',
    type: 'fund'
  },
  {
    id: 'investor-8',
    name: 'Investor 8',
    logoSrc: '/images/8.png',
    type: 'fund'
  },
  {
    id: 'investor-9',
    name: 'Investor 9',
    logoSrc: '/images/9.png',
    type: 'fund'
  }
];

export const accelerators = [
  {
    id: 'astar-sony',
    name: 'Astar + Sony Accelerator',
    description: 'Graduate Program 2024',
    website: 'https://astar.network'
  },
  {
    id: 'denarii-labs',
    name: 'Denarii Labs',
    description: 'Accelerator Program',
    website: 'https://denarii.io'
  }
];
