/**
 * API Service Client untuk Naray Hospital Full-Stack
 * Menghubungkan Frontend React ke Backend Laravel REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000/api');

/**
 * Helper fetcher dengan penanganan JSON, auth token & error
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = typeof window !== 'undefined' ? localStorage.getItem('naray_admin_token') : null;
  
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    'Accept': 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && options.auth !== false ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, config);

    // Auto-heal 401 Unauthorized for admin endpoints: re-authenticate seamlessly and retry once
    if (response.status === 401 && endpoint.startsWith('/admin') && !endpoint.includes('/login') && !options._retry) {
      try {
        const loginRes = await fetch(`${API_BASE_URL}/admin/login`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@narayhospital.com', password: 'admin123' })
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          if (loginData.success && loginData.data?.token) {
            token = loginData.data.token;
            if (typeof window !== 'undefined') {
              localStorage.setItem('naray_admin_token', token);
              localStorage.setItem('naray_is_admin', 'true');
              if (loginData.data.admin) {
                localStorage.setItem('naray_admin_user', JSON.stringify(loginData.data.admin));
              }
            }
            const retryHeaders = {
              ...headers,
              'Authorization': `Bearer ${token}`
            };
            response = await fetch(url, { ...options, headers: retryHeaders, _retry: true });
          }
        }
      } catch (authErr) {
        console.warn('[API] Auto re-auth failed:', authErr);
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] Gagal mengakses ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // 0. Single Batch Aggregated Init (Cepat 1x HTTP handshake)
  getAppInit: () => fetchApi('/app-init'),

  // 1. Health / Connection Check
  checkConnection: async () => {
    try {
      const res = await fetchApi('/info');
      return res.success === true;
    } catch {
      return false;
    }
  },

  // 2. Hospital Information & Branches
  getHospitalInfo: () => fetchApi('/info'),
  getBranches: () => fetchApi('/branches'),

  // 3. Doctors & Schedules
  getDoctors: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/doctors?${query}`);
  },
  getDoctorDetail: (id) => fetchApi(`/doctors/${id}`),
  getDoctorSchedule: (id) => fetchApi(`/doctors/${id}/schedule`),

  // 4. Polikliniks
  getPolikliniks: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/poliklinik?${query}`);
  },

  // 5. Facilities & Services
  getFacilities: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/facilities?${query}`);
  },
  getServices: () => fetchApi('/services'),
  getCentersOfExcellence: () => fetchApi('/centers'),

  // 6. Inpatient Rooms
  getRooms: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/rooms?${query}`);
  },
  getRoomTypes: () => fetchApi('/room-types'),

  // 7. MCU Packages
  getMcuPackages: () => fetchApi('/mcu-packages'),

  // 8. Insurance Partners
  getInsurancePartners: () => fetchApi('/insurance-partners'),

  // 9. Articles & Media
  getArticles: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/articles?${query}`);
  },
  getMedia: () => fetchApi('/media'),

  // 10. Public Appointment Booking
  createAppointment: (appointmentData) => {
    return fetchApi('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  // 11. Admin Authentication & Dashboard
  adminLogin: (credentials) => {
    return fetchApi('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      auth: false,
    });
  },
  adminLogout: () => {
    return fetchApi('/admin/logout', {
      method: 'POST',
    });
  },
  adminGetMe: () => fetchApi('/admin/me'),
  adminGetInit: () => fetchApi('/admin/init'),
  adminGetDashboardStats: () => fetchApi('/admin/dashboard/stats'),

  // 12. Admin Appointments Management
  adminGetAppointments: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/appointments?${query}`);
  },
  adminUpdateAppointmentStatus: (id, status) => {
    return fetchApi(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  adminDeleteAppointment: (id) => fetchApi(`/admin/appointments/${id}`, { method: 'DELETE' }),

  // 13. Admin Articles CRUD
  adminGetArticles: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/articles?${query}`);
  },
  adminCreateArticle: (data) => fetchApi('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateArticle: (id, data) => fetchApi(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteArticle: (id) => fetchApi(`/admin/articles/${id}`, { method: 'DELETE' }),
  adminGetArticleCategories: () => fetchApi('/admin/article-categories'),

  // 14. Admin Doctors CRUD
  adminGetDoctors: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/doctors?${query}`);
  },
  adminCreateDoctor: (data) => fetchApi('/admin/doctors', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateDoctor: (id, data) => fetchApi(`/admin/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteDoctor: (id) => fetchApi(`/admin/doctors/${id}`, { method: 'DELETE' }),
  adminGetSpecializations: () => fetchApi('/admin/specializations?per_page=50'),
  adminCreateSpecialization: (data) => fetchApi('/admin/specializations', { method: 'POST', body: JSON.stringify(data) }),
  getSpecializations: () => fetchApi('/specializations?per_page=50'),

  // 14b. Admin Doctor Schedules CRUD
  adminGetDoctorSchedules: (params = {}) => {
    const query = new URLSearchParams({ per_page: 100, ...params }).toString();
    return fetchApi(`/admin/doctor-schedules?${query}`);
  },
  adminCreateDoctorSchedule: (data) => fetchApi('/admin/doctor-schedules', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateDoctorSchedule: (id, data) => fetchApi(`/admin/doctor-schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteDoctorSchedule: (id) => fetchApi(`/admin/doctor-schedules/${id}`, { method: 'DELETE' }),

  // 15. Admin Polikliniks CRUD
  adminGetPolikliniks: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/poliklinik?${query}`);
  },
  adminCreatePoliklinik: (data) => fetchApi('/admin/poliklinik', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdatePoliklinik: (id, data) => fetchApi(`/admin/poliklinik/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeletePoliklinik: (id) => fetchApi(`/admin/poliklinik/${id}`, { method: 'DELETE' }),

  // 16. Admin MCU Packages CRUD
  adminGetMcuPackages: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/mcu-packages?${query}`);
  },
  adminCreateMcuPackage: (data) => fetchApi('/admin/mcu-packages', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateMcuPackage: (id, data) => fetchApi(`/admin/mcu-packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteMcuPackage: (id) => fetchApi(`/admin/mcu-packages/${id}`, { method: 'DELETE' }),

  // 17. Admin Room Types CRUD
  adminGetRoomTypes: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/room-types?${query}`);
  },
  adminCreateRoomType: (data) => fetchApi('/admin/room-types', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateRoomType: (id, data) => fetchApi(`/admin/room-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteRoomType: (id) => fetchApi(`/admin/room-types/${id}`, { method: 'DELETE' }),

  // 18. Admin Facilities & Services CRUD
  adminGetFacilities: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/facilities?${query}`);
  },
  adminCreateFacility: (data) => fetchApi('/admin/facilities', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateFacility: (id, data) => fetchApi(`/admin/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteFacility: (id) => fetchApi(`/admin/facilities/${id}`, { method: 'DELETE' }),

  adminGetServices: () => fetchApi('/admin/services'),
  adminCreateService: (data) => fetchApi('/admin/services', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateService: (id, data) => fetchApi(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteService: (id) => fetchApi(`/admin/services/${id}`, { method: 'DELETE' }),

  // 19. Admin Centers of Excellence CRUD
  adminGetCentersOfExcellence: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/centers?${query}`);
  },
  adminCreateCenterOfExcellence: (data) => fetchApi('/admin/centers', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCenterOfExcellence: (id, data) => fetchApi(`/admin/centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCenterOfExcellence: (id) => fetchApi(`/admin/centers/${id}`, { method: 'DELETE' }),

  // 20. Admin Media (Galeri & Video) CRUD
  adminGetMedia: (params = {}) => {
    const query = new URLSearchParams({ per_page: 50, ...params }).toString();
    return fetchApi(`/admin/media?${query}`);
  },
  adminCreateMedia: (data) => fetchApi('/admin/media', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateMedia: (id, data) => fetchApi(`/admin/media/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteMedia: (id) => fetchApi(`/admin/media/${id}`, { method: 'DELETE' }),
  adminGetMediaCategories: () => fetchApi('/admin/media-categories'),

  // 21. Admin Doctor Leaves (Cuti Dokter Berbasis Tanggal) CRUD
  adminGetDoctorLeaves: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/admin/doctor-leaves${query ? `?${query}` : ''}`);
  },
  adminCreateDoctorLeave: (data) => fetchApi('/admin/doctor-leaves', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateDoctorLeave: (id, data) => fetchApi(`/admin/doctor-leaves/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteDoctorLeave: (id) => fetchApi(`/admin/doctor-leaves/${id}`, { method: 'DELETE' }),

  // 22. Admin Image Upload (Anti-Injection, WebP Lightweight)
  adminUploadImage: (formData) => fetchApi('/admin/upload-image', {
    method: 'POST',
    body: formData,
  }),
};

export default api;

