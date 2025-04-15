// Enums
export enum UserRole {
  Writer = "writer",
  Sketcher = "sketcher"
}

// Interfaces
export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Prompt {
  id: string;
  creator: User;
  creatorRole: UserRole;
  type: 'text' | 'image';
  content: string;
  isActive: boolean;
  contributionsCount: number;
  commentsCount: number;
  likes: number;
  comments: number;
}

export interface Submission {
  id: string;
  promptId: string;
  creator: User;
  type: 'text' | 'image';
  content: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  timeAgo: string;
}

export interface Collaboration {
  id: string;
  promptId: string;
  image: string;
  imageAlt?: string;
  text: string;
  collaborators: User[];
}
