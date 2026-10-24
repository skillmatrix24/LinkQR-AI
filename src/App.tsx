/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Page from './app/page';
import FeaturesPage from './app/features/page';
import PricingPage from './app/pricing/page';
import LoginPage from './app/login/page';
import SignupPage from './app/signup/page';
import AboutPage from './app/about/page';
import ContactPage from './app/contact/page';
import PrivacyPage from './app/privacy/page';
import TermsPage from './app/terms/page';
import DashboardLayout from './app/dashboard/layout';
import { FirebaseProvider } from './firebase';
import { initializeFirebase } from './firebase';
import { useMemo } from 'react';

export default function App() {
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  return (
    <BrowserRouter>
      <FirebaseProvider {...firebaseServices}>
        <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/dashboard/*" element={<DashboardLayout children={<></>} />} />
        </Routes>
      </FirebaseProvider>
    </BrowserRouter>
  );
}
