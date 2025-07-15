// Database-related TypeScript types

export interface TableData {
  table_name: string
  columns: Array<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string
  }>
  row_count: number
  relationships: Array<{
    foreign_table_name: string
    foreign_column_name: string
  }>
}

export interface DatabaseStats {
  total_tables: number
  total_records: number
  table_stats: Array<{
    table_name: string
    record_count: number
  }>
}

export interface DatabaseValidation {
  status: string
  severity: string
  total_issues: number
  issues: {
    errors: string[]
    warnings: string[]
    suggestions: string[]
    relationship_issues: string[]
    id_system_issues: string[]
  }
  timestamp: string
}

export interface DatabaseNotification {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface TableHealth {
  table_name: string
  status: 'healthy' | 'warning' | 'critical'
  issues: string[]
  record_count: number
}

export interface QueryResult {
  columns: string[]
  rows: any[]
  execution_time: number
  row_count: number
}
