"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
  cache?: 'no-cache' | 'default' | 'reload' | 'force-cache' | 'only-if-cached'
  retry?: number
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp?: string
  missingFields?: string[] // Ajout pour les champs manquants
  validationErrors?: Record<string, string> // Ajout pour les erreurs de validation
}

export function useApi() {
  const { token, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApi = useCallback(async <T>(
    endpoint: string, 
    options: ApiOptions = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> => {
    const { 
      method = 'GET', 
      headers = {}, 
      body, 
      requiresAuth = true,
      cache = 'no-cache',
      retry = 3
    } = options

    setIsLoading(true)
    setError(null)

    try {
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      }

      if (requiresAuth && token) {
        requestHeaders.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        cache,
        credentials: 'include',
      })

      let data: ApiResponse<T>
      
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }

      // Ne pas throw d'erreur pour les 400 (validation), mais retourner la réponse
      if (response.status === 400 || response.status === 422) {
        // C'est une erreur de validation, on retourne simplement la réponse
        return {
          success: false,
          data: data.data,
          error: data.error,
          message: data.message,
          missingFields: data.missingFields,
          validationErrors: data.validationErrors
        }
      }

      if (!response.ok) {
        // Gérer les erreurs d'authentification
        if (response.status === 401) {
          logout()
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        }
        
        // Gérer les erreurs serveur
        if (response.status >= 500 && retryCount < retry) {
          console.log(`Retrying ${endpoint} (${retryCount + 1}/${retry})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
          return fetchApi(endpoint, options, retryCount + 1)
        }
        
        throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [token, logout])

  return { fetchApi, isLoading, error }
}