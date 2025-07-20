import { apiClient, buildQueryString, handleApiResponse, handlePaginatedResponse } from "@/lib/api"
import { Organization, Dataset, PaginatedResponse, ApiResponse } from "@/types"
import { transformDatasetForDisplay } from "@/lib/dataTransforms"

// Organization query parameters
export interface OrganizationQueryParams {
  page?: number
  pageSize?: number
  search?: string
  verified?: boolean
  sortBy?: 'name' | 'datasets' | 'rating' | 'created'
  sortOrder?: 'asc' | 'desc'
}

// Organization service class
export class OrganizationService {
  private readonly basePath = '/organizations'

  // Get all organizations with filtering and pagination
  async getOrganizations(params: OrganizationQueryParams = {}): Promise<PaginatedResponse<Organization>> {
    const queryString = buildQueryString(params)
    const response = await apiClient.get<PaginatedResponse<Organization>>(`${this.basePath}${queryString}`)
    return handlePaginatedResponse(response)
  }

  // Get a single organization by ID
  async getOrganization(id: string): Promise<Organization> {
    const response = await apiClient.get<ApiResponse<Organization>>(`${this.basePath}/${id}`)
    return handleApiResponse(response)
  }

  // Search organizations
  async searchOrganizations(query: string, limit: number = 10): Promise<Organization[]> {
    const queryString = buildQueryString({ q: query, limit })
    const response = await apiClient.get<ApiResponse<Organization[]>>(`${this.basePath}/search${queryString}`)
    return handleApiResponse(response)
  }

  // Get featured/verified organizations
  async getFeaturedOrganizations(limit: number = 6): Promise<Organization[]> {
    const response = await apiClient.get<ApiResponse<Organization[]>>(`${this.basePath}/featured?limit=${limit}`)
    return handleApiResponse(response)
  }

  // Get organization's datasets
  async getOrganizationDatasets(
    organizationId: string, 
    params: { page?: number; pageSize?: number; sortBy?: string; sortOrder?: string } = {}
  ): Promise<PaginatedResponse<Dataset>> {
    const queryString = buildQueryString(params)
    const response = await apiClient.get<PaginatedResponse<any>>(`${this.basePath}/${organizationId}/datasets${queryString}`)
    
    // Transform raw data to business-friendly format
    const transformedData = response.data.map(transformDatasetForDisplay)
    
    return {
      ...response,
      data: transformedData
    }
  }

  // Get organization members
  async getOrganizationMembers(
    organizationId: string,
    params: { page?: number; pageSize?: number; role?: string } = {}
  ): Promise<PaginatedResponse<{
    id: string
    name: string
    email: string
    role: string
    joinedAt: Date
    avatar?: string
  }>> {
    const queryString = buildQueryString(params)
    const response = await apiClient.get<PaginatedResponse<any>>(`${this.basePath}/${organizationId}/members${queryString}`)
    
    // Transform dates
    const transformedData = response.data.map((member: any) => ({
      ...member,
      joinedAt: new Date(member.joinedAt)
    }))
    
    return {
      ...response,
      data: transformedData
    }
  }

  // Get organization statistics
  async getOrganizationStats(organizationId: string): Promise<{
    totalDatasets: number
    totalMembers: number
    totalViews: number
    totalDownloads: number
    averageDatasetRating: number
    topCategories: Array<{ category: string; count: number }>
    recentActivity: Array<{
      type: 'dataset_created' | 'dataset_updated' | 'member_joined'
      description: string
      timestamp: Date
    }>
  }> {
    const response = await apiClient.get<ApiResponse<any>>(`${this.basePath}/${organizationId}/stats`)
    const data = handleApiResponse(response)
    
    return {
      ...data,
      recentActivity: data.recentActivity.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))
    }
  }

  // Follow/unfollow organization
  async followOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${organizationId}/follow`)
  }

  async unfollowOrganization(organizationId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${organizationId}/follow`)
  }

  // Check if user follows organization
  async isFollowing(organizationId: string): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<{ following: boolean }>>(`${this.basePath}/${organizationId}/following`)
    return handleApiResponse(response).following
  }

  // Get user's followed organizations
  async getFollowedOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<ApiResponse<Organization[]>>(`${this.basePath}/following`)
    return handleApiResponse(response)
  }

  // Get organization categories with counts
  async getOrganizationCategories(): Promise<Array<{ name: string; count: number }>> {
    const response = await apiClient.get<ApiResponse<Array<{ name: string; count: number }>>>(`${this.basePath}/categories`)
    return handleApiResponse(response)
  }

  // Get top organizations by various metrics
  async getTopOrganizations(
    metric: 'datasets' | 'downloads' | 'rating' | 'activity',
    limit: number = 10
  ): Promise<Organization[]> {
    const response = await apiClient.get<ApiResponse<Organization[]>>(`${this.basePath}/top?metric=${metric}&limit=${limit}`)
    return handleApiResponse(response)
  }

  // Create organization (admin only)
  async createOrganization(organizationData: {
    name: string
    description: string
    website?: string
    logoUrl?: string
  }): Promise<Organization> {
    const response = await apiClient.post<ApiResponse<Organization>>(`${this.basePath}`, organizationData)
    return handleApiResponse(response)
  }

  // Update organization (admin/owner only)
  async updateOrganization(
    organizationId: string,
    organizationData: Partial<{
      name: string
      description: string
      website: string
      logoUrl: string
    }>
  ): Promise<Organization> {
    const response = await apiClient.put<ApiResponse<Organization>>(`${this.basePath}/${organizationId}`, organizationData)
    return handleApiResponse(response)
  }

  // Delete organization (admin only)
  async deleteOrganization(organizationId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${organizationId}`)
  }

  // Add member to organization
  async addMember(organizationId: string, userId: string, role: string = 'member'): Promise<void> {
    await apiClient.post(`${this.basePath}/${organizationId}/members`, { userId, role })
  }

  // Remove member from organization
  async removeMember(organizationId: string, userId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${organizationId}/members/${userId}`)
  }

  // Update member role
  async updateMemberRole(organizationId: string, userId: string, role: string): Promise<void> {
    await apiClient.put(`${this.basePath}/${organizationId}/members/${userId}`, { role })
  }
}

// Create and export the default organization service instance
export const organizationService = new OrganizationService()

// Mock data for development
export const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "Data Analytics Corp",
    description: "Leading provider of business intelligence and analytics solutions",
    logoUrl: "/logos/analytics-corp.png",
    website: "https://analytics-corp.com",
    verified: true,
    datasets: ["1", "2", "3"],
    members: ["user1", "user2", "user3"],
    createdAt: new Date("2023-01-15"),
    metrics: {
      datasetCount: 45,
      averageDatasetRating: 4.6,
      activeUsers: 12
    }
  },
  {
    id: "2",
    name: "Financial Insights Inc",
    description: "Specialized in financial data and risk management solutions",
    logoUrl: "/logos/financial-insights.png",
    website: "https://financial-insights.com",
    verified: true,
    datasets: ["4", "5"],
    members: ["user4", "user5"],
    createdAt: new Date("2023-03-20"),
    metrics: {
      datasetCount: 28,
      averageDatasetRating: 4.8,
      activeUsers: 8
    }
  }
]

// Mock service for development
export const mockOrganizationService = {
  async getOrganizations(): Promise<PaginatedResponse<Organization>> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      data: mockOrganizations,
      pagination: {
        page: 1,
        pageSize: 10,
        totalCount: mockOrganizations.length,
        totalPages: 1
      }
    }
  },

  async getOrganization(id: string): Promise<Organization> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const org = mockOrganizations.find(o => o.id === id)
    if (!org) throw new Error('Organization not found')
    return org
  },

  async getFeaturedOrganizations(): Promise<Organization[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockOrganizations.filter(org => org.verified)
  }
}