// src/types/Review.ts
export interface ReviewListItem {
  _id: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  status: 'published' | 'flagged' | 'hidden';
  doctorId: { _id: string; profile: { firstName: string; lastName: string } } | null;
  patientId: { _id: string; profile: { firstName: string; lastName: string } } | null;
  metadata: { createdAt: string };
}

export type ReviewStatusFilter = 'all' | 'published' | 'flagged' | 'hidden';