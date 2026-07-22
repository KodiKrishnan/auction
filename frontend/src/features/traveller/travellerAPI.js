import axiosInstance from '../../shared/config/axiosInstance';
import {
  travellerPropertiesListAPI, searchPropertiesAPI, travellerWishlistAPI, travellerWishlistToggleAPI,
  travellerProfileAPI
} from '../../shared/config/api';


// Fetch Traveller Profile details
export const fetchTravellerProfile = async () => {
  const response = await axiosInstance.get(travellerProfileAPI);
  return response.data;
};

// Update Traveller Profile details
export const updateTravellerProfile = async (data) => {
  const response = await axiosInstance.put(travellerProfileAPI, data);
  return response.data;
};


//  1. Fetch Stays Discovery Sections (Featured, Goa, Manali list)

export const fetchAllPropertiesList = async (page = 1, limit = 12) => {
  const response = await axiosInstance.get(travellerPropertiesListAPI, {
    params: { page, limit }
  });
  return response.data;
};


//  2. Search and Filter Stays

export const fetchSearchProperties = async (params) => {
  const response = await axiosInstance.get(searchPropertiesAPI, { params });
  return response.data;
};


// 3. Fetch Single Property Details by ID

export const fetchPropertyById = async (id) => {
  const response = await axiosInstance.get(`${travellerPropertiesListAPI}/${id}`);
  return response.data;
};

//  4. Fetch Traveller Wishlist (Paginated)

export const fetchWishlist = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get(travellerWishlistAPI, {
    params: { page, limit }
  });
  return response.data;
};

// 5. Toggle Wishlist Status for a Property

export const toggleWishlist = async (propertyId) => {
  const response = await axiosInstance.post(travellerWishlistToggleAPI, null, {
    params: { propertyId }
  });
  return response.data;
};
