import { Route, Routes, useLocation } from 'react-router'
import { BottomNav } from './components/BottomNav'
import { ToastProvider } from './components/Toast'
import Library from './routes/Library'
import Login from './routes/Login'
import Search from './routes/Search'
import SettingsPage from './routes/Settings'
import TitleDetailPage from './routes/TitleDetail'
import UpNext from './routes/UpNext'

export default function App() {
  const onLogin = useLocation().pathname === '/login'
  return (
    <ToastProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink">
        Skip to content
      </a>
      <main id="main" className="mx-auto min-h-dvh max-w-2xl px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Routes>
          <Route path="/" element={<UpNext />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/title/:type/:tmdbId" element={<TitleDetailPage />} />
          <Route path="*" element={<UpNext />} />
        </Routes>
      </main>
      {!onLogin && <BottomNav />}
    </ToastProvider>
  )
}
