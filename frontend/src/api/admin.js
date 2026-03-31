// frontend/src/api/admin.js
import api from './axiosConfig';

// Fetch all users (Backend will block this if the token doesn't have the "admin" role)
export const getAllUsers = async () => {
    const response = await api.get('/users/');
    return response.data;
};

// Delete a specific user by their ID
export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};