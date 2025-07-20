import { ApiResponse, PaginatedResponse } from "@/types"

// API Configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const DEFAULT_TIMEOUT = 10000 // 10 seconds

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request configuration interface
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

// Base API client class
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization']
  }

  // Main request method with error handling and retries
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = DEFAULT_TIMEOUT,
      retries = 1
    } = config

    const url = `${this.baseUrl}${endpoint}`
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    // Retry logic
    let lastError: Error
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        return await this.handleResponse<T>(response)
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on client errors (4xx) or the last attempt
        if (attempt === retries || (error instanceof ApiError && error.status < 500)) {
          break
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    throw lastError!
  }

  // Handle response and errors
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    let responseData: any
    try {
      responseData = isJson ? await response.json() : await response.text()
    } catch (error) {
      throw new ApiError(
        'Failed to parse response',
        response.status,
        'PARSE_ERROR'
      )
    }

    if (!response.ok) {
      const errorMessage = isJson && responseData?.message 
        ? responseData.message 
        : `HTTP ${response.status}: ${response.statusText}`
      
      throw new ApiError(
        errorMessage,
        response.status,
        responseData?.code,
        responseData
      )
    }

    return responseData
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Convenience methods for different HTTP verbs
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient()

// Utility functions for common API patterns

// Handle API responses with standard format
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(
      response.message || 'API request failed',
      500,
      'API_ERROR',
      response.errors
    )
  }
  return response.data
}

// Handle paginated responses
export function handlePaginatedResponse<T>(response: PaginatedResponse<T>): PaginatedResponse<T> {
  return response
}

// Build query string from parameters
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()))
      } else {
        searchParams.append(key, value.toString())
      }
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// Error handler for React Query
export function handleQueryError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message, 500, 'UNKNOWN_ERROR')
  }
  
  return new ApiError('An unknown error occurred', 500, 'UNKNOWN_ERROR')
}

// Check if error is a network error
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch')
}

// Check if error is a timeout error
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

// Check if error is a client error (4xx)
export function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500
}

// Check if error is a server error (5xx)
export function isServerError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 500
}