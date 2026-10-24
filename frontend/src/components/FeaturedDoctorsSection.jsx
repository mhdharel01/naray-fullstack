import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';

export function FeaturedDoctorsSection() {
  const { doctors = [] } = useHospitalData();

  // Smart helper to render doctor's photo from database with fallback for missing/corrupted uploads
  const getDoctorPhoto = (doc) => {
    // If the doctor has an uploaded photo (from database or local), use it directly
    if (doc.photo && 
        !doc.photo.includes('.svg') && 
        !doc.photo.includes('default-doctor') && 
        !doc.photo.includes('SL99Oz3WyX0Wj5ZKUhthIhEg5VlDMqnLDPe685B4')) {
      return doc.photo;
    }
    const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doc.name || '');
    return isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
  };

  // Pick top 4 representative doctors from diverse specialties
  const featuredIds = [10, 14, 13, 6];
  const featuredList = featuredIds
    .map(id => doctors.find(d => d.id === id || d.dbId === id))
    .filter(Boolean);

  const displayDoctors = featuredList.length >= 3 ? featuredList : doctors.slice(0, 4);

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80" id="dokter-unggulan" aria-labelledby="featured-doctors-heading">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600 block mb-2 font-mono">
              DOKTER SPESIALIS
            </span>
            <h2 id="featured-doctors-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2.5">
              Dokter Spesialis Berpengalaman Kota Dumai
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Didukung 19+ dokter spesialis dan tenaga medis profesional bersertifikasi nasional yang siap memberikan penanganan komprehensif bagi keluarga Anda.
            </p>
          </div>

          <div className="shrink-0">
            <Link 
              to="/dokter-jadwal" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-teal-300 px-5 py-2.5 rounded-full shadow-2xs transition-all"
            >
              <span>Semua 19+ Dokter</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 sm:mb-20">
          {displayDoctors.map((doc) => {
            const activeSchedules = (doc.schedules || []).filter(s => (s.status || 'active') === 'active');
            const nextSchedule = activeSchedules[0] || { day: 'Senin - Sabtu', time: '09:00 - 13:00 WIB', room: 'Poliklinik Rawat Jalan' };
            const photoSrc = getDoctorPhoto(doc);

            return (
              <div 
                key={doc.id} 
                className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
              >
                {/* Doctor Portrait Header */}
                <div className="relative h-56 sm:h-60 bg-slate-100 overflow-hidden">
                  <img 
                    src={photoSrc} 
                    alt={`Foto profil ${doc.name}`} 
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                    loading="lazy" 
                    onError={(e) => {
                      const isFemale = /siti|rizka|yolanda|levina|dwi|depsi|mutia/i.test(doc.name || '');
                      e.currentTarget.src = isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                  {/* Status Pill */}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold shadow-sm border border-white/10">
                    <span className={`w-2 h-2 rounded-full ${doc.isOnLeave ? 'bg-amber-400' : (doc.isPracticing ? 'bg-emerald-400' : 'bg-slate-400')}`} />
                    <span>{doc.isOnLeave ? 'Sedang Cuti' : (doc.isPracticing ? 'Praktik Sesuai Jadwal' : 'Tidak Praktik')}</span>
                  </span>
                </div>

                {/* Doctor Info Body */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md self-start mb-2 border border-teal-100/80">
                    {doc.specialtyGroup || doc.specialty}
                  </span>
                  
                  <h3 className="font-heading text-base font-extrabold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors line-clamp-2 min-h-[44px] leading-snug">
                    {doc.name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 line-clamp-1 mb-4 leading-normal font-medium">
                    {doc.subSpecialty || doc.specialty}
                  </p>

                  {/* Schedule Snippet */}
                  <div className="mt-auto mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                    {doc.isOnLeave ? (
                      <div className="text-xs font-semibold text-amber-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="line-clamp-1">
                          {doc.currentLeave?.end_date
                            ? `Cuti s/d ${new Date(doc.currentLeave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'Sedang Cuti'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                          <Calendar size={13} className="text-teal-600 shrink-0" />
                          <span>{nextSchedule.day}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                          <Clock size={13} className="text-teal-600 shrink-0" />
                          <span>{nextSchedule.time}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    <Link
                      to={`/dokter/${doc.slug || doc.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
                      aria-label={`Lihat Profil & Jadwal Lengkap ${doc.name}`}
                    >
                      <Calendar size={14} />
                      <span>{doc.isOnLeave ? 'Lihat Info Dokter' : 'Lihat Profil & Jadwal'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Action Banner */}
        <div className="bg-[#042622] text-white p-5 sm:p-6 rounded-2xl border border-teal-800/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                Pendaftaran Konsultasi Dokter Lebih Cepat Lewat Online
              </h4>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed mt-1">
                Pilih jadwal dokter di atas, peroleh nomor antrean digital, dan verifikasi langsung di Nurse Station Naray Hospital tanpa antre manual di loket.
              </p>
            </div>
          </div>
          <div className="shrink-0 self-start md:self-center">
            <Link 
              to="/dokter-jadwal" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap"
            >
              <span>Cek Jadwal Seluruh Poliklinik</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
