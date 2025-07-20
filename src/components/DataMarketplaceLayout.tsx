import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { DataMarketplaceSidebar } from "./DataMarketplaceSidebar"
import { DataMarketplaceHeader } from "./DataMarketplaceHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DataMarketplaceLayoutProps {
  breadcrumbs?: BreadcrumbItem[]
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function DataMarketplaceLayout({ breadcrumbs, user }: DataMarketplaceLayoutProps) {
  const { user: authUser } = useAuth()
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
      // Apply the saved theme immediately
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
      return savedTheme
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
      return 'dark'
    }
    return 'light'
  })

  // Apply theme on component mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query)
  }

  // Use authenticated user data
  const currentUser = authUser || user || {
    name: "Administrator",
    email: "admin@datamarketplace.com",
    avatar: "/avatars/user.jpg"
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "280px",
        "--header-height": "64px",
      } as React.CSSProperties}
    >
      <DataMarketplaceSidebar user={currentUser} variant="inset" />
      <SidebarInset>
        <DataMarketplaceHeader
          breadcrumbs={breadcrumbs}
          onSearch={handleSearch}
          onThemeToggle={toggleTheme}
          theme={theme}
          user={currentUser}
          notifications={3}
        />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}