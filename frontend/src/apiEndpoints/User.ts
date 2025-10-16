import axiosInstance from "@/Axios/axios";

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: string;
  status?: string;
  tenant: string;
}

// User Management API Calls
export const createUser = async (userData: CreateUserData) => {
  try {
    const response = await axiosInstance.post('/api/admin/create-user', userData);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.error || 'Failed to create user',
      success: false,
    };
  }
};

export const updateUser = async (id: string, userData: CreateUserData) => {
  try {
    const response = await axiosInstance.put(`/api/admin/update-user/${id}`, userData);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.error || 'Failed to update user',
      success: false,
    };
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/delete-user/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.error || 'Failed to delete user',
      success: false,
    };
  }
};

export const toggleRestrictUser = async (id: string) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/restrict-user/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      message: error.response?.data?.error || 'Failed to toggle user restriction',
      success: false,
    };
  }
};