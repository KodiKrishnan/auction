import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";


import NotFoundPage from "../components/common/NotFoundPage"

/* LAYOUTS */
import OwnerAuthLayout from "../layouts/OwnerAuthLayout";
import OwnerDashboardLayout from "../layouts/OwnerDashboardLayout";
import TravellerAuthLayout from "../layouts/TravellerAuthLayout";
import TravellerMainLayout from "../layouts/TravellerMainLayout";
import TravellerSimpleLayout from "../layouts/TravellerSimpleLayout";

/* SHARED AUTH PAGES */
import ProfileCompletion from "../features/auth/pages/ProfileCompletion";
import OtpVerification from "../features/auth/pages/OtpVerification";

/* OWNER PAGES */
import OwnerRegistration from "../features/owner/pages/OwnerRegistration";
import OwnerDashboard from "../features/owner/pages/OwnerDashboard";
import KycUpload from "../features/owner/pages/KycUpload";
import AddProperty from "../features/owner/pages/AddProperty";
import PropertiesList from "../features/owner/pages/PropertiesList";
import PropertyDetail from "../features/owner/pages/PropertyDetail";
import EditProperty from "../features/owner/pages/EditProperty";
import RulesPage from '../features/owner/pages/RulesPage';
import PropertyRuleMappingPage from '../features/owner/pages/PropertyRuleMappingPage';
import OwnerProfile from "../features/owner/pages/OwnerProfile";
import AuctionsPage from "../features/owner/pages/AuctionsPage";



/* TRAVELLER PAGES */
import TravellerRegistration from "../features/traveller/pages/TravellerRegistration";
import TravellerProfile from "../features/traveller/pages/TravellerProfile";
import PropertySearch from "../features/traveller/pages/PropertySearch";
import PropertyDetailTraveller from "../features/traveller/pages/PropertyDetail";
import TravellerWishlist from "../features/traveller/pages/TravellerWishlist";


export default function AppRouters() {
  return (
    <Routes>
      {/* DEFAULT REDIRECT - Pointing to Owner Registration for now */}
      <Route path="/" element={<Navigate to="/owner/register" replace />} />


      {/* OWNER ROUTES */}
      {/* Owner Auth Flow (Includes the Navbar) */}
      <Route element={<OwnerAuthLayout />}>
        <Route path="/owner/register" element={<OwnerRegistration />} />
      </Route>

      {/* Owner Dashboard Flow (Includes Sidebar/Topbar) */}
      <Route element={<OwnerDashboardLayout />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      </Route>

      {/* Owner Standalone (No Layouts - e.g., for a dedicated full-screen upload UI) */}
      <Route path="/owner/otp-verification" element={<OtpVerification role="OWNER" />} />
      <Route path="/owner/profile-completion" element={<ProfileCompletion role="OWNER" />} />
      <Route path="/owner/profile" element={<OwnerProfile />} />
      <Route path="/owner/kyc" element={<NotFoundPage />} />
      <Route path="/owner/properties/new" element={<AddProperty />} />
      <Route path="/owner/properties" element={<PropertiesList />} />
      <Route path="/owner/properties/:id" element={<PropertyDetail />} />
      <Route path="/owner/properties/:id/edit" element={<EditProperty />} />
      <Route path="/owner/rules" element={<RulesPage />} />
      <Route path="/owner/rules-mapping" element={<PropertyRuleMappingPage />} />
      <Route path="/owner/auctions" element={<AuctionsPage />} />



      {/* TRAVELLER ROUTES */}

      {/* Traveller Auth Flow (Includes the Navbar) */}
      <Route element={<TravellerAuthLayout />}>
        <Route path="/traveller/register" element={<TravellerRegistration />} />
      </Route>

      {/*  Traveller Main App Area with Search Navbar (Main Layout) */}
      <Route element={<TravellerMainLayout />}>
        <Route path="/traveller/properties" element={<PropertySearch />} />
      </Route>

      {/* Traveller App Area with Minimal Navbar (Simple Layout) */}
      <Route element={<TravellerSimpleLayout />}>
        <Route path="/traveller/wishlist" element={<TravellerWishlist />} />
      </Route>

      {/* Traveller Standalone (No Layouts - e.g., for a dedicated full-screen upload UI) */}
      <Route path="/traveller/profile" element={<TravellerProfile />} />
      <Route path="/traveller/otp-verification" element={<OtpVerification role="TRAVELLER" />} />
      <Route path="/traveller/profile-completion" element={<ProfileCompletion role="TRAVELLER" />} />
      {/* <Route path="/traveller/properties/:id" element={<PropertyDetailTraveller />} /> */}
      <Route path="/traveller/properties/:id" element={<Navigate to="/traveller/properties" replace />} />



      {/* 404 CATCH-ALL */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}