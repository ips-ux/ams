import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Spinner } from '@/components/ui/Spinner'

// Eagerly-loaded (small / critical path)
import { AuthPage } from '@/features/auth/AuthPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'

// Lazy-loaded feature pages (code-split per route)
const KanbanBoard          = lazy(() => import('@/features/projects').then((m) => ({ default: m.KanbanBoard })))
const ContactsPage         = lazy(() => import('@/features/contacts/ContactsPage').then((m) => ({ default: m.ContactsPage })))
const LabelsPage           = lazy(() => import('@/features/labels/LabelsPage').then((m) => ({ default: m.LabelsPage })))
const DiscographyPage      = lazy(() => import('@/features/discography/DiscographyPage').then((m) => ({ default: m.DiscographyPage })))
const ReleasesPage         = lazy(() => import('@/features/releases/ReleasesPage').then((m) => ({ default: m.ReleasesPage })))
const PromoPlatformsPage   = lazy(() => import('@/features/promo-platforms/PromoPlatformsPage').then((m) => ({ default: m.PromoPlatformsPage })))
const SyncPlatformsPage    = lazy(() => import('@/features/sync-platforms/SyncPlatformsPage').then((m) => ({ default: m.SyncPlatformsPage })))
const TodosPage            = lazy(() => import('@/features/todos/TodosPage').then((m) => ({ default: m.TodosPage })))
const MerchPage            = lazy(() => import('@/features/merch/MerchPage').then((m) => ({ default: m.MerchPage })))
const PlaylistsPage        = lazy(() => import('@/features/playlists/PlaylistsPage').then((m) => ({ default: m.PlaylistsPage })))
const BrandStrategyPage    = lazy(() => import('@/features/brand/BrandStrategyPage').then((m) => ({ default: m.BrandStrategyPage })))
const HabitsPage           = lazy(() => import('@/features/habits/HabitsPage').then((m) => ({ default: m.HabitsPage })))
const LibraryPage          = lazy(() => import('@/features/library/LibraryPage').then((m) => ({ default: m.LibraryPage })))
const LibraryDocPage       = lazy(() => import('@/features/library/LibraryDocPage').then((m) => ({ default: m.LibraryDocPage })))
const DirectoryPage        = lazy(() => import('@/features/community/DirectoryPage').then((m) => ({ default: m.DirectoryPage })))
const FeedbackPage         = lazy(() => import('@/features/community/FeedbackPage').then((m) => ({ default: m.FeedbackPage })))
const CollabsPage          = lazy(() => import('@/features/community/CollabsPage').then((m) => ({ default: m.CollabsPage })))
const SocialAccountsPage   = lazy(() => import('@/features/social/SocialAccountsPage').then((m) => ({ default: m.SocialAccountsPage })))
const PressKitPage         = lazy(() => import('@/features/press-kit/PressKitPage').then((m) => ({ default: m.PressKitPage })))
const BrainstormPage       = lazy(() => import('@/features/brainstorm/BrainstormPage').then((m) => ({ default: m.BrainstormPage })))
const CalendarPage         = lazy(() => import('@/features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })))
const ChallengesPage       = lazy(() => import('@/features/challenges/ChallengesPage').then((m) => ({ default: m.ChallengesPage })))
const LinkPageBuilder      = lazy(() => import('@/features/link-page/LinkPageBuilder').then((m) => ({ default: m.LinkPageBuilder })))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
})

function RouteSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  )
}

export default function App() {
  useFirebaseAuth()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="projects"        element={<Suspense fallback={<RouteSpinner />}><KanbanBoard /></Suspense>} />
              <Route path="discography"     element={<Suspense fallback={<RouteSpinner />}><DiscographyPage /></Suspense>} />
              <Route path="brand"           element={<Suspense fallback={<RouteSpinner />}><BrandStrategyPage /></Suspense>} />
              <Route path="brainstorm"      element={<Suspense fallback={<RouteSpinner />}><BrainstormPage /></Suspense>} />
              <Route path="challenges"      element={<Suspense fallback={<RouteSpinner />}><ChallengesPage /></Suspense>} />
              <Route path="contacts"        element={<Suspense fallback={<RouteSpinner />}><ContactsPage /></Suspense>} />
              <Route path="labels"          element={<Suspense fallback={<RouteSpinner />}><LabelsPage /></Suspense>} />
              <Route path="promo-platforms" element={<Suspense fallback={<RouteSpinner />}><PromoPlatformsPage /></Suspense>} />
              <Route path="sync-platforms"  element={<Suspense fallback={<RouteSpinner />}><SyncPlatformsPage /></Suspense>} />
              <Route path="releases"        element={<Suspense fallback={<RouteSpinner />}><ReleasesPage /></Suspense>} />
              <Route path="press-kit"       element={<Suspense fallback={<RouteSpinner />}><PressKitPage /></Suspense>} />
              <Route path="social"          element={<Suspense fallback={<RouteSpinner />}><SocialAccountsPage /></Suspense>} />
              <Route path="link-page"       element={<Suspense fallback={<RouteSpinner />}><LinkPageBuilder /></Suspense>} />
              <Route path="library"         element={<Suspense fallback={<RouteSpinner />}><LibraryPage /></Suspense>} />
              <Route path="library/:slug"   element={<Suspense fallback={<RouteSpinner />}><LibraryDocPage /></Suspense>} />
              <Route path="community"       element={<Suspense fallback={<RouteSpinner />}><DirectoryPage /></Suspense>} />
              <Route path="community/feedback" element={<Suspense fallback={<RouteSpinner />}><FeedbackPage /></Suspense>} />
              <Route path="community/collabs"  element={<Suspense fallback={<RouteSpinner />}><CollabsPage /></Suspense>} />
              <Route path="calendar"        element={<Suspense fallback={<RouteSpinner />}><CalendarPage /></Suspense>} />
              <Route path="todos"           element={<Suspense fallback={<RouteSpinner />}><TodosPage /></Suspense>} />
              <Route path="habits"          element={<Suspense fallback={<RouteSpinner />}><HabitsPage /></Suspense>} />
              <Route path="merch"           element={<Suspense fallback={<RouteSpinner />}><MerchPage /></Suspense>} />
              <Route path="playlists"       element={<Suspense fallback={<RouteSpinner />}><PlaylistsPage /></Suspense>} />
              <Route path="download-gates"  element={<PlaceholderPage title="Download Gates" />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
