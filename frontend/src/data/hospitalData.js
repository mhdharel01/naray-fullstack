// Data Autentik Naray Hospital
// Sumber: https://narayhospital.com/ (Dipadukan dengan Desain Premium Kelas Dunia ala RS Pondok Indah)

export const hospitalInfo = {
  name: "Naray Hospital",
  tagline: "Serve With Heart",
  subTagline: "Rumah Sakit Modern, Nyaman & Terpercaya di Kota Dumai, Riau",
  aboutText: "Naray Hospital adalah simbol dedikasi, inovasi, dan kepercayaan dalam layanan kesehatan modern. Dilengkapi dengan fasilitas medis terdepan, tim dokter spesialis berpengalaman, dan teknologi diagnostik mutakhir, kami menghadirkan pengalaman perawatan yang personal, profesional, dan terukur. Kami melayani dengan presisi klinis dan sentuhan kemanusiaan, melalui jaringan poliklinik spesialis yang dirancang untuk memenuhi berbagai kebutuhan medis Anda — dari pencegahan hingga pemulihan.",
  accreditation: "Akreditasi Paripurna Kemenkes RI & Pelayanan Standar Nasional",
  emergencyHotline: "+62 853-6339-5383",
  ambulanceHotline: "+62 853-6339-5383",
  callCenter: "+62 811-7529-798",
  whatsappHotline: "+62 811-7529-798",
  whatsapp: "628117529798",
  phone: "+62 811-7529-798",
  whatsappDisplay: "+62 811-7529-798",
  mcuHotline: "+62 853-6362-4796",
  mcuWhatsapp: "6285363624796",
  email: "kawannaray@narayhospital.com",
  address: "Jl. Dr. Wahidin No.98-99, Purnama, Kec. Dumai Barat, Kota Dumai, Riau 28823",
  operatingHours: "IGD & Rawat Inap 24 Jam | Poliklinik Spesialis: Senin - Sabtu 09:00 - 21:00 WIB",
  vision: "Menjadi Rumah Sakit Terpercaya dalam Pelayanan Kesehatan di Kota Dumai",
  mission: [
    "Melayani dengan Sepenuh Hati",
    "Menyediakan Sumber Daya Manusia yang Profesional",
    "Mewujudkan Pelayanan Kesehatan Bermutu Berbasis Teknologi Digital"
  ],
  totalBeds: "104 Tempat Tidur",
  totalDoctors: "30+ Dokter Spesialis",
  totalPolis: "13 Poliklinik Terpadu",
  instagram: "https://www.instagram.com/narayhospital",
  youtube: "https://www.youtube.com/@NarayHospital",
  gmapsIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.0645585284587!2d101.39689867423775!3d1.6988783603561073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d3a978dfcdb1fb%3A0xeffaf38f1dce7e9c!2sNaray%20Hospital!5e0!3m2!1sen!2sid!4v1749523003379!5m2!1sen!2sid"
};

export const branches = [
  {
    id: "naray-dumai-utama",
    name: "Naray Hospital Dumai (Gedung Utama)",
    location: "Dumai Barat, Riau",
    address: "Jl. Dr. Wahidin No.98-99, Purnama, Kec. Dumai Barat, Kota Dumai, Riau 28823",
    phone: "+62 811-7529-798",
    emergencyPhone: "+62 853-6339-5383",
    whatsapp: "+62 811-7529-798",
    beds: "101 Tempat Tidur",
    image: '/images/default-image.svg',
    features: ["Layanan Gawat Darurat & UGD 24 Jam", "13 Poliklinik Dokter Spesialis", "Ruang Perawatan VIP Pistillum & ICU Staments", "Layanan Geriatri & MCU Komprehensif"],
    mapCoords: { lat: 1.698878, lng: 101.396898 }
  },
  {
    id: "naray-mcu-center",
    name: "Naray Wellness & Medical Check-Up Hub",
    location: "Purnama, Dumai",
    address: "Kawasan Layanan Terpadu Naray Hospital, Jl. Dr. Wahidin No.99, Dumai",
    phone: "+62 853-6362-4796",
    emergencyPhone: "+62 853-6339-5383",
    whatsapp: "+62 853-6362-4796",
    beds: "Fasilitas One-Day Care",
    image: '/images/default-image.svg',
    features: ["Skrining Kesehatan Korporasi & Pribadi", "Laboratorium Otomasi & Radiologi", "Konsultasi Dokter Spesialis Terpadu"],
    mapCoords: { lat: 1.698878, lng: 101.396898 }
  }
];

export const poliklinikList = [
  { id: "poli-umum", name: "Poliklinik Umum", icon: "🩺", desc: "Layanan diagnostik dan pengobatan pertama untuk keluhan kesehatan umum." },
  { id: "poli-anak", name: "Poliklinik Anak (Pediatrik)", icon: "👶", desc: "Perawatan komprehensif kesehatan bayi dan anak, imunisasi, dan pemantauan tumbuh kembang." },
  { id: "poli-obgyn", name: "Poliklinik Obgyn (Kebidanan & Kandungan)", icon: "🤰", desc: "Pemeriksaan kehamilan, USG 4D, persalinan, dan kesehatan reproduksi wanita." },
  { id: "poli-penyakit-dalam", name: "Poliklinik Penyakit Dalam", icon: "🧬", desc: "Diagnosis dan penanganan penyakit organ dalam seperti diabetes, hipertensi, hati, dan ginjal." },
  { id: "poli-jantung", name: "Poliklinik Jantung & Pembuluh Darah", icon: "❤️", desc: "Pemeriksaan fungsi jantung, EKG, treadmill, dan pencegahan risiko kardiovaskular." },
  { id: "poli-bedah", name: "Poliklinik Bedah", icon: "⚕️", desc: "Layanan konsultasi dan tindakan bedah umum serta bedah khusus berpengalaman." },
  { id: "poli-mata", name: "Poliklinik Mata", icon: "👁️", desc: "Pemeriksaan kesehatan penglihatan, skrining katarak, glaukoma, dan gangguan refraksi." },
  { id: "poli-gigi", name: "Poliklinik Gigi & Bedah Mulut", icon: "😁", desc: "Perawatan gigi, tambal, scalling, pencabutan gigi impaksi, dan estetika senyum." },
  { id: "poli-tht", name: "Poliklinik THT-KL", icon: "👂", desc: "Penanganan gangguan pendengaran, sinus, amandel, dan saluran pernapasan atas." },
  { id: "poli-paru", name: "Poliklinik Paru & Pernapasan", icon: "🫁", desc: "Pemeriksaan asma, PPOK, infeksi paru, dan spirometri kesehatan pernapasan." },
  { id: "poli-dve", name: "Poliklinik Kulit & Kelamin (D.V.E)", icon: "🌟", desc: "Perawatan penyakit kulit klinis, alergi, jerawat, dan estetika medis." },
  { id: "poli-saraf", name: "Poliklinik Saraf (Neurologi)", icon: "⚡", desc: "Penanganan stroke, vertigo, migrain, nyeri saraf terjepit, dan gangguan saraf." },
  { id: "poli-psikiatri", name: "Poliklinik Psikiatri (Kesehatan Jiwa)", icon: "🧠", desc: "Konsultasi kesehatan mental, penanganan kecemasan, depresi, dan terapi psikologis." }
];

export const centersOfExcellence = [
  {
    id: "center-jantung",
    title: "Pusat Jantung & Kardiovaskular",
    shortTitle: "Pusat Jantung",
    icon: "HeartPulse",
    tagline: "Pemeriksaan Jantung Komprehensif & Deteksi Dini Penyakit Jantung Koroner",
    description: "Didukung oleh dokter spesialis jantung dan pembuluh darah dengan peralatan diagnostik EKG 12-Lead, Ekokardiografi, dan Treadmill Stress Test untuk penanganan preventif dan kuratif.",
    image: '/images/discovery/diagnostic-center.jpg',
    stats: "Siaga Pemeriksaan Jantung",
    technologies: ["Ekokardiografi Doppler", "Treadmill Stress Test", "Resting ECG 12-Lead", "Laboratorium Enzim Jantung"],
    services: [
      "Konsultasi Spesialis Jantung (dr. Christian Yosaputra, Sp.JP, FIHA)",
      "Skrining Risiko Serangan Jantung & Aritmia",
      "Pemeriksaan Ekokardiografi Struktur Katup Jantung",
      "Edukasi Pola Hidup Sehat Pasca Gangguan Jantung"
    ],
    doctorsCount: 1
  },
  {
    id: "center-ibu-anak",
    title: "Pusat Kesehatan Ibu & Anak Terpadu",
    shortTitle: "Ibu & Anak",
    icon: "Baby",
    tagline: "Pelayanan Kebidanan, Kandungan, dan Tumbuh Kembang Anak Penuh Kasih",
    description: "Menyediakan layanan persalinan yang aman dan nyaman, pemeriksaan USG kehamilan, klinik anak ramah anak, imunisasi lengkap, serta penanganan penyakit anak terpadu.",
    image: '/images/discovery/vip-room.jpg',
    stats: "Kamar Bersalin & Perinatologi Siaga",
    technologies: ["USG Kandungan 4D Real-Time", "Inkubator Bayi Perinatologi", "Phototherapy Unit", "Kamar Rawat Ibu & Anak"],
    services: [
      "Pemeriksaan Kehamilan & Persalinan (dr. Sofyan Qadri Rozi Dalmunthe, Sp.OG)",
      "Klinik Spesialis Anak (dr. Sukamto, Sp. A & dr. Indah Khairani Nasution, Sp.A)",
      "Imunisasi Dasar & Lanjutan Lengkap",
      "Skrining Tumbuh Kembang & Gizi Balita"
    ],
    doctorsCount: 3
  },
  {
    id: "center-penyakit-dalam",
    title: "Pusat Penyakit Dalam & Geriatri",
    shortTitle: "Penyakit Dalam & Geriatri",
    icon: "Activity",
    tagline: "Penanganan Penyakit Metabolik Kronik & Pelayanan Pasien Lanjut Usia",
    description: "Fokus pada pengelolaan penyakit metabolik menahun seperti diabetes melitus, hipertensi, gangguan ginjal, dan pencernaan, dilengkapi program khusus pelayanan lansia (Geriatri).",
    image: '/images/discovery/mcu-lab.jpg',
    stats: "Layanan Pasien Geriatri Unggulan",
    technologies: ["Digital Automated Laboratory", "USG Abdomen", "Monitoring Gula Darah Terpadu", "Unit Fisioterapi"],
    services: [
      "Konsultasi Spesialis Penyakit Dalam (dr. Doni Saputra, Sp.PD, dr. Paishal Mizan, Sp.PD, dr. Murdia, Sp.PD)",
      "Klinik Layanan Geriatri Pasien Usia Lanjut",
      "Manajemen Diabetes & Hipertensi Terkontrol",
      "Pemeriksaan Kesehatan Saluran Cerna & Hati"
    ],
    doctorsCount: 3
  },
  {
    id: "center-bedah-trauma",
    title: "Pusat Bedah & Layanan UGD 24 Jam",
    shortTitle: "Bedah & UGD 24 Jam",
    icon: "ShieldAlert",
    tagline: "Respon Cepat Gawat Darurat & Kamar Operasi Berstandar Sterilisasi Tinggi",
    description: "Unit Gawat Darurat 24 jam dengan tim dokter siaga didukung kamar bedah modern untuk menangani kasus bedah umum, bedah ortopedi, bedah mulut traumatik, serta cedera kecelakaan.",
    image: '/images/centers/HFWDjPiKyEsJ3BXJrNZaluU2BKSLyIBRKadfNUfu.webp',
    stats: "Siaga Darurat 24 Jam",
    technologies: ["Kamar Operasi Steril HEPA", "Armada Ambulans Darurat", "Peralatan Resusitasi UGD", "Sistem Monitoring Pasien"],
    services: [
      "Penanganan Emergency 24 Jam (dr. Siti Asri Yolanda)",
      "Bedah Umum (dr. Dharma Yogara, Sp.B & dr. Indra Yudhika, Sp.B)",
      "Bedah Orthopedi & Traumatologi (dr. Ghozi Natul Isral, Sp.Ort. Tr.)",
      "Bedah Mulut & Maksilofasial (drg. Depsi Indri Papilaya Simanjuntak, Sp.B.M.M)"
    ],
    doctorsCount: 5
  },
  {
    id: "center-paru-pernapasan",
    title: "Pusat Paru & Kesehatan Pernapasan",
    shortTitle: "Paru & Pernapasan",
    icon: "Stethoscope",
    tagline: "Diagnostik & Terapi Penyakit Saluran Pernapasan Menyeluruh",
    description: "Pelayanan terpadu untuk asma, penyakit paru obstruktif kronik (PPOK), pneumonia, dan skrining kesehatan pernapasan oleh tim dokter spesialis paru berpengalaman.",
    image: '/images/rooms/room-isolation.jpg',
    stats: "Klinik Paru Modern",
    technologies: ["Nebulizer Room", "Spirometri Uji Fungsi Paru", "Rontgen Dada Digital", "Ruang Rawat Isolasi Bertekanan"],
    services: [
      "Konsultasi Spesialis Pulmonologi & Paru (dr. Atikanur, Sp.P & dr. Mohd. Syahbani Nugraha, SP.P)",
      "Penanganan Asma & Sesak Napas Akut",
      "Pemeriksaan Rontgen Thorax & Uji Dahak",
      "Ruang Rawat Isolasi Khusus Berstandar Hepafilter"
    ],
    doctorsCount: 2
  },
  {
    id: "center-mata-tht",
    title: "Pusat Mata, THT & Panca Indera",
    shortTitle: "Mata & THT",
    icon: "Brain",
    tagline: "Perawatan Presisi untuk Penglihatan Tajam & Pendengaran Optimal",
    description: "Menghadirkan klinik spesialis mata dan spesialis THT-KL dengan peralatan diagnostik optik modern untuk menjaga kualitas indera penglihatan dan pendengaran Anda.",
    image: '/images/facilities/qrtzH6LJYIvtTWhscnddrh7F9pZBM2mH1hDYDQ2f.webp',
    stats: "Peralatan Optik & Endoskopi THT",
    technologies: ["Slit Lamp Biomicroscope", "Autorefraktometer", "Endoskopi THT-KL", "Audiometri Skrining Pendengaran"],
    services: [
      "Klinik Spesialis Mata (dr. Ahmad Musa, Sp.M)",
      "Klinik Spesialis THT-KL (dr. Diflayzer, Sp.THT-KL)",
      "Pemeriksaan Tajam Penglihatan & Tekanan Bola Mata",
      "Pembersihan Serumen & Terapi Infeksi Saluran Telinga"
    ],
    doctorsCount: 2
  }
];

export const doctors = [
  {
    id: "dr-siti-asri-yolanda",
    name: "dr. Siti Asri Yolanda",
    specialty: "Dokter Umum & Dokter Jaga IGD",
    specialtyGroup: "UGD & Dokter Umum",
    subSpecialty: "Penanganan Kegawatdaruratan Medis, Triase UGD, Konsultasi Umum",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Siaga UGD",
    education: "Fakultas Kedokteran | Sertifikasi ACLS & ATLS Emergency Medicine",
    rating: 4.9,
    reviewCount: 185,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    schedules: [
      { day: "Senin - Minggu", time: "Siaga 24 Jam Bergilir", room: "Unit Gawat Darurat (UGD) Naray" }
    ],
    bio: "dr. Siti Asri Yolanda adalah dokter jaga UGD Naray Hospital yang berdedikasi melayani pertolongan pertama pasien gawat darurat dengan cepat, tepat, dan penuh empati."
  },
  {
    id: "dr-rizka-nadia",
    name: "dr. Rizka Nadia, Sp.PD",
    specialty: "Spesialis Penyakit Dalam",
    specialtyGroup: "Penyakit Dalam",
    subSpecialty: "Diabetes Melitus, Hipertensi, Gangguan Lambung & Hati, Penyakit Infeksi",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Penyakit Dalam",
    education: "Universitas Negeri Terkemuka | Spesialis Penyakit Dalam (Sp.PD)",
    rating: 5.0,
    reviewCount: 240,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Selasa", "Kamis", "Jumat"],
    schedules: [
      { day: "Senin", time: "09:00 - 12:00 WIB", room: "Poliklinik Penyakit Dalam, R. 102" },
      { day: "Kamis", time: "09:00 - 12:00 WIB", room: "Poliklinik Penyakit Dalam, R. 102" },
      { day: "Jumat", time: "14:00 - 18:00 WIB", room: "Poliklinik Penyakit Dalam, R. 102" }
    ],
    bio: "dr. Rizka Nadia adalah spesialis penyakit dalam yang berfokus pada manajemen penyakit kronis dan perawatan holistik organ dalam pasien."
  },
  {
    id: "drg-dwi-astari-yahfis",
    name: "drg. Dwi Astari Yahfis",
    specialty: "Dokter Gigi Umum & Estetika",
    specialtyGroup: "Gigi & Mulut",
    subSpecialty: "Pembersihan Karang Gigi (Scalling), Tambal Gigi, Estetika Gigi",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Gigi Profesional",
    education: "Fakultas Kedokteran Gigi | Sertifikasi Perawatan Gigi Modern",
    rating: 4.9,
    reviewCount: 198,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Rabu", "Kamis", "Sabtu"],
    schedules: [
      { day: "Senin", time: "09:00 - 14:00 WIB", room: "Poliklinik Gigi, R. 105" },
      { day: "Kamis", time: "09:00 - 14:00 WIB", room: "Poliklinik Gigi, R. 105" },
      { day: "Sabtu", time: "09:00 - 13:00 WIB", room: "Poliklinik Gigi, R. 105" }
    ],
    bio: "drg. Dwi Astari memberikan perawatan gigi yang ramah dan nyaman untuk seluruh anggota keluarga, mulai dari anak-anak hingga dewasa."
  },
  {
    id: "dr-jemmy-fandri",
    name: "dr. Jemmy Fandri, Sp.P",
    specialty: "Spesialis Paru & Pernapasan",
    specialtyGroup: "Paru & Pernapasan",
    subSpecialty: "Asma, PPOK, Infeksi Paru, Tuberkulosis, Skrining Paru",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Paru Senior",
    education: "Pendidikan Dokter Spesialis Paru (Sp.P)",
    rating: 4.9,
    reviewCount: 215,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Rabu", "Jumat"],
    schedules: [
      { day: "Senin", time: "10:00 - 14:00 WIB", room: "Poliklinik Paru, R. 108" },
      { day: "Rabu", time: "14:00 - 18:00 WIB", room: "Poliklinik Paru, R. 108" },
      { day: "Jumat", time: "09:00 - 13:00 WIB", room: "Poliklinik Paru, R. 108" }
    ],
    bio: "Pakar kesehatan pernapasan yang menangani berbagai keluhan sesak napas, batuk kronis, dan gangguan fungsi paru."
  },
  {
    id: "dr-jefrizal-wirman",
    name: "dr. Jefrizal Wirman, Sp.D.V.E",
    specialty: "Spesialis Dermatologi, Venereologi & Estetika",
    specialtyGroup: "Kulit & Kelamin",
    subSpecialty: "Penyakit Kulit Klinis, Dermatologi Alergi, Anti-Aging & Estetika",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Kulit & Kelamin",
    education: "Spesialis Dermatologi & Venereologi (Sp.D.V.E)",
    rating: 4.9,
    reviewCount: 260,
    photo: '/images/default-doctor.svg',
    availableDays: ["Selasa", "Kamis", "Sabtu"],
    schedules: [
      { day: "Selasa", time: "10:00 - 15:00 WIB", room: "Poliklinik Kulit & Estetika, R. 201" },
      { day: "Kamis", time: "10:00 - 15:00 WIB", room: "Poliklinik Kulit & Estetika, R. 201" },
      { day: "Sabtu", time: "09:00 - 14:00 WIB", room: "Poliklinik Kulit & Estetika, R. 201" }
    ],
    bio: "Melayani perawatan kesehatan kulit secara menyeluruh dengan pendekatan medis terpercaya untuk hasil sehat alami."
  },
  {
    id: "dr-diflayzer",
    name: "dr. Diflayzer, Sp.THT-KL",
    specialty: "Spesialis Telinga Hidung Tenggorok - Bedah Kepala Leher",
    specialtyGroup: "THT-KL",
    subSpecialty: "Endoskopi THT, Gangguan Pendengaran, Sinusitis, Radang Amandel",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Spesialis THT-KL Berpengalaman",
    education: "Pendidikan Dokter Spesialis THT-KL",
    rating: 4.8,
    reviewCount: 175,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Rabu", "Kamis"],
    schedules: [
      { day: "Senin", time: "13:00 - 17:00 WIB", room: "Poliklinik THT-KL, R. 106" },
      { day: "Rabu", time: "09:00 - 13:00 WIB", room: "Poliklinik THT-KL, R. 106" },
      { day: "Kamis", time: "13:00 - 17:00 WIB", room: "Poliklinik THT-KL, R. 106" }
    ],
    bio: "Pakar THT dengan keahlian diagnostik endoskopi telinga, hidung, dan tenggorokan untuk penanganan presisi."
  },
  {
    id: "dr-m-riki-fachrozi",
    name: "dr. M. Riki Fachrozi, M.Ked(Ped)., Sp.A",
    specialty: "Spesialis Anak (Pediatri)",
    specialtyGroup: "Anak & Pediatrik",
    subSpecialty: "Kesehatan Bayi & Balita, Imunisasi Anak, Infeksi Pediatrik, Tumbuh Kembang",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Anak",
    education: "Magister Kedokteran Pediatri & Dokter Spesialis Anak (Sp.A)",
    rating: 5.0,
    reviewCount: 310,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Selasa", "Rabu", "Jumat"],
    schedules: [
      { day: "Senin", time: "09:00 - 13:00 WIB", room: "Poliklinik Anak, R. 110" },
      { day: "Rabu", time: "10:00 - 15:00 WIB", room: "Poliklinik Anak, R. 110" },
      { day: "Jumat", time: "09:00 - 13:00 WIB", room: "Poliklinik Anak, R. 110" }
    ],
    bio: "dr. Riki dikenal telaten dan ramah terhadap anak, mendampingi orang tua menjaga kesehatan optimal si kecil."
  },
  {
    id: "dr-ihsan",
    name: "dr. Ihsan, Sp.B",
    specialty: "Spesialis Bedah Umum",
    specialtyGroup: "Bedah",
    subSpecialty: "Bedah Saluran Cerna, Usus Buntu (Apendisitis), Hernia, Tumor Jinak Kulit",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Bedah",
    education: "Pendidikan Dokter Spesialis Bedah (Sp.B)",
    rating: 4.9,
    reviewCount: 220,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Kamis", "Sabtu"],
    schedules: [
      { day: "Senin", time: "14:00 - 18:00 WIB", room: "Poliklinik Bedah, R. 204" },
      { day: "Kamis", time: "09:00 - 13:00 WIB", room: "Poliklinik Bedah, R. 204" },
      { day: "Sabtu", time: "09:00 - 14:00 WIB", room: "Poliklinik Bedah, R. 204" }
    ],
    bio: "Spesialis bedah berpengalaman yang mengutamakan keselamatan dan teknik operasi presisi untuk masa pemulihan cepat."
  },
  {
    id: "dr-murdia",
    name: "dr. Murdia, Sp.PD",
    specialty: "Spesialis Penyakit Dalam",
    specialtyGroup: "Penyakit Dalam",
    subSpecialty: "Penyakit Dalam Umum, Hipertensi, Kolesterol, Penyakit Ginjal & Lambung",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Penyakit Dalam",
    education: "Pendidikan Dokter Spesialis Penyakit Dalam (Sp.PD)",
    rating: 4.8,
    reviewCount: 190,
    photo: '/images/default-doctor.svg',
    availableDays: ["Selasa", "Rabu", "Sabtu"],
    schedules: [
      { day: "Selasa", time: "13:00 - 17:00 WIB", room: "Poliklinik Penyakit Dalam, R. 102" },
      { day: "Rabu", time: "09:00 - 13:00 WIB", room: "Poliklinik Penyakit Dalam, R. 102" },
      { day: "Sabtu", time: "09:00 - 13:00 WIB", room: "Poliklinik Penyakit Dalam, R. 102" }
    ],
    bio: "Berpengalaman menangani berbagai keluhan penyakit dalam kronis dengan pendekatan komunikatif dan solutif."
  },
  {
    id: "dr-ahmad-musa",
    name: "dr. Ahmad Musa, Sp.M",
    specialty: "Spesialis Mata (Oftalmologi)",
    specialtyGroup: "Mata",
    subSpecialty: "Katarak, Infeksi Mata, Kelainan Refraksi Kacamata, Glaukoma",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Mata",
    education: "Pendidikan Dokter Spesialis Mata (Sp.M)",
    rating: 4.9,
    reviewCount: 165,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Selasa", "Kamis"],
    schedules: [
      { day: "Senin", time: "09:00 - 13:00 WIB", room: "Poliklinik Mata, R. 112" },
      { day: "Selasa", time: "14:00 - 18:00 WIB", room: "Poliklinik Mata, R. 112" },
      { day: "Kamis", time: "09:00 - 13:00 WIB", room: "Poliklinik Mata, R. 112" }
    ],
    bio: "Pakar kesehatan mata yang berkomitmen menjaga dan memulihkan kualitas penglihatan pasien di segala usia."
  },
  {
    id: "dr-sofyan-qadri",
    name: "dr. Sofyan Qadri Rozi Dalimunthe, Sp.OG",
    specialty: "Spesialis Kebidanan & Kandungan (Obgyn)",
    specialtyGroup: "Kebidanan & Kandungan",
    subSpecialty: "Antenatal Care (Pemeriksaan Kehamilan), Persalinan, USG 4D, Ginekologi",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Kandungan",
    education: "Pendidikan Dokter Spesialis Obstetri & Ginekologi (Sp.OG)",
    rating: 5.0,
    reviewCount: 380,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Rabu", "Jumat", "Sabtu"],
    schedules: [
      { day: "Senin", time: "10:00 - 15:00 WIB", room: "Poliklinik Obgyn, R. 202" },
      { day: "Rabu", time: "10:00 - 15:00 WIB", room: "Poliklinik Obgyn, R. 202" },
      { day: "Jumat", time: "14:00 - 19:00 WIB", room: "Poliklinik Obgyn, R. 202" }
    ],
    bio: "Mendampingi ibu dari awal masa kehamilan hingga proses persalinan dengan penuh perhatian dan rasa aman."
  },
  {
    id: "drg-depsi-indri",
    name: "drg. Depsi Indri Papilaya Simanjuntak, Sp.B.M.M",
    specialty: "Spesialis Bedah Mulut & Maksilofasial",
    specialtyGroup: "Gigi & Mulut",
    subSpecialty: "Operasi Gigi Bungsu (Odontektomi), Trauma Rahang, Kista & Tumor Mulut",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Spesialis Bedah Mulut",
    education: "Pendidikan Dokter Spesialis Bedah Mulut & Maksilofasial (Sp.B.M.M)",
    rating: 4.9,
    reviewCount: 140,
    photo: '/images/default-doctor.svg',
    availableDays: ["Selasa", "Jumat"],
    schedules: [
      { day: "Selasa", time: "14:00 - 18:00 WIB", room: "Poliklinik Bedah Mulut, R. 105" },
      { day: "Jumat", time: "09:00 - 13:00 WIB", room: "Poliklinik Bedah Mulut, R. 105" }
    ],
    bio: "Ahli bedah mulut yang menangani operasi gigi impaksi dan rekonstruksi rahang dengan prosedur steril berstandar tinggi."
  },
  {
    id: "dr-christian-yosaputra",
    name: "dr. Christian Yosaputra, Sp.JP, FIHA",
    specialty: "Spesialis Jantung & Pembuluh Darah",
    specialtyGroup: "Jantung & Vaskular",
    subSpecialty: "Kardiologi Klinis, EKG, Treadmill Test, Hipertensi Jantung",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Jantung",
    education: "Pendidikan Dokter Spesialis Jantung & Pembuluh Darah (Sp.JP) | FIHA",
    rating: 5.0,
    reviewCount: 290,
    photo: '/images/default-doctor.svg',
    availableDays: ["Senin", "Rabu", "Jumat"],
    schedules: [
      { day: "Senin", time: "14:00 - 18:00 WIB", room: "Poliklinik Jantung, R. 206" },
      { day: "Rabu", time: "09:00 - 13:00 WIB", room: "Poliklinik Jantung, R. 206" },
      { day: "Jumat", time: "10:00 - 15:00 WIB", room: "Poliklinik Jantung, R. 206" }
    ],
    bio: "Dokter spesialis jantung yang berfokus pada pencegahan penyakit kardiovaskular dan penanganan aritmia serta jantung koroner."
  },
  {
    id: "dr-asril-tanjung",
    name: "dr. Asril Tanjung, Sp.N",
    specialty: "Spesialis Neurologi (Saraf)",
    specialtyGroup: "Saraf & Otak",
    subSpecialty: "Stroke Akut & Kronis, Nyeri Kepala / Vertigo, Nyeri Saraf Tulang Belakang",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Saraf",
    education: "Pendidikan Dokter Spesialis Neurologi (Sp.N)",
    rating: 4.9,
    reviewCount: 205,
    photo: '/images/default-doctor.svg',
    availableDays: ["Selasa", "Kamis", "Sabtu"],
    schedules: [
      { day: "Selasa", time: "09:00 - 13:00 WIB", room: "Poliklinik Saraf, R. 208" },
      { day: "Kamis", time: "14:00 - 18:00 WIB", room: "Poliklinik Saraf, R. 208" },
      { day: "Sabtu", time: "09:00 - 13:00 WIB", room: "Poliklinik Saraf, R. 208" }
    ],
    bio: "Spesialis saraf yang berpengalaman dalam penanganan rehabilitasi stroke dan gangguan sistem saraf tepi maupun pusat."
  },
  {
    id: "dr-levina-mutia",
    name: "dr. Levina Mutia, Sp.KJ",
    specialty: "Spesialis Kedokteran Jiwa (Psikiatri)",
    specialtyGroup: "Kesehatan Jiwa",
    subSpecialty: "Gangguan Kecemasan (Anxiety), Depresi, Gangguan Tidur (Insomnia), Terapi Mental",
    branchId: "naray-dumai-utama",
    branchName: "Naray Hospital Dumai",
    experience: "Dokter Spesialis Kesehatan Jiwa",
    education: "Pendidikan Dokter Spesialis Kedokteran Jiwa (Sp.KJ)",
    rating: 4.9,
    reviewCount: 160,
    photo: '/images/default-doctor.svg',
    availableDays: ["Rabu", "Jumat"],
    schedules: [
      { day: "Rabu", time: "13:00 - 17:00 WIB", room: "Poliklinik Psikiatri, R. 210" },
      { day: "Jumat", time: "09:00 - 13:00 WIB", room: "Poliklinik Psikiatri, R. 210" }
    ],
    bio: "Menyediakan ruang konsultasi yang aman dan nyaman untuk membantu kesehatan emosional dan psikologis pasien."
  }
];

export const inpatientRooms = [
  {
    id: "room-pistillum-vip",
    slug: "pistillum-suite-vip",
    name: "Pistillum Suite (VIP / VVIP)",
    category: "vip",
    tag: "Kenyamanan Tertinggi & Privasi Penuh",
    capacity: "1 Pasien per Kamar (Kapasitas Eksklusif)",
    totalBeds: 4,
    availableBeds: 2,
    price: "Rp 1.500.000 / malam",
    priceNumber: 1500000,
    bpjsCovered: false,
    insuranceCovered: true,
    image: '/images/rooms/room-vip.jpg',
    features: [
      "1 Tempat Tidur Pasien Elektrik Otomatis (Multi-posisi)",
      "1 Bed / Sofa Penunggu Pasien Nyaman & Luas",
      "Set Meja Makan Pasien & Ruang Tamu Keluarga Pribadi",
      "Kitchen Set & Pantry Mini dengan Teko Elektrik & Kulkas",
      "Pendingin Ruangan (AC) Dingin & Hening",
      "Smart TV 55 Inch Layar Lebar & Akses Wi-Fi Cepat",
      "Kamar Mandi Dalam dengan Pemanas Air (Water Heater)",
      "Nurse Call System 24 Jam di Sisi Bed & Kamar Mandi"
    ]
  },
  {
    id: "room-green-petals",
    slug: "green-petals-kelas-1",
    name: "Green Petals (Kamar Rawat Kelas 1)",
    category: "standard",
    tag: "Kenyamanan Bersama Berstandar Tinggi",
    capacity: "2 Tempat Tidur per Ruangan (Sekat Tirai Privasi)",
    totalBeds: 15,
    availableBeds: 5,
    price: "Rp 750.000 / malam",
    priceNumber: 750000,
    bpjsCovered: true,
    insuranceCovered: true,
    image: '/images/rooms/room-class1.jpg',
    features: [
      "Tempat Tidur Medis Pasien Elektrik Ergonomis",
      "Sekat Tirai Tebal Menjaga Privasi Antarpasien",
      "Smart TV 43 Inch & Akses Wi-Fi Cepat",
      "Bedside Cabinet untuk Perlengkapan Pasien",
      "Kamar Mandi Dalam Higienis dengan Water Heater",
      "Alarm Darurat / Nurse Call di Sisi Tempat Tidur",
      "Pendingin Ruangan (AC) Sejuk & Tenang"
    ]
  },
  {
    id: "room-red-petals",
    slug: "red-petals-kelas-2",
    name: "Red Petals (Kamar Rawat Kelas 2)",
    category: "standard",
    tag: "Tenang, Bersih & Ramah Keluarga",
    capacity: "4 Tempat Tidur per Ruangan",
    totalBeds: 20,
    availableBeds: 7,
    price: "Rp 500.000 / malam",
    priceNumber: 500000,
    bpjsCovered: true,
    insuranceCovered: true,
    image: '/images/rooms/room-class2.jpg',
    features: [
      "Tempat Tidur Pasien dengan Pengatur Sandaran Medis",
      "Tirai Penyekat Privasi di Setiap Tempat Tidur",
      "Pendingin Ruangan (AC) Nyaman & Bersirkulasi Baik",
      "Smart TV 43 Inch di Ruangan & Akses Wi-Fi Gratis",
      "Bed Side Cabinet Medis Pribadi & Meja Makan Lipat",
      "Kamar Mandi Dalam Bersih & Higienis",
      "Nurse Call System Terhubung Langsung ke Pos Perawat"
    ]
  },
  {
    id: "room-seroja",
    slug: "seroja-kelas-3",
    name: "Seroja (Kamar Rawat Inap Kelas 3 Reguler)",
    category: "reguler",
    tag: "Layanan Paripurna Terjangkau & Luas",
    capacity: "6 Tempat Tidur Pasien per Bangsal",
    totalBeds: 36,
    availableBeds: 12,
    price: "Rp 250.000 / malam",
    priceNumber: 250000,
    bpjsCovered: true,
    insuranceCovered: true,
    image: '/images/rooms/room-class3.jpg',
    features: [
      "Tempat Tidur Medis Pasien dengan Kasur Anti-Dekubitus",
      "Tirai Privasi Standar Rumah Sakit di Setiap Bed",
      "Penyejuk Ruangan (AC) & Sirkulasi Udara Segar",
      "Kamar Mandi Dalam Bersih dengan Pegangan Pengaman",
      "Standar Kelas Rawat Inap Standar (KRIS) BPJS",
      "Nurse Call Terintegrasi di Setiap Sisi Bed"
    ]
  },
  {
    id: "room-staments-icu",
    slug: "staments-icu-intensif",
    name: "Staments 1 – Ruang ICU (Intensive Care Unit)",
    category: "intensive",
    tag: "Perawatan Kritis & Pemantauan Intensif 24 Jam Nonstop",
    capacity: "7 Bed Pasien Khusus Intensif",
    totalBeds: 26,
    availableBeds: 25,
    price: "Rp 1.250.000 / malam",
    priceNumber: 1250000,
    bpjsCovered: true,
    insuranceCovered: true,
    image: '/images/rooms/room-icu.jpg',
    features: [
      "Bed Pasien Khusus Perawatan Intensif Multiposisi",
      "Bedside Monitor Multi-Parameter Pemantau Tanda Vital 24 Jam",
      "Ventilator Mekanik Modern & Pasokan Central Oxygen",
      "Syringe Pump & Infusion Pump Digital Siaga",
      "Pengawasan Dokter Spesialis Anestesi & Tim Perawat ICU 24 Jam"
    ]
  },
  {
    id: "room-isolasi",
    slug: "ruang-rawat-isolasi-khusus",
    name: "Ruang Rawat Isolasi Khusus Bertekanan Negatif",
    category: "intensive",
    tag: "Protokol Pengendalian Infeksi & Hepafilter Berstandar",
    capacity: "8 Bed Pasien Isolasi Mandiri",
    totalBeds: 16,
    availableBeds: 15,
    price: "Rp 850.000 / malam",
    priceNumber: 850000,
    bpjsCovered: true,
    insuranceCovered: true,
    image: '/images/rooms/room-isolation.jpg',
    features: [
      "Sistem Tata Udara Tekanan Negatif dengan Filter HEPA 99.97%",
      "Ruang Antara (Anteroom) untuk Protokol Sterilisasi Petugas Medis",
      "Ventilasi & Pencahayaan Medis Terkalibrasi Standar Kemenkes RI",
      "Kamar Mandi Dalam Khusus dengan Sistem Limbah Medis",
      "Pengawasan Medis 24 Jam & Ruang Kaca Observasi Steril"
    ]
  }
];

export const mcuPackages = [
  {
    id: "mcu-geriatri",
    name: "Paket Sehat Geriatri (Khusus Usia Lanjut)",
    badge: "Layanan Unggulan Naray Hospital",
    price: "Rp 1.250.000",
    originalPrice: "Rp 1.650.000",
    duration: "2 - 3 Jam",
    target: "Lansia Pria & Wanita (Usia 55+ Tahun)",
    highlight: "Pemeriksaan fungsi organ vital, kadar gula darah, kolesterol, dan tulang untuk lansia",
    items: [
      "Pemeriksaan Fisik oleh Dokter Spesialis Penyakit Dalam",
      "Hematologi Rutin Lengkap",
      "Profil Lemak: Kolesterol Total, HDL, LDL, Trigliserida",
      "Gula Darah Puasa & HbA1c",
      "Fungsi Ginjal: Ureum & Kreatinin",
      "Fungsi Hati: SGOT, SGPT",
      "Rontgen Dada (Thorax)",
      "Elektrokardiogram (EKG Jantung)",
      "Konsultasi Nutrisi & Pola Aktivitas Sehat Lansia"
    ]
  },
  {
    id: "mcu-skrining-rutin",
    name: "Paket Skrining Sehat Naray (Umum)",
    badge: "Paling Populer untuk Karyawan & Keluarga",
    price: "Rp 850.000",
    originalPrice: "Rp 1.150.000",
    duration: "1.5 - 2 Jam",
    target: "Pria & Wanita (Usia 18 - 50 Tahun)",
    highlight: "Pemeriksaan dasar kesehatan untuk deteksi dini penyakit umum",
    items: [
      "Konsultasi Dokter Umum & Cek Tensi",
      "Darah Lengkap 18 Parameter",
      "Kolesterol Total & Trigliserida",
      "Gula Darah Sewaktu / Puasa",
      "Asam Urat & Fungsi Ginjal Dasar",
      "Urinalisis Lengkap (Air Seni)",
      "Rontgen Dada (Foto Thorax)",
      "Resume Medis & Edukasi Kesehatan"
    ]
  },
  {
    id: "mcu-jantung-sehat",
    name: "Paket Deteksi Dini Jantung Naray",
    badge: "Rekomendasi Spesialis Jantung",
    price: "Rp 2.100.000",
    originalPrice: "Rp 2.750.000",
    duration: "3 Jam",
    target: "Individu dengan Riwayat Hipertensi, Rokok, atau Kolesterol",
    highlight: "Skrining kesehatan pembuluh darah dan irama jantung oleh Dokter Spesialis Jantung",
    items: [
      "Konsultasi dr. Christian Yosaputra, Sp.JP, FIHA",
      "Pemeriksaan EKG Resting 12-Lead",
      "Treadmill Stress Test",
      "Ekokardiografi (USG Jantung)",
      "Profil Lipid Lengkap",
      "Fungsi Ginjal & Enzim Jantung Dasar",
      "Laporan Kesehatan Jantung Komprehensif"
    ]
  },
  {
    id: "mcu-pranikah",
    name: "Paket Skrining Pra-Nikah Naray",
    badge: "Calon Pengantin Bahagia",
    price: "Rp 1.950.000 / Pasang",
    originalPrice: "Rp 2.500.000",
    duration: "2 Jam",
    target: "Calon Mempelai Pria & Wanita",
    highlight: "Pemeriksaan genetik, penyakit menular, dan kesiapan organ reproduksi",
    items: [
      "Pemeriksaan Golongan Darah & Rhesus",
      "Hematologi Rutin & Skrining Thalasemia",
      "Skrining Hepatitis B (HBsAg) & Infeksi Menular",
      "Pemeriksaan Fisik Kebidanan & Kandungan (Sp.OG)",
      "Konsultasi Dokter Pra-Nikah & Vaksinasi Pranikah",
      "Sertifikat Bebas Penyakit Menular Resmi"
    ]
  }
];

export const facilitiesData = [
  {
    id: "fac-ugd",
    name: "Unit Gawat Darurat (UGD) 24 Jam",
    category: "Gawat Darurat & Trauma",
    image: '/images/discovery/diagnostic-center.jpg',
    description: "Pelayanan gawat darurat 24 jam dengan tim dokter jaga dan perawat bersertifikasi kegawatdaruratan, dilengkapi ruang triase, ruang resusitasi, dan armada ambulans siaga cepat."
  },
  {
    id: "fac-icu",
    name: "Ruang Perawatan Intensif (ICU Staments)",
    category: "Perawatan Kritis",
    image: '/images/rooms/room-icu.jpg',
    description: "Kapasitas 7 tempat tidur dengan bedside monitor canggih, ventilator mekanik, sistem pengaturan udara steril, dan pengawasan intensif dokter spesialis anestesi serta perawat ICU."
  },
  {
    id: "fac-operasi",
    name: "Kamar Operasi Bedah Steril",
    category: "Kamar Bedah",
    image: '/images/facilities/qrtzH6LJYIvtTWhscnddrh7F9pZBM2mH1hDYDQ2f.webp',
    description: "Ruang tindakan bedah berstandar sterilisasi tinggi dengan filter udara HEPA untuk prosedur bedah umum, kebidanan/caesar, dan bedah mulut secara aman."
  },
  {
    id: "fac-lab",
    name: "Laboratorium Patologi Klinik 24 Jam",
    category: "Diagnostik Laboratorium",
    image: '/images/discovery/mcu-lab.jpg',
    description: "Pemeriksaan darah rutin, kimia darah, profil lemak, fungsi hati, fungsi ginjal, tes urin, dan analisa mikrobiologi dengan alat otomatis akurat."
  },
  {
    id: "fac-radiologi",
    name: "Unit Radiologi & Rontgen Digital",
    category: "Pencitraan Medis",
    image: '/images/discovery/diagnostic-center.jpg',
    description: "Pemeriksaan foto rontgen dada, tulang, dan sendi dengan dosis radiasi rendah yang menghasilkan citra digital tajam untuk diagnosa dokter spesialis."
  },
  {
    id: "fac-geriatri",
    name: "Layanan Khusus Geriatri (Lansia)",
    category: "Layanan Unggulan",
    image: '/images/discovery/vip-room.jpg',
    description: "Layanan terpadu yang dirancang khusus untuk memenuhi kebutuhan fisik, emosional, dan medis para lansia dengan dokter spesialis dan perawat yang sabar serta penuh kasih."
  }
];

export const galleryActivities = [
  {
    id: "gal-1",
    title: "Pemeriksaan Kesehatan Gratis saat Bazaar Sekolah Maitreyawira – 18 Mei 2025",
    date: "18 Mei 2025",
    category: "Kegiatan Sosial / CSR",
    image: '/images/default-image.svg',
    desc: "Naray Hospital menggelar bakti sosial pemeriksaan tensi, gula darah, dan konsultasi dokter umum gratis untuk ratusan pengunjung dan siswa di Kota Dumai."
  },
  {
    id: "gal-2",
    title: "Pembagian Doorprize untuk Peserta Senam + Health Talk Naray Hospital",
    date: "9 Juni 2025",
    category: "Edukasi Komunitas Sehat",
    image: '/images/default-image.svg',
    desc: "Edukasi pola hidup sehat, pencegahan serangan jantung dini, dan senam bersama masyarakat sekitar rumah sakit yang diakhiri dengan pembagian doorprize menarik."
  },
  {
    id: "gal-3",
    title: "Pelayanan Geriatri & Kunjungan Kasih Pasien Lanjut Usia",
    date: "14 Juli 2025",
    category: "Pelayanan Geriatri",
    image: '/images/default-image.svg',
    desc: "Program pendampingan dan pemeriksaan kesehatan berkala bagi lansia untuk memastikan mereka tetap aktif, mandiri, dan bahagia."
  }
];

export const videoList = [
  {
    id: "vid-company-profile",
    title: "Company Profile Naray Hospital - Rumah Sakit Modern & Nyaman di Dumai",
    youtubeEmbed: "https://www.youtube.com/embed/60yNtDcAykw?feature=oembed",
    desc: "Mengenal lebih dekat fasilitas, dokter spesialis, dan komitmen pelayanan Naray Hospital di Kota Dumai, Riau."
  },
  {
    id: "vid-geriatri",
    title: "Pelayanan Geriatri Naray Hospital - Peduli Kesehatan Lansia",
    youtubeEmbed: "https://www.youtube.com/embed/1yvh_sdLpEU?feature=oembed",
    desc: "Dedikasi kami dalam memberikan perawatan yang tulus dan berkualitas tinggi bagi para pasien usia lanjut."
  }
];

export const healthArticles = [
  {
    id: "artikel-1",
    slug: "pentingnya-menjaga-pola-makan-gula-darah-diabetes",
    title: "Pentingnya Menjaga Pola Makan dan Gula Darah Terkontrol bagi Penderita Diabetes",
    category: "Penyakit Dalam",
    author: "dr. Rizka Nadia, Sp.PD",
    date: "2 September 2026",
    readTime: "4 Menit Baca",
    image: '/images/discovery/diagnostic-center.jpg',
    summary: "Diabetes melitus adalah gangguan metabolik kronik yang memerlukan manajemen pola makan gizi seimbang, olahraga terukur, dan kepatuhan pengobatan berkelanjutan.",
    content: `Diabetes melitus merupakan salah satu gangguan metabolik yang paling banyak dijumpai di masyarakat. Sering kali diabetes tidak menimbulkan keluhan di awal, namun jika dibiarkan dapat memicu komplikasi pada ginjal, jantung, mata, dan persarafan.

Langkah Kunci Mengontrol Gula Darah:
1. Batasi konsumsi karbohidrat sederhana dan minuman berpemanis tinggi.
2. Perbanyak asupan serat dari sayur-sayuran hijau dan buah dengan indeks glikemik rendah.
3. Rutin berolahraga ringan minimal 30 menit sehari (seperti jalan santai atau senam).
4. Periksa kadar HbA1c dan gula darah puasa berkala di Poliklinik Penyakit Dalam Naray Hospital.`
  },
  {
    id: "artikel-2",
    slug: "mengenal-tanda-gangguan-irama-jantung-aritmia",
    title: "Mengenal Tanda Gangguan Irama Jantung (Aritmia) dan Kapan Harus ke Dokter",
    category: "Kesehatan Jantung",
    author: "dr. Christian Yosaputra, Sp.JP, FIHA",
    date: "28 Agustus 2026",
    readTime: "5 Menit Baca",
    image: '/images/discovery/mcu-lab.jpg',
    summary: "Jantung yang berdebar kencang mendadak, rasa melayang, atau sesak napas bisa menjadi tanda gangguan irama jantung yang memerlukan evaluasi kardiologis.",
    content: `Irama jantung normal berdetak secara teratur antara 60 hingga 100 kali per menit saat istirahat. Ketika detak jantung terlalu cepat, terlalu lambat, atau tidak beraturan, kondisi ini disebut sebagai aritmia.

Kapan Harus Waspada?
- Debaran jantung mendadak tanpa pemicu aktivitas fisik berat.
- Disertai pusing hebat, pandangan gelap berkunang-kunang, atau pingsan (sinkop).
- Rasa tertekan atau nyeri di bagian tengah dada.

Lakukan pemeriksaan EKG 12-Lead dan konsultasi di Poliklinik Jantung Naray Hospital untuk evaluasi menyeluruh.`
  },
  {
    id: "artikel-3",
    slug: "tips-menjaga-tumbuh-kembang-optimal-anak-1000-hpk",
    title: "Tips Menjaga Tumbuh Kembang Optimal Anak pada 1.000 Hari Pertama Kehidupan",
    category: "Kesehatan Anak",
    author: "dr. M. Riki Fachrozi, M.Ked(Ped)., Sp.A",
    date: "20 Agustus 2026",
    readTime: "4 Menit Baca",
    image: '/images/discovery/vip-room.jpg',
    summary: "Periode emas tumbuh kembang anak dimulai dari sejak dalam kandungan hingga anak berusia dua tahun, fondasi utama kecerdasan dan imunitas.",
    content: `1.000 Hari Pertama Kehidupan (HPK) adalah periode krusial yang menentukan kecerdasan kognitif, daya tahan tubuh, dan pertumbuhan fisik seorang anak di masa depan.

Kunci Sukses 1.000 HPK:
1. Nutrisi lengkap bagi ibu hamil dan rutin memeriksakan kehamilan ke dokter spesialis obgyn.
2. Inisiasi Menyusu Dini (IMD) dan ASI Eksklusif selama 6 bulan pertama.
3. MPASI bernutrisi seimbang kaya protein hewani mulai usia 6 bulan.
4. Imunisasi dasar lengkap tepat waktu di Poliklinik Anak Naray Hospital.`
  },
  {
    id: "artikel-4",
    slug: "pencegahan-dan-penanganan-gangguan-pernapasan-tropis",
    title: "Pencegahan dan Penanganan Gangguan Pernapasan di Lingkungan Beriklim Tropis",
    category: "Kesehatan Paru",
    author: "dr. Jemmy Fandri, Sp.P",
    date: "15 Agustus 2026",
    readTime: "3 Menit Baca",
    image: '/images/facilities/qrtzH6LJYIvtTWhscnddrh7F9pZBM2mH1hDYDQ2f.webp',
    summary: "Debu, perubahan cuaca tropis, dan polusi dapat memicu kekambuhan asma dan infeksi saluran pernapasan atas (ISPA) bagi keluarga.",
    content: `Saluran pernapasan sangat rentan terhadap partikel polutan dan perubahan suhu udara yang drastis. Bagi penderita asma atau alergi saluran napas, paparan asap rokok dan debu dapat memicu penyempitan bronkus yang menyebabkan sesak.

Tips Menjaga Kesehatan Paru:
- Gunakan masker saat beraktivitas di luar ruangan berdebu.
- Hindari paparan asap rokok dan jaga sirkulasi udara kamar tidur tetap bersih.
- Cukupi minum air hangat dan konsumsi makanan kaya antioksidan.
- Segera periksakan diri ke Poliklinik Paru jika batuk berlangsung lebih dari 2 minggu.`
  },
  {
    id: "artikel-5",
    slug: "teknologi-bedah-laparoskopi-minim-sayatan",
    title: "Teknologi Bedah Laparoskopi: Operasi Minim Sayatan dengan Pemulihan Lebih Cepat",
    category: "Bedah & Ortopedi",
    author: "dr. Ahmad Musa, Sp.B",
    date: "10 Agustus 2026",
    readTime: "5 Menit Baca",
    image: '/images/articles/p24ZdJ92E65CCO3e57TrP5CbqDz37IPgJwfgkDVp.webp',
    summary: "Bedah laparoskopi memungkinkan tindakan pembedahan modern melalui sayatan kecil beberapa milimeter dengan risiko komplikasi yang jauh lebih rendah.",
    content: `Kemajuan teknologi kedokteran bedah saat ini memungkinkan dilakukannya prosedur invasif minimal (laparoskopi). Berbeda dengan operasi konvensional yang memerlukan sayatan lebar, laparoskopi hanya membutuhkan sayatan kecil berukuran 0,5 hingga 1 cm.

Keunggulan Bedah Laparoskopi di Naray Hospital:
1. Rasa nyeri pascaoperasi yang jauh lebih ringan.
2. Waktu rawat inap yang lebih singkat (rata-rata 1-2 hari).
3. Bekas luka yang sangat minimal dan estetis.
4. Pemulihan aktivitas harian yang jauh lebih cepat.

Konsultasikan indikasi tindakan bedah laparoskopi bersama dr. Ahmad Musa, Sp.B di Poliklinik Bedah Naray Hospital.`
  },
  {
    id: "artikel-6",
    slug: "pemeriksaan-antenatal-care-usg-4d-kehamilan-sehat",
    title: "Pentingnya Pemeriksaan Antenatal Care (ANC) Rutin & USG 4D untuk Ibu Hamil",
    category: "Kebidanan & Kandungan",
    author: "dr. Syafwan, Sp.OG",
    date: "5 Agustus 2026",
    readTime: "4 Menit Baca",
    image: '/images/discovery/mcu-lab.jpg',
    summary: "Pemeriksaan kehamilan rutin membantu memantau detak jantung janin, posisi plasenta, serta deteksi dini kelainan anatomis janin sejak trimester pertama.",
    content: `Menjaga kesehatan ibu dan janin selama sembilan bulan masa kehamilan merupakan prioritas utama dalam menciptakan generasi yang sehat dan cerdas. Pemeriksaan Antenatal Care (ANC) teratur direkomendasikan minimal 6 kali selama masa kehamilan.

Manfaat Pemeriksaan USG 4D:
- Melihat morfologi anatomi organ tubuh janin secara visual dan real-time.
- Memastikan kecukupan cairan ketuban dan lokasi insersi tali pusat.
- Mengidentifikasi potensi penyulit persalinan lebih dini.

Layanan Poliklinik Kebidanan dan Kandungan Naray Hospital siap mendampingi masa bahagia kehamilan Anda.`
  },
  {
    id: "artikel-7",
    slug: "mengenali-gejala-stroke-fast-waktu-penyelamat-otak",
    title: "Mengenali Gejala Stroke dengan Metode FAST: Waktu Adalah Penyelamat Otak",
    category: "Edukasi Kesehatan",
    author: "dr. Rahmat Hidayat, Sp.N",
    date: "1 Agustus 2026",
    readTime: "4 Menit Baca",
    image: '/images/discovery/diagnostic-center.jpg',
    summary: "Setiap menit sangat berharga saat stroke terjadi. Kenali gejala FAST agar pasien segera mendapatkan penanganan pada periode golden hour.",
    content: `Stroke terjadi ketika pasokan darah ke bagian otak terganggu atau berkurang, sehingga jaringan otak kekurangan oksigen dan nutrisi. Penanganan dalam kurun waktu golden hour (kurang dari 4,5 jam) dapat mencegah kecacatan permanen.

Metode FAST:
- F (Face Drooping): Wajah tampak tidak simetris atau tersenyum miring.
- A (Arm Weakness): Salah satu lengan atau tungkai terasa lemas atau baal.
- S (Speech Difficulty): Bicara pelo, cadel, atau kesulitan memahami perkataan.
- T (Time to Call Emergency): Segera hubungi IGD Naray Hospital 24 Jam.

Tim emergensi saraf Naray Hospital siaga 24 jam dengan CT Scan dan ruang resusitasi darurat.`
  },
  {
    id: "artikel-8",
    slug: "naray-hospital-perluas-unit-hemodialisa-kamar-vip",
    title: "Naray Hospital Dumai Perluas Fasilitas Layanan Hemodialisa dan Kamar VIP",
    category: "Berita",
    author: "Humas Naray Hospital",
    date: "25 Juli 2026",
    readTime: "3 Menit Baca",
    image: '/images/rooms/t86h6byAPNNbxedD8th6bYZoUF6jevuBwVBObKD6.webp',
    summary: "Peningkatan mutu pelayanan kesehatan Kota Dumai melalui penambahan mesin cuci darah generasi terbaru dan renovasi kamar rawat inap kelas VIP Pistillum.",
    content: `Sebagai wujud komitmen memberikan pelayanan medis yang prima dan berorientasi pada kenyamanan pasien, Naray Hospital Kota Dumai secara resmi mengoperasikan perluasan Unit Hemodialisa (cuci darah) dan kamar rawat inap VIP.

Peningkatan Fasilitas Meliputi:
- Penambahan 10 mesin hemodialisa modern dengan pengawasan dokter spesialis penyakit dalam konsultan ginjal.
- Ruang tunggu pasien cuci darah yang nyaman dengan pendingin udara dan fasilitas hiburan.
- Kamar VIP Pistillum yang dilengkapi electric patient bed, smart TV, sofa penunggu, dan kamar mandi water heater.

Seluruh fasilitas ini dapat diakses oleh pasien umum, asuransi rekanan, maupun BPJS Kesehatan sesuai ketentuan yang berlaku.`
  },
  {
    id: "artikel-9",
    slug: "jadwal-layanan-poliklinik-spesialis-libur-nasional",
    title: "Jadwal Pelayanan Poliklinik Spesialis Selama Periode Libur Nasional",
    category: "Pengumuman",
    author: "Manajemen Naray Hospital",
    date: "18 Juli 2026",
    readTime: "2 Menit Baca",
    image: '/images/banners/Bro9UO8SWXZbT9jdPdzY8P9XRzuuQcPtukXsYzbJ.webp',
    summary: "Informasi operasional poliklinik rawat jalan dan kesiapsiagaan 24 jam IGD serta ambulans selama periode libur nasional dan cuti bersama.",
    content: `Diberitahukan kepada seluruh pasien dan keluarga bahwa sehubungan dengan penetapan libur nasional dan cuti bersama:

1. Poliklinik Rawat Jalan Spesialis tutup sementara pada tanggal merah nasional dan kembali beroperasi normal pada hari kerja berikutnya.
2. Instalasi Gawat Darurat (UGD), Ruang Bersalin (VK), Perawatan Intensif (ICU), Laboratorium, dan Radiologi tetap BUKA 24 JAM PENUH.
3. Layanan ambulans darurat dapat dihubungi kapan saja melalui WhatsApp UGD +62 853-6339-5383.

Kami senantiasa siap memberikan pertolongan medis terbaik bagi Anda dan keluarga tercinta.`
  },
  {
    id: "artikel-10",
    slug: "5-langkah-skrining-medical-check-up-rutin",
    title: "5 Langkah Skrining Kesehatan Rutin (MCU) Sebelum Muncul Gejala Penyakit",
    category: "Tips Sehat",
    author: "dr. Rizka Nadia, Sp.PD",
    date: "10 Juli 2026",
    readTime: "4 Menit Baca",
    image: '/images/discovery/vip-room.jpg',
    summary: "Deteksi dini merupakan kunci utama pencegahan penyakit degeneratif. Kenali jenis pemeriksaan MCU yang dianjurkan untuk usia dewasa.",
    content: `Banyak penyakit serius seperti hipertensi, dislipidemia, perlemakan hati, dan gangguan fungsi ginjal tidak menimbulkan gejala yang nyata pada fase awal. Skrining berkala membantu mendeteksi anomali sebelum terjadi komplikasi berat.

5 Paket Pemeriksaan Dasar yang Dianjurkan:
1. Profil Lipid Lengkap (Kolesterol Total, HDL, LDL, Trigliserida).
2. Fungsi Hati (SGOT, SGPT) dan Fungsi Ginjal (Ureum, Kreatinin).
3. Skrining Gula Darah Puasa dan HbA1c.
4. Rekam Jantung (Elektrokardiografi / EKG).
5. Rontgen Thorax untuk evaluasi paru dan jantung.

Naray Hospital menyediakan berbagai paket MCU terjangkau dengan hasil laboratorium yang cepat dan akurat.`
  }
];

export const insurancePartners = [
  { name: "Bank Mandiri", logo: "Bank Mandiri" },
  { name: "Asuransi Sinarmas", logo: "Sinarmas" },
  { name: "Bank BRI", logo: "Bank BRI" },
  { name: "Palang Merah Indonesia (PMI)", logo: "PMI" },
  { name: "Pantai Hospital International", logo: "Pantai Hospital" },
  { name: "Apical Group", logo: "Apical" },
  { name: "Laboratorium Thamrin", logo: "Lab Thamrin" },
  { name: "Bank OCBC", logo: "Bank OCBC" },
  { name: "Mandiri Inhealth", logo: "Mandiri Inhealth" },
  { name: "Bank BNI", logo: "Bank BNI" },
  { name: "Laboratorium Klinik Prodia", logo: "Prodia" },
  { name: "AdMedika Third Party", logo: "AdMedika" },
  { name: "BPJS Kesehatan", logo: "BPJS Kesehatan" }
];

export const patientGuide = [
  {
    title: "Pendaftaran Poliklinik & Dokter Jaga",
    desc: "Pasien dapat mendaftar langsung di loket pendaftaran rawat jalan atau berkonsultasi via layanan WhatsApp Naray Hospital."
  },
  {
    title: "Pelayanan UGD & Darurat 24 Jam",
    desc: "Unit Gawat Darurat selalu siaga 24 jam dengan dokter dan perawat emergensi siap menangani pasien darurat tanpa antrean."
  },
  {
    title: "Ketersediaan Kamar Rawat Inap",
    desc: "Total 101 tempat tidur dengan pilihan kelas Pistillum (VIP), Staments (ICU), Green Petals, Red Petals, Seroja, dan Isolasi."
  },
  {
    title: "Jaminan Asuransi Cashless",
    desc: "Bekerjasama dengan Mandiri Inhealth, Sinarmas, AdMedika, Prodia, dan mitra asuransi terkemuka untuk kenyamanan pasien."
  }
];
