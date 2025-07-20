import { createBrowserRouter } from "react-router-dom"
import { DataMarketplaceLayout } from "./components/DataMarketplaceLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { LoginPage } from "./pages/LoginPage"
import { HomePage } from "./pages/HomePage"
import { DatasetsPage } from "./pages/DatasetsPage"
import { DatasetDetailPage } from "./pages/DatasetDetailPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DataMarketplaceLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "datasets",
        element: <DatasetsPage />,
      },
      {
        path: "datasets/:id",
        element: <DatasetDetailPage />,
      },
      // Placeholder routes for future implementation
      {
        path: "analytics",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Analytics Dashboard</h1><p>Coming soon...</p></div>,
      },
      {
        path: "organizations",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Organizations</h1><p>Coming soon...</p></div>,
      },
      {
        path: "stories",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Data Stories</h1><p>Coming soon...</p></div>,
      },
      {
        path: "bookmarks",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Bookmarked Datasets</h1><p>Coming soon...</p></div>,
      },
      {
        path: "recent",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Recently Viewed</h1><p>Coming soon...</p></div>,
      },
      {
        path: "popular",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Popular Datasets</h1><p>Coming soon...</p></div>,
      },
      {
        path: "settings",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Coming soon...</p></div>,
      },
      {
        path: "help",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Help & Support</h1><p>Coming soon...</p></div>,
      },
      {
        path: "search",
        element: <div className="p-6"><h1 className="text-2xl font-bold">Advanced Search</h1><p>Coming soon...</p></div>,
      },
    ],
  },
])