import { apiClient, buildQueryString, handleApiResponse, handlePaginatedResponse } from "@/lib/api"
import { transformDatasetForDisplay } from "@/lib/dataTransforms"
import { 
  Dataset, 
  SearchFilters, 
  SearchResult, 
  PaginatedResponse, 
  ApiResponse,
  DatasetRating,
  DatasetPreview,
  DatasetVisualization
} from "@/types"

// Dataset query parameters
export interface DatasetQueryParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  classification?: string
  maturity?: string
  sortBy?: 'name' | 'updated' | 'quality' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  tags?: string[]
  organizationId?: string
  ownerId?: string
}

// Dataset service class
export class DatasetService {
  private readonly basePath = '/datasets'

  // Get all datasets with filtering and pagination
  async getDatasets(params: DatasetQueryParams = {}): Promise<PaginatedResponse<Dataset>> {
    const queryString = buildQueryString(params)
    const response = await apiClient.get<PaginatedResponse<any>>(`${this.basePath}${queryString}`)
    
    // Transform raw data to business-friendly format
    const transformedData = response.data.map(transformDatasetForDisplay)
    
    return {
      ...response,
      data: transformedData
    }
  }

  // Get a single dataset by ID
  async getDataset(id: string): Promise<Dataset> {
    const response = await apiClient.get<ApiResponse<any>>(`${this.basePath}/${id}`)
    return transformDatasetForDisplay(handleApiResponse(response))
  }

  // Search datasets with advanced filters
  async searchDatasets(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    const searchParams = {
      q: query,
      categories: filters.categories,
      classifications: filters.classifications,
      maturity: filters.maturity,
      qualityMin: filters.qualityRange?.min,
      qualityMax: filters.qualityRange?.max,
      dateStart: filters.dateRange?.start?.toISOString(),
      dateEnd: filters.dateRange?.end?.toISOString(),
      organizations: filters.organizations,
      tags: filters.tags
    }

    const queryString = buildQueryString(searchParams)
    const response = await apiClient.get<ApiResponse<any>>(`${this.basePath}/search${queryString}`)
    const data = handleApiResponse(response)

    return {
      datasets: data.datasets.map(transformDatasetForDisplay),
      totalCount: data.totalCount,
      facets: data.facets
    }
  }

  // Get featured datasets
  async getFeaturedDatasets(limit: number = 6): Promise<Dataset[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`${this.basePath}/featured?limit=${limit}`)
    const data = handleApiResponse(response)
    return data.map(transformDatasetForDisplay)
  }

  // Get popular datasets
  async getPopularDatasets(limit: number = 10): Promise<Dataset[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`${this.basePath}/popular?limit=${limit}`)
    const data = handleApiResponse(response)
    return data.map(transformDatasetForDisplay)
  }

  // Get recently updated datasets
  async getRecentDatasets(limit: number = 10): Promise<Dataset[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`${this.basePath}/recent?limit=${limit}`)
    const data = handleApiResponse(response)
    return data.map(transformDatasetForDisplay)
  }

  // Get datasets by category
  async getDatasetsByCategory(category: string, params: DatasetQueryParams = {}): Promise<PaginatedResponse<Dataset>> {
    const queryString = buildQueryString({ ...params, category })
    const response = await apiClient.get<PaginatedResponse<any>>(`${this.basePath}${queryString}`)
    
    const transformedData = response.data.map(transformDatasetForDisplay)
    
    return {
      ...response,
      data: transformedData
    }
  }

  // Get datasets by organization
  async getDatasetsByOrganization(organizationId: string, params: DatasetQueryParams = {}): Promise<PaginatedResponse<Dataset>> {
    const queryString = buildQueryString({ ...params, organizationId })
    const response = await apiClient.get<PaginatedResponse<any>>(`${this.basePath}${queryString}`)
    
    const transformedData = response.data.map(transformDatasetForDisplay)
    
    return {
      ...response,
      data: transformedData
    }
  }

  // Get related datasets
  async getRelatedDatasets(datasetId: string, limit: number = 5): Promise<Dataset[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`${this.basePath}/${datasetId}/related?limit=${limit}`)
    const data = handleApiResponse(response)
    return data.map(transformDatasetForDisplay)
  }

  // Get dataset preview data
  async getDatasetPreview(datasetId: string, limit: number = 100): Promise<DatasetPreview> {
    const response = await apiClient.get<ApiResponse<DatasetPreview>>(`${this.basePath}/${datasetId}/preview?limit=${limit}`)
    return handleApiResponse(response)
  }

  // Get dataset visualizations
  async getDatasetVisualizations(datasetId: string): Promise<DatasetVisualization[]> {
    const response = await apiClient.get<ApiResponse<DatasetVisualization[]>>(`${this.basePath}/${datasetId}/visualizations`)
    return handleApiResponse(response)
  }

  // Get dataset ratings and reviews
  async getDatasetRatings(datasetId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<DatasetRating>> {
    const queryString = buildQueryString({ page, pageSize })
    const response = await apiClient.get<PaginatedResponse<DatasetRating>>(`${this.basePath}/${datasetId}/ratings${queryString}`)
    return response
  }

  // Submit dataset rating
  async rateDataset(datasetId: string, rating: number, comment?: string): Promise<DatasetRating> {
    const response = await apiClient.post<ApiResponse<DatasetRating>>(
      `${this.basePath}/${datasetId}/ratings`,
      { rating, comment }
    )
    return handleApiResponse(response)
  }

  // Update dataset rating
  async updateRating(datasetId: string, ratingId: string, rating: number, comment?: string): Promise<DatasetRating> {
    const response = await apiClient.put<ApiResponse<DatasetRating>>(
      `${this.basePath}/${datasetId}/ratings/${ratingId}`,
      { rating, comment }
    )
    return handleApiResponse(response)
  }

  // Delete dataset rating
  async deleteRating(datasetId: string, ratingId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${datasetId}/ratings/${ratingId}`)
  }

  // Bookmark/favorite a dataset
  async bookmarkDataset(datasetId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${datasetId}/bookmark`)
  }

  // Remove bookmark from dataset
  async removeBookmark(datasetId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${datasetId}/bookmark`)
  }

  // Get user's bookmarked datasets
  async getBookmarkedDatasets(params: DatasetQueryParams = {}): Promise<PaginatedResponse<Dataset>> {
    const queryString = buildQueryString(params)
    const response = await apiClient.get<PaginatedResponse<any>>(`${this.basePath}/bookmarks${queryString}`)
    
    const transformedData = response.data.map(transformDatasetForDisplay)
    
    return {
      ...response,
      data: transformedData
    }
  }

  // Track dataset view/access
  async trackDatasetView(datasetId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${datasetId}/view`)
  }

  // Get user's recently viewed datasets
  async getRecentlyViewedDatasets(limit: number = 10): Promise<Dataset[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`${this.basePath}/recent-views?limit=${limit}`)
    const data = handleApiResponse(response)
    return data.map(transformDatasetForDisplay)
  }

  // Download dataset
  async downloadDataset(datasetId: string, format: 'csv' | 'json' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `${this.basePath}/${datasetId}/download?format=${format}`,
      { headers: { 'Accept': 'application/octet-stream' } }
    )
    return response
  }

  // Get dataset download URL
  async getDownloadUrl(datasetId: string, format: 'csv' | 'json' | 'excel' = 'csv'): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(
      `${this.basePath}/${datasetId}/download-url?format=${format}`
    )
    return handleApiResponse(response).url
  }

  // Get dataset statistics
  async getDatasetStats(datasetId: string): Promise<{
    totalViews: number
    totalDownloads: number
    totalRatings: number
    averageRating: number
    totalBookmarks: number
  }> {
    const response = await apiClient.get<ApiResponse<any>>(`${this.basePath}/${datasetId}/stats`)
    return handleApiResponse(response)
  }

  // Get dataset categories with counts
  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const response = await apiClient.get<ApiResponse<Array<{ name: string; count: number }>>>(`${this.basePath}/categories`)
    return handleApiResponse(response)
  }

  // Get dataset tags with counts
  async getTags(limit: number = 50): Promise<Array<{ name: string; count: number }>> {
    const response = await apiClient.get<ApiResponse<Array<{ name: string; count: number }>>>(`${this.basePath}/tags?limit=${limit}`)
    return handleApiResponse(response)
  }
}

// Create and export the default dataset service instance
export const datasetService = new DatasetService()

// Mock data for development (remove when API is ready)
export const mockDatasets: Dataset[] = [
  {
    id: "1",
    technicalId: "SYSUID.606733",
    sourceSysId: "SYSUID.606733",
    sourceSysName: "Domo GRC",
    name: "Customer Analytics Dataset",
    description: "Comprehensive customer behavior and transaction data for business insights and predictive analytics",
    businessLine: "Analytics",
    businessEntity: "Customer Intelligence",
    maturity: "Published" as any,
    dataLifecycle: "Active" as any,
    location: "Global",
    dataDomain: "Customer Data",
    dataSubDomain: "Behavioral Analytics",
    dataExpert: "Smith, John",
    dataValidator: "Johnson, Sarah",
    dataOwner: {
      id: "owner1",
      name: "Analytics Team Lead",
      email: "analytics@company.com",
      department: "Data Analytics"
    },
    dataSteward: {
      id: "steward1",
      name: "Data Steward",
      email: "steward@company.com",
      department: "Data Governance"
    },
    dataClassification: "Internal" as any,
    legalGroundCollection: "Business analytics and customer insights",
    historicalData: true,
    unlockedGDP: "Achieved",
    ciaRating: "High",
    numberOfDataElements: 156,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    tags: ["customer", "analytics", "behavior", "transactions"],
    metrics: {
      qualityScore: 95,
      completeness: 98,
      accuracy: 94,
      timeliness: 96,
      usageCount: 1234,
      averageRating: 4.8
    },
    visualizations: [],
    relatedDatasets: [],
    ratings: [],
    stories: []
  },
  {
    id: "2",
    technicalId: "SYSUID.606734",
    sourceSysId: "SYSUID.606734",
    sourceSysName: "Financial Data Warehouse",
    name: "Financial Performance Metrics",
    description: "Comprehensive financial performance metrics including revenue, expenses, profit margins, and growth indicators",
    businessLine: "Finance",
    businessEntity: "Financial Planning",
    maturity: "Published" as any,
    dataLifecycle: "Active" as any,
    location: "Global",
    dataDomain: "Financial Data",
    dataSubDomain: "Performance Metrics",
    dataExpert: "Williams, Robert",
    dataValidator: "Brown, Emily",
    dataOwner: {
      id: "owner2",
      name: "Finance Director",
      email: "finance@company.com",
      department: "Finance"
    },
    dataSteward: {
      id: "steward2",
      name: "Financial Data Steward",
      email: "finsteward@company.com",
      department: "Data Governance"
    },
    dataClassification: "Confidential" as any,
    legalGroundCollection: "Financial reporting and analysis",
    historicalData: true,
    unlockedGDP: "Achieved",
    ciaRating: "High",
    numberOfDataElements: 89,
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2024-02-01"),
    tags: ["finance", "metrics", "performance", "revenue"],
    metrics: {
      qualityScore: 98,
      completeness: 99,
      accuracy: 97,
      timeliness: 98,
      usageCount: 876,
      averageRating: 4.9
    },
    visualizations: [],
    relatedDatasets: [],
    ratings: [],
    stories: []
  }
  // Add more mock datasets as needed
]

// Mock service for development
export const mockDatasetService = {
  async getDatasets(params: DatasetQueryParams = {}): Promise<PaginatedResponse<Dataset>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      data: mockDatasets,
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalCount: mockDatasets.length,
        totalPages: Math.ceil(mockDatasets.length / (params.pageSize || 10))
      }
    }
  },

  async getFeaturedDatasets(): Promise<Dataset[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockDatasets.slice(0, 3)
  },

  async getDataset(id: string): Promise<Dataset> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const dataset = mockDatasets.find(d => d.id === id)
    if (!dataset) throw new Error('Dataset not found')
    return dataset
  }
}

// Helper function to get a dataset by ID (now uses real API)
export async function getDatasetById(id: string): Promise<Dataset> {
  try {
    // Use the real API endpoint
    const response = await fetch(`http://localhost:8000/api/datasets/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data as Dataset
  } catch (error) {
    console.error(`Error fetching dataset with ID ${id}:`, error);
    throw error;
  }
}