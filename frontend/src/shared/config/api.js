export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Google auth API
export const googleAuthAPI  = `${BASE_URL}/auth/google`;

export const logoutAPI = `/auth/logout`;

// User & Profile APIs
export const userProfileAPI = `/api/users/me`;
export const ownerCompleteProfileAPI = `/api/profile/owner/complete`;
export const travellerCompleteProfileAPI = `/api/profile/traveller/complete`;
export const ownerProfileAPI = `${BASE_URL}/api/profile/owner/me`;
export const travellerProfileAPI = `${BASE_URL}/api/profile/traveller/me`;


// Master Data APIs For Property Table
export const propertyTypesAPI = `${BASE_URL}/api/master/property-types`;
export const locationsAPI = `${BASE_URL}/api/master/locations`;
export const amenitiesAPI = `${BASE_URL}/api/master/amenities`;


// Property Submission API
export const ownerPropertiesAPI = `${BASE_URL}/api/owner/properties`;

// Rules Management API
export const propertyRulesAPI = `${BASE_URL}/api/rules`;
export const packageTypesAPI = `${BASE_URL}/api/package-types`;
export const daysAPI = `${BASE_URL}/api/master/days`;

// Rules Mapping API
export const propertyRuleMappingAPI = `${BASE_URL}/api/property-rule-mapping`;

// Auction Creation API
export const auctionsAPI = `${BASE_URL}/api/auctions`;
export const ownerPropertiesWithAuctionsAPI = `${BASE_URL}/api/owner/with-auctions`;



// Owner Dashboard & KYC APIs  
export const dashboardStatsAPI = `/dashboard/stats`;
export const kycUploadAPI = `/kyc-upload`;
export const kycStatusAPI = `/kyc-status`;



// Traveller API for property search 
export const travellerPropertiesListAPI = `${BASE_URL}/api/traveller/properties`;
export const searchPropertiesAPI = `${BASE_URL}/api/traveller/properties/search`;

// Traveller Wishlist APIs
export const travellerWishlistAPI = `${BASE_URL}/api/traveller/wishlist`;
export const travellerWishlistToggleAPI = `${BASE_URL}/api/traveller/wishlist/toggle`;