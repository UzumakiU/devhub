'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DatabaseManagerPage from '@/components/database/DatabaseManagerPage'
import DatabaseSchemaEnhanced from '@/components/database/DatabaseSchemaEnhanced'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { TableData } from '@/types/database'

export default function DatabasePage() {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('manager')

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/v1/database/tables')
        if (response.ok) {
          const data = await response.json()
          setTables(data.tables || [])
        }
      } catch (error) {
        console.error('Error fetching tables:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

  const openSchemaViewer = () => {
    window.open('http://localhost:3005/database', '_blank')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="manager">Database Manager</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manager">
            <DatabaseManagerPage initialTables={tables} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
