export type ContentType = 'youtube' | 'instagram' | 'link' | 'note' | 'idea' | 'snippet';
export type ContentStatus = 'active' | 'archived' | 'deleted' ;
export type ReviewResult = 'easy' | 'good' | 'hard' | 'forgot';
export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface ContentItem {
    _id: string,
    userId: string,
    type: ContentType,
    sourceUrl?: string,
    sourcePlatform?: string,
    thumbnailUrl?: string,
    title: string,
    rawContent: string,
    summary: string,
    tags:string[],
    category: string,
    subcategory: string,
    manualNote?: string,
    status: ContentStatus,
    isPinned: boolean,
    importanceScore: number,
    aiQuestions: string[],
    processingStatus: ProcessingStatus,
    isDuplicate: boolean,
    createdAt: string,
    updatedAt: string,
}

export interface ReviewState{
     _id: string;
  contentId: string;
  userId: string;
  nextReviewDate: string;
  lastReviewedAt: string | null;
  recallCount: number;
  recallStrength: number;
  interval: number;
  easeFactor: number;
  isCompleted: boolean;
}

export interface User{
    _id: string,
    name: string,
    email: string,
    createdAt: string,
     preferences: {
    defaultCategory: string;
    reminderTime: string;
    timezone: string;
    emailReminders: boolean;
  };
}

export interface ApiResponse<T>{
    success: boolean,
    data?: T;
    error?: string,
    message?: string
}

export interface PaginatedResponse<T>{
    success: boolean;
    data?:{
        items: T[];
        total: number;
        page: number;
        totalPages: number;
        hasMore: boolean
    };
    error?: string
}