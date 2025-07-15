// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Record Data Types
export interface RecordData {
  [key: string]: unknown
}

export interface CreateRecordData {
  [key: string]: unknown
  // Common fields for creating records
}

export interface UpdateRecordData {
  [key: string]: unknown
  // Common fields for updating records
}

// Customer Types
export interface Customer {
  system_id: string
  name: string
  email: string
  phone?: string
  created_at: string
  [key: string]: unknown
}

// Project Types  
export interface Project {
  system_id: string
  name: string
  status: string
  created_at: string
  [key: string]: unknown
}

// Invoice Types
export interface Invoice {
  system_id: string
  customer_id?: string
  amount: number | string
  status: string
  created_at: string
  [key: string]: unknown
}
