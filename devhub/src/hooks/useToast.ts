'use client'

import { useState, useCallback } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((type: ToastMessage['type'], message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastMessage = {
      id,
      type,
      message,
      duration
    }
    
    setToasts(prev => [...prev, toast])
    
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => 
    showToast('success', message, duration), [showToast])
  
  const error = useCallback((message: string, duration?: number) => 
    showToast('error', message, duration), [showToast])
  
  const warning = useCallback((message: string, duration?: number) => 
    showToast('warning', message, duration), [showToast])
  
  const info = useCallback((message: string, duration?: number) => 
    showToast('info', message, duration), [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
