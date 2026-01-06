
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CONSULTANT = 'CONSULTANT',
  EDUCATION = 'EDUCATION',
  MARKETING = 'MARKETING',
  DEVELOPER = 'DEVELOPER',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}

export interface ApiKey {
  id: string;
  key: string;
  label: string;
  addedAt: number;
  isActive: boolean;
  isValid: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date | number; // Allow number for serialization
  isTyping?: boolean;
  isAgentic?: boolean;
  sources?: { title: string; uri: string }[];
  agentSteps?: string[];
  executionTime?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastModified: number;
  isDeleted: boolean;
}

export interface CourseModule {
  moduleTitle: string;
  description: string;
  duration: string;
  keyTakeaways: string[];
}

export interface MarketingContent {
  platform: string;
  tone: string;
  content: string;
  hashtags: string[];
}

export interface DashboardData {
  revenueHistory: { month: string; revenue: number; expenses: number }[];
  customerHistory: { month: string; customers: number }[];
  metrics: {
    totalRevenue: string;
    revenueGrowth: string;
    activeCustomers: string;
    customerGrowth: string;
    satisfaction: string;
    aiInsight: string;
  };
  simulationSources?: { title: string; uri: string }[];
}

export interface ActivityLog {
  id: string;
  type: 'DASHBOARD' | 'EDUCATION' | 'MARKETING';
  title: string;
  timestamp: number;
  data: any; // Stores the specific result (DashboardData, CourseModule[], or Marketing text)
  inputSummary: string; // Brief description of what generated this
}