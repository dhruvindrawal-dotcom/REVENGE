import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer, MobileBottomNav } from './components/layout/Footer';
import { RequireAuth } from './routes/RequireAuth';

import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { SearchPage } from './pages/Search';
import { ProviderProfilePage } from './pages/ProviderProfile';
import { ExperiencesPage, ExperienceDetailPage, CategoriesPage, CategoryDetailPage, MapPage, AboutPage } from './pages/PublicPages';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { ProviderRegisterPage } from './pages/ProviderRegister';
import { NotFoundPage } from './pages/NotFound';

import { ProviderDashboardLayout } from './pages/provider/DashboardLayout';
import { ProviderOverview } from './pages/provider/Overview';
import {
  ProviderEnquiries, ProviderBookings, ProviderReviews, ProviderVerificationPage,
  ProviderServicesPage, ProviderProfileSettings, ProviderPortfolioPage,
  ProviderExperiencesManagePage, ProviderSettingsPage,
} from './pages/provider/ManagementPages';

import { CustomerDashboard, SavedPage, CustomerBookingsPage } from './pages/customer/CustomerPages';

import {
  AdminLayout, AdminDashboardPage, AdminProvidersPage, AdminReportsPage,
  AdminReviewsPage, AdminCategoriesPage,
} from './pages/admin/AdminPages';

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Shell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/provider/:slug" element={<ProviderProfilePage />} />
              <Route path="/experiences" element={<ExperiencesPage />} />
              <Route path="/experience/:id" element={<ExperienceDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:slug" element={<CategoryDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route path="/providers/register" element={<RequireAuth roles={['provider']}><ProviderRegisterPage /></RequireAuth>} />

              <Route path="/customer/dashboard" element={<RequireAuth roles={['customer']}><CustomerDashboard /></RequireAuth>} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/bookings" element={<CustomerBookingsPage />} />

              <Route path="/provider" element={<RequireAuth roles={['provider']}><ProviderDashboardLayout /></RequireAuth>}>
                <Route path="dashboard" element={<ProviderOverview />} />
                <Route path="profile" element={<ProviderProfileSettings />} />
                <Route path="services" element={<ProviderServicesPage />} />
                <Route path="portfolio" element={<ProviderPortfolioPage />} />
                <Route path="experiences" element={<ProviderExperiencesManagePage />} />
                <Route path="enquiries" element={<ProviderEnquiries />} />
                <Route path="bookings" element={<ProviderBookings />} />
                <Route path="reviews" element={<ProviderReviews />} />
                <Route path="analytics" element={<ProviderOverview />} />
                <Route path="verification" element={<ProviderVerificationPage />} />
                <Route path="settings" element={<ProviderSettingsPage />} />
              </Route>

              <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminLayout /></RequireAuth>}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="providers" element={<AdminProvidersPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Shell>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
