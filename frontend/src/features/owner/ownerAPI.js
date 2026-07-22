import {
    ownerPropertiesAPI, propertyTypesAPI, dashboardStatsAPI, locationsAPI, amenitiesAPI, ownerProfileAPI, propertyRulesAPI,
    packageTypesAPI, daysAPI, propertyRuleMappingAPI, kycStatusAPI, kycUploadAPI, auctionsAPI, ownerPropertiesWithAuctionsAPI
} from "../../shared/config/api";
import axiosInstance from "../../shared/config/axiosInstance";

export const fetchOwnerProfile = async () => {
    const response = await axiosInstance.get(ownerProfileAPI);
    return response.data;
};

export const updateOwnerProfile = async (data) => {
    const response = await axiosInstance.put(ownerProfileAPI, data);
    return response.data;
};

export const fetchPropertyTypes = async () => {
    const response = await axiosInstance.get(propertyTypesAPI);
    return response.data;
};

export const fetchAmenities = async () => {
    const response = await axiosInstance.get(amenitiesAPI);
    return response.data;
};

export const fetchLocations = async () => {
    const response = await axiosInstance.get(locationsAPI);
    return response.data;
};

export const fetchCreateProperty = async (propertyData) => {
    const response = await axiosInstance.post(ownerPropertiesAPI, propertyData);
    return response.data;
};

export const fetchUploadImages = async (propertyId, images) => {
    const formData = new FormData();
    const primaryIndex = images.findIndex(img => img.is_primary);
    formData.append("primary_index", primaryIndex !== -1 ? primaryIndex : 0);
    images.forEach((img) => formData.append("images", img.file));

    const response = await axiosInstance.post(`${ownerPropertiesAPI}/${propertyId}/images`, formData);
    return response.data;
};

export const fetchOwnerProperties = async (page = 1, limit = 10, status = 'ALL', search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status !== 'ALL') params.append('status', status);
    if (search && search.trim() !== '') params.append('search', search.trim());

    const response = await axiosInstance.get(`${ownerPropertiesAPI}?${params.toString()}`);
    return response.data;
};

export const fetchPropertyById = async (propertyId) => {
    const response = await axiosInstance.get(`${ownerPropertiesAPI}/${propertyId}`);
    return response.data;
};

export const updateProperty = async (propertyId, propertyData) => {
    const response = await axiosInstance.put(`${ownerPropertiesAPI}/${propertyId}`, propertyData);
    return response.data;
};

export const deletePropertyImage = async (propertyId, imageId) => {
    const response = await axiosInstance.delete(`${ownerPropertiesAPI}/${propertyId}/images/${imageId}`);
    return response.data;
};

export const updatePropertyStatus = async (propertyId, newStatus) => {
    const response = await axiosInstance.patch(`${ownerPropertiesAPI}/${propertyId}/status`, { status: newStatus });
    return response.data;
};

export const updatePrimaryImage = async (propertyId, imageId) => {
    const response = await axiosInstance.patch(`${ownerPropertiesAPI}/${propertyId}/images/${imageId}/primary`);
    return response.data;
};

export const fetchUploadVideo = async (propertyId, videoFile) => {
    const formData = new FormData();
    formData.append("video", videoFile);
    const response = await axiosInstance.post(`${ownerPropertiesAPI}/${propertyId}/upload-video`, formData);
    return response.data;
};

export const deletePropertyVideo = async (propertyId) => {
    const response = await axiosInstance.delete(`${ownerPropertiesAPI}/${propertyId}/delete-video`);
    return response.data;
};

// RULES MANAGEMENT APIs

export const fetchAllRules = async () => {
    const response = await axiosInstance.get(propertyRulesAPI);
    return response; 
};

export const createRule = async (ruleData) => {
    const response = await axiosInstance.post(propertyRulesAPI, ruleData);
    return response.data;
};

export const updateRule = async (id, ruleData) => {
    const response = await axiosInstance.put(`${propertyRulesAPI}/${id}`, ruleData);
    return response.data;
};

export const enableRule = async (id) => {
    const response = await axiosInstance.put(`${propertyRulesAPI}/${id}/enable`);
    return response.data;
};

export const disableRule = async (id) => {
    const response = await axiosInstance.put(`${propertyRulesAPI}/${id}/disable`);
    return response.data;
};

export const fetchPackageTypes = async () => {
    const response = await axiosInstance.get(packageTypesAPI);
    return response.data;
};

export const createPackageType = async (packageTypeData) => {
    const response = await axiosInstance.post(packageTypesAPI, packageTypeData);
    return response.data;
};

export const fetchDays = async () => {
    const response = await axiosInstance.get(daysAPI);
    return response.data;
};

export const fetchRuleCounts = async () => {
    const response = await axiosInstance.get(`${propertyRulesAPI}/count`);
    return response.data;
};

export const deletePackageType = async (id) => {
    const response = await axiosInstance.delete(`${packageTypesAPI}/${id}`);
    return response.data;
};

// PROPERTY RULE MAPPING APIs

export const fetchAllPropertyRuleMappings = async (searchKeyword = "") => {
    const url = searchKeyword
        ? `${propertyRuleMappingAPI}?search=${encodeURIComponent(searchKeyword)}`
        : propertyRuleMappingAPI;
    const response = await axiosInstance.get(url);
    return response.data;
};

export const fetchPropertyRuleMappings = async (propertyId) => {
    const response = await axiosInstance.get(`${propertyRuleMappingAPI}/${propertyId}`);
    return response.data;
};

export const createPropertyRuleMapping = async (mappingData) => {
    const response = await axiosInstance.post(propertyRuleMappingAPI, mappingData);
    return response.data;
};

export const updatePropertyRuleMapping = async (mappingId, mappingData) => {
    const response = await axiosInstance.put(`${propertyRuleMappingAPI}/${mappingId}`, mappingData);
    return response.data;
};

export const enablePropertyRuleMapping = async (mappingId) => {
    const response = await axiosInstance.put(`${propertyRuleMappingAPI}/${mappingId}/enable`);
    return response.data;
};

export const disablePropertyRuleMapping = async (mappingId) => {
    const response = await axiosInstance.put(`${propertyRuleMappingAPI}/${mappingId}/disable`);
    return response.data;
};

export const fetchMappingCounts = async () => {
    const response = await axiosInstance.get(`${propertyRuleMappingAPI}/count`);
    return response.data;
};

// Auction creation APIs 


export const fetchAuctions = async (page = 1, limit = 10, status = 'ALL', search = '', propertyId = null, sortOrder = 'DESC', filters = {}) => {
    const params = new URLSearchParams({ page: page, limit: limit });
    if (status !== 'ALL') params.append('status', status);
    if (search && search.trim() !== '') params.append('search', search.trim());
    if (propertyId) params.append('propertyId', propertyId);
    params.append('sortOrder', sortOrder);

    // Append inner advanced filters if they exist
    if (filters?.ruleName) params.append('ruleName', filters.ruleName.trim());
    if (filters?.stayFrom) params.append('stayFrom', filters.stayFrom);
    if (filters?.stayTo) params.append('stayTo', filters.stayTo);
    if (filters?.minCost) params.append('minCost', filters.minCost);
    if (filters?.maxCost) params.append('maxCost', filters.maxCost);

    const response = await axiosInstance.get(`${auctionsAPI}?${params.toString()}`);
    return response.data;
};



// won't crash; it will just show 0 instead. This is a valid use of try/catch in an API file.
export const fetchAuctionCounts = async () => {
    try {
        const response = await axiosInstance.get(`${auctionsAPI}/count`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch auction counts", error);
        return { total: 0, open: 0, closed: 0, cancelled: 0 };
    }
};

export const cancelAuction = async (auctionId) => {
    const response = await axiosInstance.put(`${auctionsAPI}/${auctionId}/cancel`);
    return response.data;
};

export const fetchPropertiesWithAuctions = async (page = 1, limit = 10, status = 'ALL', search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status !== 'ALL') params.append('status', status);
    if (search && search.trim() !== '') params.append('search', search.trim());

    const response = await axiosInstance.get(`${ownerPropertiesWithAuctionsAPI}?${params.toString()}`);
    return response.data;
};

export const fetchDashboardStats = async (userId) => {
    if (!userId) return { totalProperties: 0, activeAuctions: 0, bidsReceived: 0, expectedPayout: 0 };
    const response = await axiosInstance.get(`${dashboardStatsAPI}/${userId}`);
    return response.data;
};

export const uploadKycDocument = async (userId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    const response = await axiosInstance.post(`${kycUploadAPI}/${userId}`, formData);
    return response.data;
};

export const getKycStatus = async (userId) => {
    const response = await axiosInstance.get(`${kycStatusAPI}/${userId}`);
    return response.data;
};
