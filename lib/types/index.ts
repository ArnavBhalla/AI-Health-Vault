// Shared TypeScript types

export interface User {
  id: string;
  email: string;
  name?: string;
  publicKey: string;
  createdAt: Date;
}

export interface Record {
  id: string;
  userId: string;
  type: 'lab' | 'imaging' | 'document' | 'fhir';
  filename: string;
  ciphertextUrl: string;
  wrappedKey: string;
  metadata?: RecordMetadata;
  source?: string;
  createdAt: Date;
}

export interface RecordMetadata {
  labName?: string;
  value?: number;
  unit?: string;
  range?: string;
  date?: string;
  [key: string]: any;
}

export interface Wearable {
  id: string;
  userId: string;
  date: Date;
  steps?: number;
  sleepHours?: number;
  restingHR?: number;
  activeHR?: number;
  metadata?: any;
}

export interface AIExplanation {
  id: string;
  recordId: string;
  userId: string;
  summary: string;
  trend?: 'up' | 'down' | 'stable' | 'normal';
  severity?: -1 | 0 | 1;
  education?: string;
  model: string;
  wasDeidentified: boolean;
  createdAt: Date;
}

export interface ShareLink {
  id: string;
  userId: string;
  token: string;
  recordIds: string;
  wrappedKeys: string;
  expiresAt: Date;
  maxViews?: number;
  viewCount: number;
  isRevoked: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  event: 'upload' | 'analyze' | 'share' | 'access' | 'delete';
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  previousHash?: string;
  currentHash: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// API Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  publicKey: string;
  encryptedPrivateKey: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UploadRecordRequest {
  type: 'lab' | 'imaging' | 'document' | 'fhir';
  filename: string;
  ciphertext: string;
  wrappedKey: string;
  iv: string;
  metadata?: RecordMetadata;
  source?: string;
}

export interface AIExplainRequest {
  recordId: string;
}

export interface CreateShareLinkRequest {
  recordIds: string[];
  expiresInHours: number;
  maxViews?: number;
}
