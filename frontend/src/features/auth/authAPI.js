
import { googleAuthAPI, logoutAPI, ownerCompleteProfileAPI, travellerCompleteProfileAPI, userProfileAPI } from '../../shared/config/api';
import axiosInstance from '../../shared/config/axiosInstance';


// // Sends the Google token to the backend (@PostMapping("/google")) to authenticate the user

export const fetchGoogleAuth = async (idToken, role) => {
    try {
        const payload = {
            credential: idToken,
            role: role
        };

        const response = await axiosInstance.post(googleAuthAPI, payload);

        // You MUST return this so your component can read { status, user }
        return response.data;

    } catch (error) {
        // This catches network errors and sends a clean message back to the component
        throw error.response?.data?.message || "Failed to connect to auth server.";
    }
};




// Fetches user session data to keep them logged in on refresh
export const fetchUserProfile = async () => {
    try {
        const response = await axiosInstance.get(userProfileAPI);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to load profile";
    }
};



// Submits profile details, dynamically routing based on role
export const fetchCompleteProfile = async (userId, formData, role) => {
    try {
        const endpoint = role === 'OWNER'
            ? `${ownerCompleteProfileAPI}/${userId}`
            : `${travellerCompleteProfileAPI}/${userId}`;

        // Create a clean object that matches the Java DTO exactly
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            dob: formData.dob, 
            email: formData.email
        };

        
        const response = await axiosInstance.post(endpoint, payload);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Check your date format or network.";
    }
};




/// Calls backend to destroy the user's secure session cookie
export const logoutUser = async () => {
    try {
        await axiosInstance.post(logoutAPI);
    } catch (error) {
        console.error("Logout failed", error);
    }
};