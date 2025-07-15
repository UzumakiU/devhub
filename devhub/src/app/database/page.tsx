'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import useAuth from '@/hooks/useAuth'
import { api } from '@/lib/api'

interface TableData {
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

interface DatabaseStats {
  total_tables: number
  total_records: number
  table_stats: Array<{
    table_name: string
    record_count: number
  }>
}

interface DatabaseValidation {
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

interface DatabaseNotification {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: Date
  acknowledged: boolean
  source: string
}

interface TableHealth {
  table_name: string
  health_score: number
  issues: string[]
  recommendations: string[]
  last_checked: Date
}

export default function DatabasePage() {
  const { token, user } = useAuth()
  const [tables, setTables] = useState<TableData[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableData, setTableData] = useState<any[]>([])
  const [schema, setSchema] = useState<any>(null)
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'schema' | 'validator' | 'monitoring' | 'notifications'>('overview')
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<any>({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRecord, setNewRecord] = useState<any>({})
  const [autoRefresh, setAutoRefresh] = useState(false) // Changed default to false
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [validation, setValidation] = useState<DatabaseValidation | null>(null)
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([])
  const [tableHealth, setTableHealth] = useState<TableHealth[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'healthy' | 'warning' | 'error'>('healthy')
  const [dataUpdateAvailable, setDataUpdateAvailable] = useState(false) // New state for pending updates

  // Debug authentication status
  console.log('Database Page - Auth Status:', { 
    hasToken: !!token, 
    tokenLength: token?.length, 
    user: user?.email,
    localStorageToken: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : 'N/A (SSR)',
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    if (token) {
      console.log('Token available, fetching database overview...')
      fetchDatabaseOverview()
      checkTableHealth() // Initialize health check
      performConnectionTest() // Check initial connection status
    } else {
      console.log('No token available, user needs to log in')
      setError('Authentication required. Please log in to access the database.')
      setLoading(false)
    }
  }, [token])

  // Auto-refresh every 30 seconds when enabled - BUT only for background data checks
  useEffect(() => {
    if (autoRefresh && token) {
      const interval = setInterval(() => {
        // Only do silent background checks, don't refresh visible data
        checkForDataUpdates()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, token])

  // Real-time monitoring for critical issues - non-intrusive background monitoring
  useEffect(() => {
    if (realTimeMonitoring && token) {
      const monitoringInterval = setInterval(() => {
        validateDatabaseSilent()
        checkTableHealthSilent()
        performConnectionTestSilent()
      }, 300000) // Every 5 minutes instead of 1 minute
      return () => clearInterval(monitoringInterval)
    }
  }, [realTimeMonitoring, token])

  // New function for silent background data checks
  const checkForDataUpdates = async () => {
    try {
      // Check if there are updates available without refreshing the UI
      const newStats = await api.getDatabaseOverview()
      if (JSON.stringify(newStats) !== JSON.stringify(stats)) {
        setDataUpdateAvailable(true)
        addNotification({
          type: 'info',
          title: 'Data Update Available',
          message: 'New data is available. Click refresh to see the latest information.',
          source: 'background_check'
        })
      }
    } catch (err) {
      console.error('Background data check failed:', err)
    }
  }

  // Silent connection test that doesn't trigger notifications unless there's an actual problem
  const performConnectionTestSilent = async () => {
    try {
      const statusData = await api.getMonitoringStatus()
      if (statusData.status === 'success' && statusData.connection.status === 'connected') {
        setConnectionStatus('healthy')
      } else {
        setConnectionStatus('error')
        // Only notify on connection issues, not success
        addNotification({
          type: 'error',
          title: 'Connection Issue Detected',
          message: statusData.error || 'Database connection issues detected',
          source: 'connectivity'
        })
      }
    } catch (err) {
      setConnectionStatus('error')
      addNotification({
        type: 'error',
        title: 'Database Connection Lost',
        message: 'Unable to connect to database during background check.',
        source: 'connectivity'
      })
    }
  }

  // Silent health check that doesn't force refresh
  const checkTableHealthSilent = async () => {
    try {
      const healthData = await api.getDatabaseHealth()
      
      if (healthData.status === 'success') {
        const newHealthChecks: TableHealth[] = healthData.table_health.map((table: any) => ({
          table_name: table.table_name,
          health_score: table.health_score,
          issues: table.issues,
          recommendations: table.recommendations,
          last_checked: new Date()
        }))
        
        // Only update health data and notify about critical issues
        setTableHealth(newHealthChecks)
        
        // Only notify about critical health issues (score < 50)
        newHealthChecks.forEach(health => {
          if (health.health_score < 50) {
            addNotification({
              type: 'error',
              title: `Critical Health Issue: ${health.table_name}`,
              message: `Health score: ${health.health_score}%. Critical issues detected.`,
              source: 'health_check'
            })
          }
        })
      }
    } catch (err) {
      console.error('Silent health check failed:', err)
    }
  }

  const addNotification = (notification: Omit<DatabaseNotification, 'id' | 'timestamp' | 'acknowledged'>) => {
    // Generate a more unique ID to prevent collisions during rapid notifications
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: DatabaseNotification = {
      ...notification,
      id: uniqueId,
      timestamp: new Date(),
      acknowledged: false
    }
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]) // Keep last 50
  }

  const acknowledgeNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, acknowledged: true } : n)
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const performHealthCheck = async () => {
    try {
      // Test database connectivity
      await api.getDatabaseOverview()
      setConnectionStatus('healthy')
    } catch (err) {
      setConnectionStatus('error')
      addNotification({
        type: 'error',
        title: 'Database Connection Lost',
        message: 'Unable to connect to database. Check your connection.',
        source: 'connectivity'
      })
    }
  }

  const validateDatabaseSilent = async () => {
    try {
      const validationResult = await api.validateDatabaseSilent()
      setValidation(validationResult)
      
      // Create notifications for new issues
      if (validationResult.total_issues > 0) {
        validationResult.issues.errors.forEach((error: string) => {
          addNotification({
            type: 'error',
            title: 'Database Error Detected',
            message: error,
            source: 'validation'
          })
        })
        
        validationResult.issues.relationship_issues.forEach((issue: string) => {
          addNotification({
            type: 'warning',
            title: 'Relationship Issue',
            message: issue,
            source: 'relationships'
          })
        })
      }
    } catch (err) {
      console.error('Silent validation failed:', err)
    }
  }

  const checkTableHealth = async () => {
    try {
      const healthData = await api.getDatabaseHealth()
      
      if (healthData.status === 'success') {
        const healthChecks: TableHealth[] = healthData.table_health.map((table: any) => ({
          table_name: table.table_name,
          health_score: table.health_score,
          issues: table.issues,
          recommendations: table.recommendations,
          last_checked: new Date()
        }))
        
        setTableHealth(healthChecks)
        
        // Notify about critical health issues
        healthChecks.forEach(health => {
          if (health.health_score < 70) {
            addNotification({
              type: 'warning',
              title: `Table Health Warning: ${health.table_name}`,
              message: `Health score: ${health.health_score}%. Issues: ${health.issues.join(', ')}`,
              source: 'health_check'
            })
          }
        })
        
        addNotification({
          type: 'info',
          title: 'Health Check Complete',
          message: `Overall database health: ${healthData.overall_health}% (${healthData.health_status})`,
          source: 'health_check'
        })
      }
    } catch (err) {
      console.error('Health check failed:', err)
      addNotification({
        type: 'error',
        title: 'Health Check Failed',
        message: 'Unable to perform health check. Check connection.',
        source: 'health_check_error'
      })
    }
  }

  const performConnectionTest = async () => {
    try {
      const statusData = await api.getMonitoringStatus()
      
      if (statusData.status === 'success' && statusData.connection.status === 'connected') {
        setConnectionStatus('healthy')
        addNotification({
          type: 'success',
          title: 'Connection Test Successful',
          message: 'Database connection is healthy',
          source: 'connectivity'
        })
      } else {
        setConnectionStatus('error')
        addNotification({
          type: 'error',
          title: 'Connection Test Failed',
          message: statusData.error || 'Database connection issues detected',
          source: 'connectivity'
        })
      }
    } catch (err) {
      setConnectionStatus('error')
      addNotification({
        type: 'error',
        title: 'Database Connection Lost',
        message: 'Unable to connect to database. Check your connection.',
        source: 'connectivity'
      })
    }
  }

  const fetchDatabaseOverview = async () => {
    try {
      setLoading(true)
      setError('') // Clear previous errors
      
      console.log('Fetching database overview...')
      
      // Get both overview and schema data
      const [overviewData, schemaData] = await Promise.all([
        api.getDatabaseOverview(),
        api.getDatabaseSchema()
      ])
      
      console.log('Overview data received:', { 
        totalTables: overviewData.total_tables,
        totalRecords: overviewData.total_records,
        tableCount: overviewData.table_stats?.length 
      })
      console.log('Schema data received:', { 
        hasTables: !!schemaData.tables,
        tableCount: Object.keys(schemaData.tables || {}).length 
      })
      
      setStats(overviewData)
      setSchema(schemaData)
      setLastUpdate(new Date())
      
    } catch (err) {
      console.error('Database overview fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load database overview. Please check your authentication.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async (tableName: string) => {
    try {
      console.log(`Fetching data for table: ${tableName}`)
      
      // Use API client which handles authentication automatically
      const data = await api.getTableData(tableName)
      console.log(`Table data received for ${tableName}:`, { 
        dataCount: data.data?.length || 0,
        hasData: !!data.data 
      })
      
      setTableData(data.data || [])
      setSelectedTable(tableName)
    } catch (err) {
      console.error('Table data fetch error:', err)
      setError(`Failed to load data for table: ${tableName}. Please check your authentication.`)
    }
  }

  const validateDatabase = async () => {
    try {
      setIsValidating(true)
      const validationResult = await api.validateDatabase()
      setValidation(validationResult)
      
      const severityIcon = validationResult.severity === 'healthy' ? '✅' : 
                          validationResult.severity === 'warning' ? '⚠️' : '❌'
      
      addNotification({
        type: validationResult.severity === 'healthy' ? 'success' : 
              validationResult.severity === 'warning' ? 'warning' : 'error',
        title: 'Database Validation Complete',
        message: `${severityIcon} Found ${validationResult.total_issues} issues. Severity: ${validationResult.severity}`,
        source: 'manual_validation'
      })
      
      alert(`Database validation completed!\n\nStatus: ${validationResult.status}\nTotal Issues: ${validationResult.total_issues}\nSeverity: ${validationResult.severity}`)
    } catch (err) {
      console.error('Database validation error:', err)
      addNotification({
        type: 'error',
        title: 'Validation Failed',
        message: 'Failed to validate database. Check connection.',
        source: 'validation_error'
      })
      alert('Failed to validate database. Please check your authentication.')
    } finally {
      setIsValidating(false)
    }
  }

  const repairDatabase = async () => {
    if (!confirm('Are you sure you want to run database repair? This will attempt to fix issues automatically.')) {
      return
    }
    
    try {
      const result = await api.repairDatabase()
      
      addNotification({
        type: 'success',
        title: 'Database Repair Complete',
        message: `Fixed ${result.fixed_issues} issues. Status: ${result.status}`,
        source: 'repair'
      })
      
      alert(`Database repair completed!\n\nFixed Issues: ${result.fixed_issues}\nStatus: ${result.status}`)
      fetchDatabaseOverview() // Refresh data
      validateDatabaseSilent() // Re-validate
    } catch (err) {
      console.error('Database repair error:', err)
      addNotification({
        type: 'error',
        title: 'Repair Failed',
        message: 'Database repair failed. Check logs for details.',
        source: 'repair_error'
      })
      alert('Failed to repair database. Please check your authentication.')
    }
  }

  // CRUD Operations for real-time sync
  const handleEditRow = (index: number, row: any) => {
    setEditingRow(index)
    setEditingData({ ...row })
  }

  const handleSaveEdit = async (index: number) => {
    try {
      const systemId = editingData.system_id || editingData.id
      if (!systemId) {
        alert('Cannot edit record without system_id')
        return
      }

      await api.updateRecord(selectedTable, systemId, editingData)
      
      // Update local data
      const newTableData = [...tableData]
      newTableData[index] = editingData
      setTableData(newTableData)
      setEditingRow(null)
      setEditingData({})
      
      // Refresh stats
      fetchDatabaseOverview()
      
      addNotification({
        type: 'success',
        title: 'Record Updated',
        message: `Successfully updated record in ${selectedTable}`,
        source: 'crud'
      })
      
      alert('Record updated successfully!')
    } catch (err) {
      console.error('Update record error:', err)
      alert(`Error updating record: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDeleteRow = async (index: number, row: any) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const systemId = row.system_id || row.id
      if (!systemId) {
        alert('Cannot delete record without system_id')
        return
      }

      await api.deleteRecord(selectedTable, systemId)
      
      // Remove from local data
      const newTableData = tableData.filter((_, i) => i !== index)
      setTableData(newTableData)
      
      // Refresh stats
      fetchDatabaseOverview()
      
      addNotification({
        type: 'info',
        title: 'Record Deleted',
        message: `Record deleted from ${selectedTable}`,
        source: 'crud'
      })
      
      alert('Record deleted successfully!')
    } catch (err) {
      console.error('Delete record error:', err)
      alert(`Error deleting record: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleCreateRecord = async () => {
    try {
      const result = await api.createRecord(selectedTable, newRecord)
      
      // Add to local data
      setTableData([result.record, ...tableData])
      setShowCreateForm(false)
      setNewRecord({})
      
      // Refresh stats
      fetchDatabaseOverview()
      
      addNotification({
        type: 'success',
        title: 'Record Created',
        message: `New record created in ${selectedTable}`,
        source: 'crud'
      })
      
      alert('Record created successfully!')
    } catch (err) {
      console.error('Create record error:', err)
      alert(`Error creating record: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const refreshData = () => {
    fetchDatabaseOverview()
    if (selectedTable) {
      fetchTableData(selectedTable)
    }
    setDataUpdateAvailable(false) // Clear the update notification
    
    addNotification({
      type: 'success',
      title: 'Data Refreshed',
      message: 'All data has been updated to the latest version.',
      source: 'manual_refresh'
    })
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'NULL'
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 mx-auto"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-gray-600">
              Loading database overview...
              {!token && " (Checking authentication)"}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      onClick={() => {
                        setError('')
                        fetchDatabaseOverview()
                      }}
                      className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
              <p className="text-gray-600">Manage your DevHub database - Alternative to pgAdmin</p>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-sm text-gray-500">Last updated: {lastUpdate.toLocaleString()}</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'healthy' ? 'bg-green-500' : 
                    connectionStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
                </div>
                {dataUpdateAvailable && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    <span>Updates available</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className={`relative p-2 rounded-md ${
                    notifications.filter(n => !n.acknowledged).length > 0 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔔
                  {notifications.filter(n => !n.acknowledged).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.acknowledged).length}
                    </span>
                  )}
                </button>
              </div>
              <label className="flex items-center">
                <input
                  id="auto-refresh-toggle"
                  name="autoRefresh"
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Background Check</span>
              </label>
              <label className="flex items-center">
                <input
                  id="monitoring-toggle"
                  name="realTimeMonitoring"
                  type="checkbox"
                  checked={realTimeMonitoring}
                  onChange={(e) => setRealTimeMonitoring(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Live Monitoring</span>
              </label>
              <button
                onClick={refreshData}
                className={`px-4 py-2 rounded-md font-medium ${
                  dataUpdateAvailable 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                🔄 {dataUpdateAvailable ? 'Update Available' : 'Refresh'}
              </button>
              <button
                onClick={validateDatabase}
                disabled={isValidating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isValidating ? '⏳ Validating...' : 'Validate DB'}
              </button>
              <button
                onClick={repairDatabase}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                Repair DB
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="bg-white shadow-lg rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowNotificationPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 ${
                      notification.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.type === 'error' ? 'bg-red-100 text-red-800' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            notification.type === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.type === 'error' ? '❌' :
                             notification.type === 'warning' ? '⚠️' :
                             notification.type === 'success' ? '✅' : 'ℹ️'}
                            {notification.type}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            {notification.source}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mt-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!notification.acknowledged && (
                        <button
                          onClick={() => acknowledgeNotification(notification.id)}
                          className="ml-4 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'tables', label: 'Tables', icon: '🗂️' },
                { id: 'schema', label: 'Schema', icon: '🏗️' },
                { id: 'validator', label: 'Validator', icon: '✅' },
                { id: 'monitoring', label: 'Monitoring', icon: '📈' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                  {tab.id === 'notifications' && notifications.filter(n => !n.acknowledged).length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {notifications.filter(n => !n.acknowledged).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900">Total Tables</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_tables}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-900">Total Records</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.total_records.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-purple-900">Database Status</h3>
                    <p className="text-xl font-bold text-purple-600">Healthy</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Table Statistics</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.table_stats.map((table) => (
                          <tr key={table.table_name}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {table.table_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {table.record_count.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                              <button
                                onClick={() => {
                                  setActiveTab('tables')
                                  fetchTableData(table.table_name)
                                }}
                                className="hover:text-blue-800"
                              >
                                View Data
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tables Tab */}
            {activeTab === 'tables' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <label htmlFor="table-selector" className="text-sm font-medium text-gray-700 mb-1">
                        Select a table to view and manage data:
                      </label>
                      <select
                        id="table-selector"
                        name="selectedTable"
                        value={selectedTable}
                        onChange={(e) => fetchTableData(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 min-w-64"
                      >
                        <option value="">Choose a table...</option>
                        {stats?.table_stats.map((table) => (
                          <option key={table.table_name} value={table.table_name}>
                            {table.table_name} ({table.record_count} records)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {selectedTable && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        + Add Record
                      </button>
                      <button
                        onClick={() => fetchTableData(selectedTable)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        🔄 Refresh
                      </button>
                    </div>
                  )}
                </div>

                {/* Help message when no table is selected */}
                {!selectedTable && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Table Data Management</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Select a table from the dropdown above to:</p>
                          <ul className="mt-2 list-disc list-inside space-y-1">
                            <li>View all records in the table</li>
                            <li>Edit existing records inline</li>
                            <li>Add new records</li>
                            <li>Delete records</li>
                            <li>Monitor table relationships</li>
                          </ul>
                          <p className="mt-3 font-medium">
                            💡 Tip: You can also click "View Data" from the Overview tab for quick access to specific tables.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show loading state when table is selected but data is loading */}
                {selectedTable && tableData.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                    <p className="mt-4 text-gray-600">Loading {selectedTable} data...</p>
                  </div>
                )}

                {selectedTable && tableData.length > 0 && (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                      <h3 className="text-lg font-medium">
                        {selectedTable} ({tableData.length} records shown)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {tableData[0] && Object.keys(tableData[0]).map((column) => (
                              <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                {column}
                              </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {Object.entries(row).map(([key, value], i) => (
                                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {editingRow === index ? (
                                    <input
                                      id={`edit-${key}-${index}`}
                                      name={`${key}_${index}`}
                                      type="text"
                                      value={editingData[key] || ''}
                                      onChange={(e) => setEditingData({
                                        ...editingData,
                                        [key]: e.target.value
                                      })}
                                      className="w-full border border-gray-300 rounded px-2 py-1"
                                    />
                                  ) : (
                                    <div className="max-w-xs truncate" title={formatValue(value)}>
                                      {formatValue(value)}
                                    </div>
                                  )}
                                </td>
                              ))}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {editingRow === index ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleSaveEdit(index)}
                                      className="text-green-600 hover:text-green-900"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingRow(null)
                                        setEditingData({})
                                      }}
                                      className="text-gray-600 hover:text-gray-900"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditRow(index, row)}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRow(index, row)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Create Record Modal */}
                {showCreateForm && selectedTable && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Add New Record to {selectedTable}
                        </h3>
                        <div className="space-y-4">
                          {tableData[0] && Object.keys(tableData[0]).map((column) => (
                            <div key={column}>
                              <label htmlFor={`new-${column}`} className="block text-sm font-medium text-gray-700">
                                {column}
                              </label>
                              <input
                                id={`new-${column}`}
                                name={`new_${column}`}
                                type="text"
                                value={newRecord[column] || ''}
                                onChange={(e) => setNewRecord({
                                  ...newRecord,
                                  [column]: e.target.value
                                })}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder={`Enter ${column}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={() => {
                              setShowCreateForm(false)
                              setNewRecord({})
                            }}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateRecord}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Create Record
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Schema Tab */}
            {activeTab === 'schema' && schema && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Database Schema</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{JSON.stringify(schema, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Validator Tab */}
            {activeTab === 'validator' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Database Validation & Repair</h3>
                  <div className="space-x-4">
                    <button
                      onClick={validateDatabase}
                      disabled={isValidating}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isValidating ? '⏳ Running Validation...' : '🔍 Run Validation'}
                    </button>
                    <button
                      onClick={repairDatabase}
                      className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700"
                    >
                      🔧 Repair Database
                    </button>
                  </div>
                </div>
                
                {validation && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      validation.severity === 'healthy' ? 'bg-green-50 border border-green-200' :
                      validation.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <h4 className="font-medium mb-2">
                        Validation Results - {validation.severity.toUpperCase()}
                      </h4>
                      <p className="text-sm mb-2">
                        Total Issues: {validation.total_issues} | 
                        Last Check: {new Date(validation.timestamp).toLocaleString()}
                      </p>
                      
                      {validation.issues.errors.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-red-700 mb-1">Errors:</h5>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {validation.issues.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validation.issues.warnings.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-yellow-700 mb-1">Warnings:</h5>
                          <ul className="text-sm text-yellow-600 list-disc list-inside">
                            {validation.issues.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validation.issues.relationship_issues.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-orange-700 mb-1">Relationship Issues:</h5>
                          <ul className="text-sm text-orange-600 list-disc list-inside">
                            {validation.issues.relationship_issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validation.issues.id_system_issues.length > 0 && (
                        <div className="mb-3">
                          <h5 className="font-medium text-purple-700 mb-1">ID System Issues:</h5>
                          <ul className="text-sm text-purple-600 list-disc list-inside">
                            {validation.issues.id_system_issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validation.issues.suggestions.length > 0 && (
                        <div>
                          <h5 className="font-medium text-blue-700 mb-1">Suggestions:</h5>
                          <ul className="text-sm text-blue-600 list-disc list-inside">
                            {validation.issues.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-yellow-800">Available Operations:</h4>
                  <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                    <li>• Validate database schema integrity</li>
                    <li>• Check foreign key constraints</li>
                    <li>• Verify data consistency</li>
                    <li>• Repair orphaned records</li>
                    <li>• Fix missing system IDs</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`rounded-lg p-6 ${
                    connectionStatus === 'healthy' ? 'bg-green-50' : 
                    connectionStatus === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <h3 className={`text-lg font-medium ${
                      connectionStatus === 'healthy' ? 'text-green-900' : 
                      connectionStatus === 'warning' ? 'text-yellow-900' : 'text-red-900'
                    }`}>Connection Status</h3>
                    <p className={`text-3xl font-bold ${
                      connectionStatus === 'healthy' ? 'text-green-600' : 
                      connectionStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {connectionStatus === 'healthy' ? '🟢' : 
                       connectionStatus === 'warning' ? '🟡' : '🔴'} 
                      {connectionStatus.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900">Active Monitoring</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {realTimeMonitoring ? '🟢 ON' : '🔴 OFF'}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-purple-900">Unread Alerts</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {notifications.filter(n => !n.acknowledged).length}
                    </p>
                  </div>
                </div>

                {/* Table Health */}
                <div className="bg-white border rounded-lg">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium">Table Health Monitor</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommendations</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Checked</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableHealth.map((health) => (
                          <tr key={health.table_name}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {health.table_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className={`flex-shrink-0 h-2.5 w-2.5 rounded-full mr-2 ${
                                  health.health_score >= 90 ? 'bg-green-400' :
                                  health.health_score >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}></div>
                                {health.health_score}%
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {health.issues.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {health.issues.map((issue, index) => (
                                    <li key={index} className="text-red-600">{issue}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-green-600">No issues</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {health.recommendations.length > 0 ? (
                                <ul className="list-disc list-inside">
                                  {health.recommendations.map((rec, index) => (
                                    <li key={index} className="text-blue-600">{rec}</li>
                                  ))}
                                </ul>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {health.last_checked.toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Monitoring Controls */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monitoring Controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded border">
                      <div>
                        <h4 className="font-medium">Real-time Monitoring</h4>
                        <p className="text-sm text-gray-500">Automatically check for issues every minute</p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={realTimeMonitoring}
                          onChange={(e) => setRealTimeMonitoring(e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded border">
                      <div>
                        <h4 className="font-medium">Auto-refresh Data</h4>
                        <p className="text-sm text-gray-500">Refresh tables and stats every 30 seconds</p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={checkTableHealth}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Run Health Check
                    </button>
                    <button
                      onClick={performConnectionTest}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Database Notifications</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, acknowledged: true })))
                      }}
                      className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Mark All Read
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Notification Filters */}
                <div className="flex space-x-4">
                  {['all', 'error', 'warning', 'info', 'success'].map((filter) => (
                    <button
                      key={filter}
                      className={`px-3 py-1 rounded text-sm ${
                        filter === 'all' ? 'bg-gray-200 text-gray-800' : 
                        filter === 'error' ? 'bg-red-100 text-red-800' :
                        filter === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        filter === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      {filter === 'all' && (
                        <span className="ml-1">({notifications.length})</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🔔</div>
                      <h3 className="text-lg font-medium mb-2">No notifications</h3>
                      <p>Your database is running smoothly!</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border rounded-lg p-4 ${
                          notification.acknowledged ? 'bg-gray-50 opacity-75' : 'bg-white'
                        } ${
                          notification.type === 'error' ? 'border-red-200' :
                          notification.type === 'warning' ? 'border-yellow-200' :
                          notification.type === 'success' ? 'border-green-200' :
                          'border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                notification.type === 'success' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.type === 'error' ? '❌' :
                                 notification.type === 'warning' ? '⚠️' :
                                 notification.type === 'success' ? '✅' : 'ℹ️'}
                                {notification.type}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {notification.source}
                              </span>
                              <span className="text-xs text-gray-500">
                                {notification.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.acknowledged && (
                              <button
                                onClick={() => acknowledgeNotification(notification.id)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                Acknowledge
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setNotifications(prev => prev.filter(n => n.id !== notification.id))
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
