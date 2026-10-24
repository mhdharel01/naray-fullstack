import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  MessageSquare,
  QrCode
} from 'lucide-react';
import { branches, doctors, poliklinikList, hospitalInfo } from '../data/hospitalData';
import api from '../services/api';
import { useHospitalData } from '../context/HospitalDataContext';

export function AppointmentModal({ initialData, onClose, onShowToast }) {
  const { doctors: contextDoctors, poliklinikList: contextPolis } = useHospitalData();
  const doctorList = contextDoctors?.length ? contextDoctors : doctors;
  const poliList = contextPolis?.length ? contextPolis : poliklinikList;

  // Step: 1 (Polyclinic), 2 (Doctor & Time), 3 (Patient Info), 4 (Success Ticket)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialData?.specialtyGroup || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialData?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  
  // Patient Details
  const [patientType, setPatientType] = useState('new'); // 'new' | 'existing'
  const [medicalRecordNo, setMedicalRecordNo] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientNik, setPatientNik] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [insuranceType, setInsuranceType] = useState('Pribadi / Umum');
  const [insuranceName, setInsuranceName] = useState('');
  const [patientComplaint, setPatientComplaint] = useState(initialData?.note || '');

  // Generated Booking Ticket
  const [bookingTicket, setBookingTicket] = useState(null);

  // Pre-fill doctor if passed
  useEffect(() => {
    if (initialData?.id) {
      setSelectedDoctorId(initialData.id);
      setSelectedSpecialty(initialData.specialtyGroup || '');
      setStep(2); // Jump directly to time selection
    }
  }, [initialData]);

  const selectedDoctor = doctorList.find(d => String(d.id) === String(selectedDoctorId));

  const availableDoctors = doctorList.filter(d => {
    if (!selectedSpecialty) return true;
    return (d.specialtyGroup || '').toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
           (d.specialty || '').toLowerCase().includes(selectedSpecialty.toLowerCase());
  });

  const timeSlots = [
    "09:00 - 10:00 WIB",
    "10:00 - 11:00 WIB",
    "11:00 - 12:00 WIB",
    "13:30 - 14:30 WIB",
    "14:30 - 15:30 WIB",
    "15:30 - 16:30 WIB",
    "17:00 - 18:00 WIB",
    "19:00 - 20:00 WIB",
    "20:00 - 21:00 WIB"
  ];

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedDoctorId) {
        alert("Silakan pilih dokter spesialis terlebih dahulu.");
        return;
      }
      if (!selectedTimeSlot) {
        alert("Silakan pilih sesi jam konsultasi.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!patientName.trim()) {
        alert("Silakan isi nama lengkap pasien.");
        return;
      }
      if (!patientPhone.trim()) {
        alert("Silakan isi nomor handphone / WhatsApp pasien.");
        return;
      }

      setIsSubmitting(true);
      let bookingCode = `NR-${Math.floor(100000 + Math.random() * 900000)}`;
      let queueNumber = `B-${Math.floor(10 + Math.random() * 89)}`;
      let savedToDb = false;

      try {
        const payload = {
          patient_name: patientName,
          patient_phone: patientPhone,
          patient_email: patientEmail,
          doctor_id: selectedDoctor?.id,
          doctor_name: selectedDoctor?.name,
          poliklinik_name: selectedSpecialty,
          scheduled_date: selectedDate,
          scheduled_time: selectedTimeSlot,
          insurance: insuranceType === 'Asuransi Swasta' ? `${insuranceType} (${insuranceName})` : insuranceType,
          notes: patientComplaint ? `Keluhan: ${patientComplaint}` : 'Pendaftaran Pasien Online Naray'
        };

        const res = await api.createAppointment(payload);
        if (res?.data) {
          bookingCode = res.data.booking_code || bookingCode;
          queueNumber = res.data.queue_number || queueNumber;
          savedToDb = true;
        }
      } catch (err) {
        console.warn('Gagal menyimpan ke database backend (menggunakan mode lokal):', err);
      } finally {
        setIsSubmitting(false);
      }
      
      const ticket = {
        bookingCode,
        queueNumber,
        branch: "Naray Hospital Dumai (Jl. Dr. Wahidin No.98-99)",
        doctor: selectedDoctor?.name || "dr. Rizka Nadia, Sp.PD",
        specialty: selectedDoctor?.specialty || "Spesialis Penyakit Dalam",
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        patientName,
        patientPhone,
        insurance: insuranceType === 'Asuransi Swasta' ? `${insuranceType} (${insuranceName})` : insuranceType,
        savedToDatabase: savedToDb,
        createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      setBookingTicket(ticket);
      setStep(4);
      if (onShowToast) {
        onShowToast(`Janji temu berhasil dibuat! Kode: ${bookingCode}`);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWa = () => {
    if (!bookingTicket) return;
    const text = `*TIKET JANJI TEMU NARAY HOSPITAL DUMAI*\n\nKode Booking: *${bookingTicket.bookingCode}*\nNomor Antrean: *${bookingTicket.queueNumber}*\nPasien: *${bookingTicket.patientName}*\nDokter: *${bookingTicket.doctor}*\nTanggal: *${bookingTicket.date}*\nJam: *${bookingTicket.timeSlot}*\nPenjamin: *${bookingTicket.insurance}*\n\nLokasi: Naray Hospital Dumai\nJl. Dr. Wahidin No.98-99, Purnama, Dumai Barat\nHarap tiba 15 menit sebelum waktu konsultasi. Terima kasih.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-booking glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Tutup Modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="booking-modal-header">
          <div className="booking-modal-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="booking-modal-title">Buat Janji Temu Pasien Online</h2>
            <p className="booking-modal-subtitle">Naray Hospital Dumai - Serve With Heart</p>
          </div>
        </div>

        {/* Wizard Step Progress */}
        <div className="booking-steps-bar">
          <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 1 ? <CheckCircle2 size={16} /> : '1'}</div>
            <span className="step-label">Pilih Poliklinik</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 2 ? <CheckCircle2 size={16} /> : '2'}</div>
            <span className="step-label">Dokter & Jam</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 3 ? <CheckCircle2 size={16} /> : '3'}</div>
            <span className="step-label">Data Pasien</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step === 4 ? 'active completed' : ''}`}>
            <div className="step-circle">4</div>
            <span className="step-label">Tiket Digital</span>
          </div>
        </div>

        {/* Step 1: Polyclinic Selection */}
        {step === 1 && (
          <div className="booking-step-content">
            <h3 className="step-section-heading">Langkah 1: Pilih Poliklinik Spesialis</h3>
            
            <div className="form-group">
              <label className="form-label">Pilih dari 13 Poliklinik Spesialis Naray Hospital:</label>
              <div className="poli-select-grid">
                {poliList.map(p => (
                  <div 
                    key={p.id} 
                    className={`poli-select-card ${selectedSpecialty === p.name.replace(/.*Poliklinik\s+/, '') ? 'selected' : ''}`}
                    onClick={() => setSelectedSpecialty(p.name.replace(/.*Poliklinik\s+/, ''))}
                  >
                    <span className="poli-select-emoji">{p.icon}</span>
                    <div className="poli-select-text">
                      <strong>{p.name}</strong>
                      <span>{p.desc.slice(0, 45)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Doctor & Time */}
        {step === 2 && (
          <div className="booking-step-content">
            <h3 className="step-section-heading">Langkah 2: Pilih Dokter Spesialis & Sesi Konsultasi</h3>
            
            <div className="form-group">
              <label className="form-label">Pilih Dokter ({availableDoctors.length} Dokter Tersedia):</label>
              <div className="doctor-select-grid">
                {availableDoctors.map(doc => (
                  <div 
                    key={doc.id} 
                    className={`doctor-select-card ${selectedDoctorId === doc.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDoctorId(doc.id)}
                  >
                    <img src={doc.photo} alt={doc.name} className="doc-avatar" />
                    <div className="doc-select-info">
                      <strong>{doc.name}</strong>
                      <span>{doc.specialty}</span>
                      <small className="doc-select-exp">{doc.experience}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="booking-time-grid mt-4">
              <div className="form-group">
                <label className="form-label">Pilih Tanggal Kunjungan:</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pilih Sesi Jam Konsultasi:</label>
                <div className="time-slots-grid">
                  {timeSlots.map((slot, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`time-slot-btn ${selectedTimeSlot === slot ? 'active' : ''}`}
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      <Clock size={13} />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Patient Information */}
        {step === 3 && (
          <div className="booking-step-content">
            <h3 className="step-section-heading">Langkah 3: Lengkapi Data Pasien</h3>

            {/* Patient Type Switch */}
            <div className="patient-type-tabs">
              <button 
                type="button"
                className={`patient-type-btn ${patientType === 'new' ? 'active' : ''}`}
                onClick={() => setPatientType('new')}
              >
                Pasien Baru (Belum Memiliki No. RM)
              </button>
              <button 
                type="button"
                className={`patient-type-btn ${patientType === 'existing' ? 'active' : ''}`}
                onClick={() => setPatientType('existing')}
              >
                Pasien Lama (Sudah Terdaftar di Naray Hospital)
              </button>
            </div>

            {patientType === 'existing' && (
              <div className="form-group">
                <label className="form-label">Nomor Rekam Medis (Medical Record):</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: RM-987654"
                  value={medicalRecordNo}
                  onChange={(e) => setMedicalRecordNo(e.target.value)}
                />
              </div>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nama Lengkap Pasien *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Sesuai KTP / KK"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor NIK KTP (16 Digit)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="3171xxxxxxxxxxxx"
                  value={patientNik}
                  onChange={(e) => setPatientNik(e.target.value)}
                  maxLength={16}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nomor Handphone / WhatsApp *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Contoh: 081234567890"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Pasien (Opsional)</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="nama@email.com"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Jenis Penjamin Pembayaran:</label>
                <select 
                  value={insuranceType} 
                  onChange={(e) => setInsuranceType(e.target.value)}
                  className="form-select"
                >
                  <option value="Pribadi / Umum">Pembayaran Pribadi / Umum</option>
                  <option value="Asuransi Swasta">Asuransi Swasta / Rekanan</option>
                  <option value="Mandiri Inhealth">Mandiri Inhealth</option>
                  <option value="BPJS Kesehatan">BPJS Kesehatan (Rujukan Faskes 1)</option>
                </select>
              </div>

              {insuranceType === 'Asuransi Swasta' && (
                <div className="form-group">
                  <label className="form-label">Nama Perusahaan Asuransi:</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Sinarmas / AdMedika..."
                    value={insuranceName}
                    onChange={(e) => setInsuranceName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Keluhan Singkat Pasien:</label>
              <textarea 
                className="form-input" 
                rows="2"
                placeholder="Jelaskan secara singkat keluhan yang dialami..."
                value={patientComplaint}
                onChange={(e) => setPatientComplaint(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Digital Confirmation Ticket */}
        {step === 4 && bookingTicket && (
          <div className="booking-step-content booking-success-content">
            <div className="success-banner">
              <div className="success-icon-wrap">
                <CheckCircle2 size={36} className="icon-emerald" />
              </div>
              <h3>Pendaftaran Janji Temu Berhasil!</h3>
              <p>Tiket digital reservasi Anda telah terbit di sistem Naray Hospital.</p>
            </div>

            {/* Digital Boarding Pass Ticket */}
            <div className="digital-ticket-card">
              <div className="ticket-header">
                <div className="ticket-hospital-brand">
                  <img src="/images/logo/logo.jpeg" alt="Naray Hospital" className="ticket-logo" />
                  <div>
                    <strong>NARAY HOSPITAL DUMAI</strong>
                    <span>Digital Appointment Pass</span>
                  </div>
                </div>
                <div className="ticket-status-badge">
                  <span>TERKONFIRMASI</span>
                </div>
              </div>

              <div className="ticket-body">
                <div className="ticket-code-row">
                  <div>
                    <span className="ticket-meta-label">KODE BOOKING</span>
                    <strong className="ticket-code-value">{bookingTicket.bookingCode}</strong>
                  </div>
                  <div>
                    <span className="ticket-meta-label">NOMOR ANTREAN</span>
                    <strong className="ticket-queue-value">{bookingTicket.queueNumber}</strong>
                  </div>
                </div>

                <div className="ticket-info-grid">
                  <div className="ticket-info-item">
                    <span className="ticket-meta-label">NAMA PASIEN</span>
                    <strong>{bookingTicket.patientName}</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span className="ticket-meta-label">LOKASI RUMAH SAKIT</span>
                    <strong>{bookingTicket.branch}</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span className="ticket-meta-label">DOKTER SPESIALIS</span>
                    <strong>{bookingTicket.doctor}</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span className="ticket-meta-label">JADWAL KONSULTASI</span>
                    <strong>{bookingTicket.date} • {bookingTicket.timeSlot}</strong>
                  </div>
                  <div className="ticket-info-item">
                    <span className="ticket-meta-label">PENJAMIN PEMBAYARAN</span>
                    <span>{bookingTicket.insurance}</span>
                  </div>
                  <div className="ticket-info-item">
                    <span className="ticket-meta-label">STATUS DATABASE</span>
                    <span className={bookingTicket.savedToDatabase ? "text-emerald font-semibold" : "text-amber-600 font-semibold"}>
                      {bookingTicket.savedToDatabase ? '✅ Tersimpan di Database MySQL (Aktif)' : '⚠️ Tersimpan Lokal (Offline)'}
                    </span>
                  </div>
                </div>

                {/* QR Code Simulation */}
                <div className="ticket-qr-section">
                  <div className="ticket-qr-box">
                    <QrCode size={90} className="qr-icon" />
                    <span>Scan di Kiosk Mandiri RS</span>
                  </div>
                  <div className="ticket-instructions">
                    <strong>Petunjuk Kedatangan:</strong>
                    <ol>
                      <li>Tiba di Naray Hospital 15 menit sebelum jam konsultasi untuk konfirmasi pendaftaran.</li>
                      <li>Tunjukkan QR Code ini kepada petugas admisi di lantai 1.</li>
                      <li>Bawa KTP/kartu identitas dan kartu asuransi jika menggunakan penjamin.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="ticket-actions-bar">
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={16} />
                  <span>Cetak Tiket</span>
                </button>
                <button className="btn btn-gold" onClick={handleShareWa}>
                  <MessageSquare size={16} />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Wizard Navigation Controls */}
        <div className="booking-modal-footer">
          {step > 1 && step < 4 && (
            <button 
              type="button" 
              className="btn btn-outline btn-prev"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft size={16} />
              <span>Sebelumnya</span>
            </button>
          )}

          {step < 4 ? (
            <button 
              type="button" 
              className="btn btn-primary btn-next ml-auto"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Menyimpan ke Database...' : (step === 3 ? 'Konfirmasi & Buat Tiket' : 'Lanjutkan')}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-navy ml-auto"
              onClick={onClose}
            >
              <span>Selesai & Tutup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
