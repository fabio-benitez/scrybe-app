import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { ProtectedRoute } from "@/features/auth/components/protected-route"
import LoginPage from "@/features/auth/pages/login-page"
import RegisterPage from "@/features/auth/pages/register-page"
import DashboardPage from "@/features/dashboard/pages/dashboard-page"
import CategoriesPage from "@/features/categories/pages/categories-page"
import NotesPage from "@/features/contents/pages/notes-page"
import FavoritesPage from "@/features/contents/pages/favorites-page"
import NoteDetailPage from "@/features/contents/pages/note-detail-page"
import NoteEditorPage from "@/features/contents/pages/note-editor-page"
import TrashPage from "@/features/contents/pages/trash-page"
import ProfileSettingsPage from "@/features/profile/pages/profile-settings-page"
import { AppLayout } from "@/layouts/app-layout"

function RootRedirect() {
  const { session, isLoading } = useAuth()

  if (isLoading) return null

  return <Navigate to={session ? "/app" : "/login"} replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/notes" element={<NotesPage />} />
            <Route path="/app/favorites" element={<FavoritesPage />} />
            <Route path="/app/notes/new" element={<NoteEditorPage />} />
            <Route path="/app/notes/:contentId" element={<NoteDetailPage />} />
            <Route path="/app/notes/:contentId/edit" element={<NoteEditorPage />} />
            <Route path="/app/categories" element={<CategoriesPage />} />
            <Route path="/app/trash" element={<TrashPage />} />
            <Route path="/app/settings" element={<ProfileSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}