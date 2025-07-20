import { apiClient, buildQueryString, handleApiResponse } from "@/lib/api"
import { User, UserPreferences, UserProfileFormData, ApiResponse } from "@/types"

// User service class
export class UserService {
  private readonly basePath = '/users'

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.basePath}/me`)
    return handleApiResponse(response)
  }

  // Update user profile
  async updateProfile(profileData: Partial<UserProfileFormData>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`${this.basePath}/me`, profileData)
    return handleApiResponse(response)
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.put<ApiResponse<UserPreferences>>(`${this.basePath}/me/preferences`, preferences)
    return handleApiResponse(response)
  }

  // Get user by ID
  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.basePath}/${userId}`)
    return handleApiResponse(response)
  }

  // Get user's favorite datasets
  async getFavoriteDatasets(userId?: string): Promise<string[]> {
    const endpoint = userId ? `${this.basePath}/${userId}/favorites` : `${this.basePath}/me/favorites`
    const response = await apiClient.get<ApiResponse<string[]>>(endpoint)
    return handleApiResponse(response)
  }

  // Add dataset to favorites
  async addToFavorites(datasetId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/me/favorites`, { datasetId })
  }

  // Remove dataset from favorites
  async removeFromFavorites(datasetId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/me/favorites/${datasetId}`)
  }

  // Get user's recently viewed datasets
  async getRecentlyViewed(): Promise<Array<{ datasetId: string; viewedAt: Date }>> {
    const response = await apiClient.get<ApiResponse<Array<{ datasetId: string; viewedAt: string }>>>(`${this.basePath}/me/recent`)
    const data = handleApiResponse(response)
    return data.map(item => ({
      ...item,
      viewedAt: new Date(item.viewedAt)
    }))
  }

  // Add dataset to recently viewed
  async addToRecentlyViewed(datasetId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/me/recent`, { datasetId })
  }

  // Get user's interests/categories of interest
  async getInterests(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(`${this.basePath}/me/interests`)
    return handleApiResponse(response)
  }

  // Update user's interests
  async updateInterests(interests: string[]): Promise<string[]> {
    const response = await apiClient.put<ApiResponse<string[]>>(`${this.basePath}/me/interests`, { interests })
    return handleApiResponse(response)
  }

  // Get user activity summary
  async getActivitySummary(userId?: string): Promise<{
    datasetsViewed: number
    datasetsRated: number
    datasetsBookmarked: number
    storiesCreated: number
    lastActive: Date
  }> {
    const endpoint = userId ? `${this.basePath}/${userId}/activity` : `${this.basePath}/me/activity`
    const response = await apiClient.get<ApiResponse<any>>(endpoint)
    const data = handleApiResponse(response)
    return {
      ...data,
      lastActive: new Date(data.lastActive)
    }
  }

  // Search users
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const queryString = buildQueryString({ q: query, limit })
    const response = await apiClient.get<ApiResponse<User[]>>(`${this.basePath}/search${queryString}`)
    return handleApiResponse(response)
  }

  // Get user notifications
  async getNotifications(page: number = 1, pageSize: number = 20): Promise<{
    notifications: Array<{
      id: string
      type: 'dataset_update' | 'new_rating' | 'new_story' | 'system'
      title: string
      message: string
      read: boolean
      createdAt: Date
      datasetId?: string
      storyId?: string
    }>
    unreadCount: number
  }> {
    const queryString = buildQueryString({ page, pageSize })
    const response = await apiClient.get<ApiResponse<any>>(`${this.basePath}/me/notifications${queryString}`)
    const data = handleApiResponse(response)
    return {
      ...data,
      notifications: data.notifications.map((notif: any) => ({
        ...notif,
        createdAt: new Date(notif.createdAt)
      }))
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<void> {
    await apiClient.put(`${this.basePath}/me/notifications/${notificationId}/read`)
  }

  // Mark all notifications as read
  async markAllNotificationsRead(): Promise<void> {
    await apiClient.put(`${this.basePath}/me/notifications/read-all`)
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/me/notifications/${notificationId}`)
  }
}

// Create and export the default user service instance
export const userService = new UserService()