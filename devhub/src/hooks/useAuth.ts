'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  system_id: string
  display_id: string
  email: string
  full_name: string
  tenant_id: string
  tenant_name: string
  user_role: string
  is_active: boolean
  is_founder: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true
  })
  const router = useRouter()

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('auth_user')
    
    if (token && user) {
      setAuthState({
        user: JSON.parse(user),
        token,
        isLoading: false
      })
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await fetch('http://localhost:8005/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Store token and user data
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      setAuthState({
        user: data.user,
        token: data.access_token,
        isLoading: false
      })

      return { success: true, data }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await fetch('http://localhost:8005/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Registration failed')
      }

      const data = await response.json()
      
      // Store token and user data
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      setAuthState({
        user: data.user,
        token: data.access_token,
        isLoading: false
      })

      return { success: true, data }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    }
  }

  const createFounder = async (email: string, password: string, fullName: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const response = await fetch('http://localhost:8005/api/v1/auth/create-founder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Founder creation failed')
      }

      const data = await response.json()
      
      // Store token and user data
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      setAuthState({
        user: data.user,
        token: data.access_token,
        isLoading: false
      })

      return { success: true, data }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Founder creation failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setAuthState({
      user: null,
      token: null,
      isLoading: false
    })
    router.push('/auth/login')
  }

  const isAuthenticated = useCallback(() => {
    return !!(authState.token && authState.user)
  }, [authState.token, authState.user])

  const isFounder = useCallback(() => {
    return authState.user?.is_founder || false
  }, [authState.user?.is_founder])

  return {
    ...authState,
    login,
    register,
    createFounder,
    logout,
    isAuthenticated,
    isFounder
  }
}

export default useAuth
