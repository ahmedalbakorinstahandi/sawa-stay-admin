import axios from "axios"
import { getToken } from "@/lib/cookies"

const BASE_URL = "https://airbnb-backend.ahmed-albakor.com/api"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// إضافة اعتراض للطلبات لإضافة التوكن إذا كان موجوداً
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// إضافة اعتراض للاستجابات للتعامل مع أخطاء المصادقة
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // إذا كان الخطأ 401 (غير مصرح)، قم بإزالة التوكن وإعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)
// upload image 
export const uploadImage = async (file: File) => {
  const formData = new FormData()
  formData.append("image", file)
  formData.append("folder", "listings")

  try {
    const response = await api.post("/general/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.data
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to upload image" }
  }
}
// Users API
export const usersAPI = {
  getAll: async (page = 1, perPage = 10, filters = {}) => {
    try {
      const response = await api.get(`/admin/users`, {
        params: {
          page,
          per_page: perPage,
          ...filters,
        },
      })
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch users" }
    }
  },
  get: async (id: number) => {
    try {
      const response = await api.get(`/admin/users/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch user" }
    }
  },
  create: async (data: any) => {
    try {
      const response = await api.post("/admin/users", data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to create user" }
    }
  },
  update: async (id: number, data: any) => {
    try {
      const response = await api.put(`/admin/users/${id}`, data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update user" }
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/admin/users/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to delete user" }
    }
  },
  updateStatus: async (id: number, status: string) => {
    try {
      const response = await api.put(`/admin/users/${id}/status`, { status })
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update user status" }
    }
  },
}

// House Types API
export const houseTypesAPI = {
  getAll: async (page = 1, perPage = 10) => {
    try {
      const response = await api.get(`/admin/house-types?page=${page}&per_page=${perPage}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch house types" }
    }
  },
  get: async (id: number) => {
    try {
      const response = await api.get(`/admin/house-types/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch house type" }
    }
  },
  create: async (data: any) => {
    try {
      const response = await api.post("/admin/house-types", data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to create house type" }
    }
  },
  update: async (id: number, data: any) => {
    try {
      const response = await api.put(`/admin/house-types/${id}`, data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update house type" }
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/admin/house-types/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to delete house type" }
    }
  },
}

// Categories API
export const categoriesAPI = {
  getAll: async (page = 1, perPage = 10) => {
    try {
      const response = await api.get(`/admin/categories?page=${page}&per_page=${perPage}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch categories" }
    }
  },
  get: async (id: number) => {
    try {
      const response = await api.get(`/admin/categories/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch category" }
    }
  },
  create: async (data: any) => {
    try {
      const response = await api.post("/admin/categories", data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to create category" }
    }
  },
  update: async (id: number, data: any) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update category" }
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/admin/categories/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to delete category" }
    }
  },
}

// Features API
export const featuresAPI = {
  getAll: async (page = 1, perPage = 10) => {
    try {
      const response = await api.get(`/admin/features?page=${page}&per_page=${perPage}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch features" }
    }
  },
  get: async (id: number) => {
    try {
      const response = await api.get(`/admin/features/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch feature" }
    }
  },
  create: async (data: any) => {
    try {
      const response = await api.post("/admin/features", data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to create feature" }
    }
  },
  update: async (id: number, data: any) => {
    try {
      const response = await api.put(`/admin/features/${id}`, data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update feature" }
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/admin/features/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to delete feature" }
    }
  },
}

// Listings API
export const listingsAPI = {
  getAll: async (page = 1, perPage = 10, filters = {}) => {
    try {
      const response = await api.get(`/admin/listings`, {
        params: {
          page,
          per_page: perPage,
          ...filters,
        },
      })
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch listings" }
    }
  },
  get: async (id: number) => {
    try {
      const response = await api.get(`/admin/listings/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch listing" }
    }
  },
  create: async (data: any) => {
    try {
      const response = await api.post("/admin/listings", data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to create listing" }
    }
  },
  update: async (id: number, data: any) => {
    try {
      const response = await api.put(`/admin/listings/${id}`, data)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update listing" }
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/admin/listings/${id}`)
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to delete listing" }
    }
  },
  updateStatus: async (id: number, status: string) => {
    try {
      const response = await api.put(`/admin/listings/${id}/status`, { status })
      return response.data
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update listing status" }
    }
  },
}

// دوال مساعدة للتعامل مع API
export const apiHelper = {
  // دالة جلب بيانات المستخدم الحالي
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  // دالة جلب قائمة من البيانات
  getList: async (endpoint: string, params = {}) => {
    try {
      const response = await api.get(endpoint, { params })
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  // دالة جلب عنصر واحد
  getItem: async (endpoint: string, id: string | number) => {
    try {
      const response = await api.get(`${endpoint}/${id}`)
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  // دالة إنشاء عنصر جديد
  createItem: async (endpoint: string, data: any) => {
    try {
      const response = await api.post(endpoint, data)
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  // دالة تحديث عنصر
  updateItem: async (endpoint: string, id: string | number, data: any) => {
    try {
      const response = await api.put(`${endpoint}/${id}`, data)
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  // دالة حذف عنصر
  deleteItem: async (endpoint: string, id: string | number) => {
    try {
      const response = await api.delete(`${endpoint}/${id}`)
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  // دالة رفع ملف
  uploadFile: async (endpoint: string, file: File, onProgress?: (percentage: number) => void) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentage)
          }
        },
      })

      return response.data
    } catch (error) {
      return { success: false }
    }
  },
}
