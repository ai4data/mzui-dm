import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Database, Users, FileText, ArrowRight } from "lucide-react"
import { DatasetGrid } from "@/components/DatasetGrid"
import { mockDatasetService } from "@/services/datasetService"
import { Dataset } from "@/types"

export function HomePage() {
  const [featuredDatasets, setFeaturedDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedDatasets = async () => {
      try {
        setLoading(true)
        console.log('Loading featured datasets...')
        const datasets = await mockDatasetService.getFeaturedDatasets()
        console.log('Loaded datasets:', datasets)
        setFeaturedDatasets(datasets)
      } catch (error) {
        console.error('Failed to load featured datasets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedDatasets()
  }, [])

  const stats = [
    {
      title: "Total Datasets",
      value: "1,247",
      change: "+12.5%",
      icon: Database,
      trend: "up"
    },
    {
      title: "Active Users",
      value: "3,456",
      change: "+8.2%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Data Stories",
      value: "89",
      change: "+15.3%",
      icon: FileText,
      trend: "up"
    },
    {
      title: "Quality Score",
      value: "94.2%",
      change: "+2.1%",
      icon: TrendingUp,
      trend: "up"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Data Marketplace</h1>
        <p className="text-muted-foreground">
          Discover, explore, and utilize high-quality datasets to drive your business decisions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">{stat.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Datasets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Featured Datasets</h2>
          <Button variant="outline">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <DatasetGrid
          datasets={featuredDatasets}
          loading={loading}
          onDatasetSelect={(dataset) => console.log('Selected:', dataset)}
          onBookmark={(id) => console.log('Bookmarked:', id)}
          onDownload={(id) => console.log('Downloaded:', id)}
          viewMode="grid"
          showViewToggle={false}
          showFilters={false}
          compact={true}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Browse Datasets
              </CardTitle>
              <CardDescription>
                Explore our comprehensive collection of business datasets
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                View Organizations
              </CardTitle>
              <CardDescription>
                Discover data providers and their contributions
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Read Data Stories
              </CardTitle>
              <CardDescription>
                Learn from real-world data analysis examples
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}