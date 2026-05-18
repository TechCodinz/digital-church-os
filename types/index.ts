export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: 'VISITOR' | 'MEMBER' | 'CHURCH_ADMIN' | 'AI_DEPARTMENT';
  faithPreference: string;
  createdAt: Date;
}

export interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'ANONYMOUS';
  isAnswered: boolean;
  createdAt: Date;
  userId: string;
  user?: User;
}

export interface Conference {
  id: string;
  title: string;
  theme: string;
  scriptureRefs: string[];
  startDate: Date;
  endDate: Date;
  virtualRoomLink?: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  attendees?: ConferenceAttendance[];
}

export interface ConferenceAttendance {
  id: string;
  userId: string;
  attended: boolean;
  conferenceId: string;
  conference: Conference;
}

export interface Offering {
  id: string;
  amount: number;
  purpose: 'PLATFORM_UPKEEP' | 'COMMUNITY_AID' | 'CONFERENCE_SUPPORT';
  createdAt: Date;
  userId: string;
}

export interface AidRequest {
  id: string;
  category: 'MEDICAL' | 'HOUSING' | 'FOOD' | 'EDUCATION' | 'UTILITIES' | 'EMERGENCY' | 'OTHER';
  title: string;
  description: string;
  amount?: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  createdAt: Date;
  user: User;
}

export interface AIInteraction {
  id: string;
  moduleType: string;
  input: any;
  output?: any;
  createdAt: Date;
  userId: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: User;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  scriptureRef?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  likes: number;
  createdAt: Date;
  user: {
    name: string | null;
    avatar: string | null;
  };
  comments?: Comment[];
  _count?: {
    comments: number;
    likes: number;
  };
}
