import React from 'react';
import { Shield, CheckCircle2, FileText, PhoneCall, CreditCard, Building2, UserCheck } from 'lucide-react';
import { insurancePartners, patientGuide } from '../data/hospitalData';

export function InsurancePartners() {
  const admissionSteps = [
    {
      step: '01',
      title: 'Pendaftaran & Verifikasi',
      desc: 'Tunjukkan KTP dan kartu asuransi atau BPJS di loket pendaftaran. Petugas akan melakukan verifikasi eligibilitas kepesertaan Anda secara langsung.'
    },
    {
      step: '02',
      title: 'Pemeriksaan Medis',
      desc: 'Pasien menuju poliklinik sesuai nomor antrean untuk berkonsultasi dengan dokter spesialis, pemeriksaan penunjang lab, atau radiologi.'
    },
    {
      step: '03',
      title: 'Penebusan Obat & Administrasi',
      desc: 'Resep elektronik langsung terkirim ke instalasi farmasi 24 jam. Pasien dapat mengambil obat setelah proses administrasi selesai tanpa biaya tunai untuk asuransi cashless.'
    }
  ];

  return (
    <section className="section-insurance-admission">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-compact text-center">
          <div className="section-tag">
            <CreditCard size={15} />
            <span>Kemitraan Asuransi &amp; Jaminan Pasien</span>
          </div>
          <h2 className="section-title-editorial">Mitra Asuransi Kesehatan &amp; Alur Pelayanan Pasien</h2>
          <p className="section-subtitle-editorial">
            Naray Hospital bekerjasama dengan berbagai penyedia jaminan kesehatan nasional dan asuransi swasta untuk kemudahan fasilitas cashless dan klaim terpadu di Kota Dumai.
          </p>
        </div>

        {/* Insurance Partners Strip */}
        <div className="insurance-partners-container">
          <span className="partners-strip-title">Menerima Pasien Jaminan &amp; Asuransi:</span>
          <div className="insurance-partner-chips">
            {insurancePartners.map((item, idx) => (
              <div key={idx} className="partner-chip">
                <Shield size={16} className="partner-shield-icon" />
                <span className="partner-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Guidance Steps */}
        <div className="admission-steps-panel">
          <div className="steps-header">
            <strong className="steps-header-title">Alur Pelayanan Pasien Rawat Jalan &amp; Inap</strong>
            <span className="steps-header-desc">Panduan ringkas bagi pasien dan keluarga untuk efisiensi waktu selama kunjungan</span>
          </div>

          <div className="admission-steps-grid">
            {admissionSteps.map((stepItem, idx) => (
              <div key={idx} className="admission-step-card">
                <div className="step-badge">{stepItem.step}</div>
                <h3 className="step-title">{stepItem.title}</h3>
                <p className="step-desc">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
