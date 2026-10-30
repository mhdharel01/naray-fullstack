<?php

use Illuminate\Support\Facades\Route;

// ============================================================
// AUTH
// ============================================================

use App\Http\Controllers\AdminAuthController;

// ============================================================
// PUBLIC CONTROLLERS
// ============================================================

use App\Http\Controllers\Api\HospitalInfoController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\PoliklinikController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\CenterOfExcellenceController;
use App\Http\Controllers\Api\McuPackageController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\InsurancePartnerController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\SpecializationController;
use App\Http\Controllers\Api\PublicAppointmentController;
use App\Http\Controllers\Api\InitController;
use App\Http\Controllers\Api\SimrsController;

// ============================================================
// ADMIN CONTROLLERS
// ============================================================

use App\Http\Controllers\Api\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Api\Admin\DoctorScheduleController as AdminDoctorScheduleController;
use App\Http\Controllers\Api\Admin\DoctorLeaveController as AdminDoctorLeaveController;
use App\Http\Controllers\Api\Admin\SpecializationController as AdminSpecializationController;
use App\Http\Controllers\Api\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\Admin\FacilityController as AdminFacilityController;
use App\Http\Controllers\Api\Admin\CenterOfExcellenceController as AdminCenterOfExcellenceController;
use App\Http\Controllers\Api\Admin\McuPackageController as AdminMcuPackageController;
use App\Http\Controllers\Api\Admin\RoomTypeController as AdminRoomTypeController;
use App\Http\Controllers\Api\Admin\RoomController as AdminRoomController;
use App\Http\Controllers\Api\Admin\RoomBookingController as AdminRoomBookingController;
use App\Http\Controllers\Api\Admin\PatientController as AdminPatientController;
use App\Http\Controllers\Api\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Api\Admin\ArticleCategoryController as AdminArticleCategoryController;
use App\Http\Controllers\Api\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Api\Admin\MediaCategoryController as AdminMediaCategoryController;
use App\Http\Controllers\Api\Admin\MediaController as AdminMediaController;
use App\Http\Controllers\Api\Admin\HospitalInfoController as AdminHospitalInfoController;
use App\Http\Controllers\Api\Admin\BranchController as AdminBranchController;
use App\Http\Controllers\Api\Admin\PoliklinikController as AdminPoliklinikController;
use App\Http\Controllers\Api\Admin\InsurancePartnerController as AdminInsurancePartnerController;
use App\Http\Controllers\Api\Admin\InitController as AdminInitController;
use App\Http\Controllers\Api\Admin\UploadController as AdminUploadController;
use App\Http\Controllers\Api\Admin\AdminUserController;


// ============================================================
// ADMIN LOGIN (Diproteksi Rate Limiter: Maksimal 5x percobaan per menit)
// ============================================================

Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');


// ============================================================
// ADMIN API
// Semua route di bawah membutuhkan authentication Sanctum
// ============================================================

Route::middleware('auth:sanctum')->group(function () {

    // --------------------------------------------------------
    // ADMIN BATCH INIT (Fast 1x Handshake for Appointments & Stats)
    // --------------------------------------------------------
    Route::get('/admin/init', [AdminInitController::class, 'index']);

    // --------------------------------------------------------
    // ADMIN AUTH
    // --------------------------------------------------------

    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/me', [AdminAuthController::class, 'me']);

    // --------------------------------------------------------
    // USER MANAGEMENT & RBAC (Role-Based Access Control)
    // --------------------------------------------------------
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::post('/admin/users', [AdminUserController::class, 'store']);
        Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
        Route::post('/admin/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
    });

    // --------------------------------------------------------
    // IMAGE UPLOAD (Secure, Anti-Injection, WebP Lightweight)
    // --------------------------------------------------------
    Route::post('/admin/upload-image', [AdminUploadController::class, 'uploadImage']);


    // --------------------------------------------------------
    // INSURANCE PARTNERS
    // --------------------------------------------------------

    Route::get('/admin/insurance-partners', [
        AdminInsurancePartnerController::class,
        'index'
    ]);

    Route::post('/admin/insurance-partners', [
        AdminInsurancePartnerController::class,
        'store'
    ]);

    Route::get('/admin/insurance-partners/{id}', [
        AdminInsurancePartnerController::class,
        'show'
    ]);

    Route::put('/admin/insurance-partners/{id}', [
        AdminInsurancePartnerController::class,
        'update'
    ]);

    Route::delete('/admin/insurance-partners/{id}', [
        AdminInsurancePartnerController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // DOCTOR SCHEDULES
    // --------------------------------------------------------

    Route::get('/admin/doctor-schedules', [
        AdminDoctorScheduleController::class,
        'index'
    ]);

    Route::post('/admin/doctor-schedules', [
        AdminDoctorScheduleController::class,
        'store'
    ]);

    Route::get('/admin/doctor-schedules/{id}', [
        AdminDoctorScheduleController::class,
        'show'
    ]);

    Route::put('/admin/doctor-schedules/{id}', [
        AdminDoctorScheduleController::class,
        'update'
    ]);

    Route::delete('/admin/doctor-schedules/{id}', [
        AdminDoctorScheduleController::class,
        'destroy'
    ]);

    // --------------------------------------------------------
    // DOCTOR LEAVES (CUTI DOKTER)
    // --------------------------------------------------------

    Route::get('/admin/doctor-leaves', [
        AdminDoctorLeaveController::class,
        'index'
    ]);

    Route::post('/admin/doctor-leaves', [
        AdminDoctorLeaveController::class,
        'store'
    ]);

    Route::get('/admin/doctor-leaves/{id}', [
        AdminDoctorLeaveController::class,
        'show'
    ]);

    Route::put('/admin/doctor-leaves/{id}', [
        AdminDoctorLeaveController::class,
        'update'
    ]);

    Route::delete('/admin/doctor-leaves/{id}', [
        AdminDoctorLeaveController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // POLIKLINIK
    // --------------------------------------------------------

    Route::get('/admin/poliklinik', [
        AdminPoliklinikController::class,
        'index'
    ]);

    Route::post('/admin/poliklinik', [
        AdminPoliklinikController::class,
        'store'
    ]);

    Route::get('/admin/poliklinik/{id}', [
        AdminPoliklinikController::class,
        'show'
    ]);

    Route::put('/admin/poliklinik/{id}', [
        AdminPoliklinikController::class,
        'update'
    ]);

    Route::delete('/admin/poliklinik/{id}', [
        AdminPoliklinikController::class,
        'destroy'
    ]);

    Route::post('/admin/poliklinik/sync-simrs', [
        AdminPoliklinikController::class,
        'syncFromSimrs'
    ]);

    Route::post('/admin/poliklinik/clean-stale', [
        AdminPoliklinikController::class,
        'cleanStale'
    ]);


    // --------------------------------------------------------
    // BRANCHES
    // --------------------------------------------------------

    Route::get('/admin/branches', [
        AdminBranchController::class,
        'index'
    ]);

    Route::post('/admin/branches', [
        AdminBranchController::class,
        'store'
    ]);

    Route::get('/admin/branches/{id}', [
        AdminBranchController::class,
        'show'
    ]);

    Route::put('/admin/branches/{id}', [
        AdminBranchController::class,
        'update'
    ]);

    Route::delete('/admin/branches/{id}', [
        AdminBranchController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // HOSPITAL INFO
    // --------------------------------------------------------

    Route::get('/admin/info', [
        AdminHospitalInfoController::class,
        'index'
    ]);

    Route::post('/admin/info', [
        AdminHospitalInfoController::class,
        'store'
    ]);

    Route::get('/admin/info/{id}', [
        AdminHospitalInfoController::class,
        'show'
    ]);

    Route::put('/admin/info/{id}', [
        AdminHospitalInfoController::class,
        'update'
    ]);

    Route::delete('/admin/info/{id}', [
        AdminHospitalInfoController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // MEDIA
    // --------------------------------------------------------

    Route::get('/admin/media', [
        AdminMediaController::class,
        'index'
    ]);

    Route::post('/admin/media', [
        AdminMediaController::class,
        'store'
    ]);

    Route::get('/admin/media/{id}', [
        AdminMediaController::class,
        'show'
    ]);

    Route::put('/admin/media/{id}', [
        AdminMediaController::class,
        'update'
    ]);

    Route::delete('/admin/media/{id}', [
        AdminMediaController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // MEDIA CATEGORIES
    // --------------------------------------------------------

    Route::get('/admin/media-categories', [
        AdminMediaCategoryController::class,
        'index'
    ]);

    Route::post('/admin/media-categories', [
        AdminMediaCategoryController::class,
        'store'
    ]);

    Route::get('/admin/media-categories/{id}', [
        AdminMediaCategoryController::class,
        'show'
    ]);

    Route::put('/admin/media-categories/{id}', [
        AdminMediaCategoryController::class,
        'update'
    ]);

    Route::delete('/admin/media-categories/{id}', [
        AdminMediaCategoryController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // ARTICLES
    // --------------------------------------------------------

    Route::get('/admin/articles', [
        AdminArticleController::class,
        'index'
    ]);

    Route::post('/admin/articles', [
        AdminArticleController::class,
        'store'
    ]);

    Route::get('/admin/articles/{id}', [
        AdminArticleController::class,
        'show'
    ]);

    Route::put('/admin/articles/{id}', [
        AdminArticleController::class,
        'update'
    ]);

    Route::delete('/admin/articles/{id}', [
        AdminArticleController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // APPOINTMENTS
    // --------------------------------------------------------

    Route::get('/admin/appointments', [
        AdminAppointmentController::class,
        'index'
    ]);

    Route::post('/admin/appointments', [
        AdminAppointmentController::class,
        'store'
    ]);

    Route::get('/admin/appointments/{id}', [
        AdminAppointmentController::class,
        'show'
    ]);

    Route::put('/admin/appointments/{id}', [
        AdminAppointmentController::class,
        'update'
    ]);

    Route::patch('/admin/appointments/{id}/status', [
        AdminAppointmentController::class,
        'updateStatus'
    ]);

    Route::delete('/admin/appointments/{id}', [
        AdminAppointmentController::class,
        'destroy'
    ]);

    Route::get('/admin/dashboard/stats', [
        AdminAppointmentController::class,
        'dashboardStats'
    ]);


    // --------------------------------------------------------
    // PATIENTS
    // --------------------------------------------------------

    Route::get('/admin/patients', [
        AdminPatientController::class,
        'index'
    ]);

    Route::post('/admin/patients', [
        AdminPatientController::class,
        'store'
    ]);

    Route::get('/admin/patients/{id}', [
        AdminPatientController::class,
        'show'
    ]);

    Route::put('/admin/patients/{id}', [
        AdminPatientController::class,
        'update'
    ]);

    Route::delete('/admin/patients/{id}', [
        AdminPatientController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // ROOM BOOKINGS
    // --------------------------------------------------------

    Route::get('/admin/room-bookings', [
        AdminRoomBookingController::class,
        'index'
    ]);

    Route::post('/admin/room-bookings', [
        AdminRoomBookingController::class,
        'store'
    ]);

    Route::get('/admin/room-bookings/{id}', [
        AdminRoomBookingController::class,
        'show'
    ]);

    Route::put('/admin/room-bookings/{id}', [
        AdminRoomBookingController::class,
        'update'
    ]);

    Route::delete('/admin/room-bookings/{id}', [
        AdminRoomBookingController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // ROOMS
    // --------------------------------------------------------

    Route::get('/admin/rooms', [
        AdminRoomController::class,
        'index'
    ]);

    Route::post('/admin/rooms', [
        AdminRoomController::class,
        'store'
    ]);

    Route::get('/admin/rooms/{id}', [
        AdminRoomController::class,
        'show'
    ]);

    Route::put('/admin/rooms/{id}', [
        AdminRoomController::class,
        'update'
    ]);

    Route::delete('/admin/rooms/{id}', [
        AdminRoomController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // ROOM FACILITIES
    // --------------------------------------------------------

    Route::get('/admin/rooms/{id}/facilities', [
        AdminRoomController::class,
        'facilities'
    ]);

    Route::post('/admin/rooms/{id}/facilities', [
        AdminRoomController::class,
        'syncFacilities'
    ]);

    Route::delete('/admin/rooms/{id}/facilities/{facilityId}', [
        AdminRoomController::class,
        'removeFacility'
    ]);


    // --------------------------------------------------------
    // ROOM TYPES
    // --------------------------------------------------------

    Route::get('/admin/room-types', [
        AdminRoomTypeController::class,
        'index'
    ]);

    Route::post('/admin/room-types', [
        AdminRoomTypeController::class,
        'store'
    ]);

    Route::get('/admin/room-types/{id}', [
        AdminRoomTypeController::class,
        'show'
    ]);

    Route::put('/admin/room-types/{id}', [
        AdminRoomTypeController::class,
        'update'
    ]);

    Route::delete('/admin/room-types/{id}', [
        AdminRoomTypeController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // MCU PACKAGES
    // --------------------------------------------------------

    Route::get('/admin/mcu-packages', [
        AdminMcuPackageController::class,
        'index'
    ]);

    Route::post('/admin/mcu-packages', [
        AdminMcuPackageController::class,
        'store'
    ]);

    Route::get('/admin/mcu-packages/{id}', [
        AdminMcuPackageController::class,
        'show'
    ]);

    Route::put('/admin/mcu-packages/{id}', [
        AdminMcuPackageController::class,
        'update'
    ]);

    Route::delete('/admin/mcu-packages/{id}', [
        AdminMcuPackageController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // CENTERS OF EXCELLENCE
    // --------------------------------------------------------

    Route::get('/admin/centers', [
        AdminCenterOfExcellenceController::class,
        'index'
    ]);

    Route::post('/admin/centers', [
        AdminCenterOfExcellenceController::class,
        'store'
    ]);

    Route::get('/admin/centers/{id}', [
        AdminCenterOfExcellenceController::class,
        'show'
    ]);

    Route::put('/admin/centers/{id}', [
        AdminCenterOfExcellenceController::class,
        'update'
    ]);

    Route::delete('/admin/centers/{id}', [
        AdminCenterOfExcellenceController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // FACILITIES
    // --------------------------------------------------------

    Route::get('/admin/facilities', [
        AdminFacilityController::class,
        'index'
    ]);

    Route::post('/admin/facilities', [
        AdminFacilityController::class,
        'store'
    ]);

    Route::get('/admin/facilities/{id}', [
        AdminFacilityController::class,
        'show'
    ]);

    Route::put('/admin/facilities/{id}', [
        AdminFacilityController::class,
        'update'
    ]);

    Route::delete('/admin/facilities/{id}', [
        AdminFacilityController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // ARTICLE CATEGORIES
    // --------------------------------------------------------

    Route::get('/admin/article-categories', [
        AdminArticleCategoryController::class,
        'index'
    ]);

    Route::post('/admin/article-categories', [
        AdminArticleCategoryController::class,
        'store'
    ]);

    Route::get('/admin/article-categories/{id}', [
        AdminArticleCategoryController::class,
        'show'
    ]);

    Route::put('/admin/article-categories/{id}', [
        AdminArticleCategoryController::class,
        'update'
    ]);

    Route::delete('/admin/article-categories/{id}', [
        AdminArticleCategoryController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // SERVICES
    // --------------------------------------------------------

    Route::get('/admin/services', [
        AdminServiceController::class,
        'index'
    ]);

    Route::post('/admin/services', [
        AdminServiceController::class,
        'store'
    ]);

    Route::get('/admin/services/{id}', [
        AdminServiceController::class,
        'show'
    ]);

    Route::put('/admin/services/{id}', [
        AdminServiceController::class,
        'update'
    ]);

    Route::delete('/admin/services/{id}', [
        AdminServiceController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // SPECIALIZATIONS
    // --------------------------------------------------------

    Route::get('/admin/specializations', [
        AdminSpecializationController::class,
        'index'
    ]);

    Route::post('/admin/specializations', [
        AdminSpecializationController::class,
        'store'
    ]);

    Route::get('/admin/specializations/{id}', [
        AdminSpecializationController::class,
        'show'
    ]);

    Route::put('/admin/specializations/{id}', [
        AdminSpecializationController::class,
        'update'
    ]);

    Route::delete('/admin/specializations/{id}', [
        AdminSpecializationController::class,
        'destroy'
    ]);


    // --------------------------------------------------------
    // DOCTORS
    // --------------------------------------------------------

    Route::get('/admin/doctors', [
        AdminDoctorController::class,
        'index'
    ]);

    Route::post('/admin/doctors', [
        AdminDoctorController::class,
        'store'
    ]);

    Route::get('/admin/doctors/{id}', [
        AdminDoctorController::class,
        'show'
    ]);

    Route::put('/admin/doctors/{id}', [
        AdminDoctorController::class,
        'update'
    ]);

    Route::delete('/admin/doctors/{id}', [
        AdminDoctorController::class,
        'destroy'
    ]);

});


// ============================================================
// PUBLIC API
// ============================================================

// Hospital Information
Route::get('/info', [
    HospitalInfoController::class,
    'index'
]);

// Branches
Route::get('/branches', [
    BranchController::class,
    'index'
]);

// Specializations
Route::get('/specializations', [
    SpecializationController::class,
    'index'
]);

// Doctors
Route::get('/doctors', [
    DoctorController::class,
    'index'
]);

Route::get('/doctors/{id}', [
    DoctorController::class,
    'show'
]);

Route::get('/doctors/{id}/schedule', [
    DoctorController::class,
    'schedule'
]);

// Poliklinik
Route::get('/poliklinik', [
    PoliklinikController::class,
    'index'
]);

// Services
Route::get('/services', [
    ServiceController::class,
    'index'
]);

// Facilities
Route::get('/facilities', [
    FacilityController::class,
    'index'
]);

// Centers of Excellence
Route::get('/centers', [
    CenterOfExcellenceController::class,
    'index'
]);

// MCU Packages
Route::get('/mcu-packages', [
    McuPackageController::class,
    'index'
]);

// Room Types
Route::get('/room-types', [
    RoomController::class,
    'roomTypes'
]);

// Rooms
Route::get('/rooms', [
    RoomController::class,
    'index'
]);

// SIMRS Dekago Live Feeds
Route::get('/kamar/persediaan', [
    SimrsController::class,
    'beds'
]);

Route::get('/ruangan/operasi', [
    SimrsController::class,
    'surgeries'
]);

Route::get('/jadwal-dokter', [
    SimrsController::class,
    'doctorSchedules'
]);


// Insurance Partners
Route::get('/insurance-partners', [
    InsurancePartnerController::class,
    'index'
]);

// Articles
Route::get('/articles', [
    ArticleController::class,
    'index'
]);

Route::get('/articles/{id}', [
    ArticleController::class,
    'show'
]);

// Media
Route::get('/media', [
    MediaController::class,
    'index'
]);

Route::get('/media-categories', [
    MediaController::class,
    'categories'
]);

// Single Batch Init Endpoint (Cepat, 1 Request Gabungan)
Route::get('/app-init', [
    InitController::class,
    'index'
]);

// Public Appointment Booking
Route::post('/appointments', [
    PublicAppointmentController::class,
    'store'
]);

// SIMRS Feed Endpoints
Route::get('/kamar/persediaan', [SimrsController::class, 'beds']);
Route::get('/ruangan/operasi', [SimrsController::class, 'surgeries']);
Route::get('/jadwal-dokter-simrs', [SimrsController::class, 'doctorSchedules']);