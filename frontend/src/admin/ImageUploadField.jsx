import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

/**
 * Kompresi gambar sisi klien menggunakan HTML5 Canvas
 * Menghasilkan file WebP/JPEG super ringan (umumnya berkurang 70%-90%)
 */
async function compressImageClientSide(file, maxWidth = 1400, maxHeight = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    // Pastikan benar-benar tipe mime gambar
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan merupakan berkas gambar.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas gambar tidak didukung atau rusak.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width >= height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback ke file asli jika canvas tidak didukung
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prioritaskan WebP untuk kompresi maksimal, fallback ke JPEG
        const outputType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const safeName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], safeName, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              width,
              height,
            });
          },
          outputType,
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

const BACKEND_BASE = (import.meta.env.VITE_API_BASE_URL !== undefined
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.PROD ? '' : 'http://127.0.0.1:8000')).replace(/\/api\/?$/, '');

function resolveImgSrc(val, fallback) {
  if (!val || typeof val !== 'string' || !val.trim()) return fallback;
  const clean = val.trim();
  if (clean.includes('unsplash.com')) return fallback;
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }
  if (clean.startsWith('/storage/')) {
    return `${BACKEND_BASE}${clean}`;
  }
  if (clean.startsWith('storage/')) {
    return `${BACKEND_BASE}/${clean}`;
  }
  return clean;
}

export function ImageUploadField({
  label = 'Unggah Gambar',
  value = '',
  onChange,
  folder = 'general',
  required = false,
  isRound = false,
  helperText = 'Format: JPG, PNG, WEBP. Otomatis dikompresi menjadi sangat ringan & aman.',
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadStats, setUploadStats] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewFallback = isRound ? '/images/default-doctor.svg' : '/images/default-image.svg';
  const previewSrc = resolveImgSrc(value, previewFallback);

  const handleSelectFile = async (selectedFile) => {
    if (!selectedFile) return;

    // 1. Validasi tipe file ketat di sisi klien
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validMimes.includes(selectedFile.type.toLowerCase())) {
      setUploadError('Hanya format JPG, PNG, WEBP, atau GIF yang diizinkan. Berkas skrip/SVG ditolak.');
      return;
    }

    // Batas file lokal maksimal 15MB
    if (selectedFile.size > 15 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 15MB sebelum kompresi.');
      return;
    }

    setUploadError('');
    setIsUploading(true);
    setUploadStats(null);

    try {
      // 2. Kompresi gambar sisi klien terlebih dahulu (Kualitas tinggi untuk banner beranda)
      const isBanner = folder === 'banners';
      const targetMaxWidth = isBanner ? 2048 : 1600;
      const targetMaxHeight = isBanner ? 1200 : 1600;
      const targetQuality = isBanner ? 0.92 : 0.85;

      const compressionResult = await compressImageClientSide(
        selectedFile,
        targetMaxWidth,
        targetMaxHeight,
        targetQuality
      );
      const fileToSend = compressionResult.file || selectedFile;

      // 3. Kirim ke backend Laravel untuk verifikasi biner GD & penyimpanan aman
      const validFolders = ['doctors', 'articles', 'rooms', 'facilities', 'centers', 'media', 'banners', 'avatars', 'leadership', 'general'];
      const safeFolder = validFolders.includes(folder) ? folder : (folder === 'banner' ? 'banners' : 'general');

      const formData = new FormData();
      formData.append('image', fileToSend);
      formData.append('folder', safeFolder);

      const response = await api.adminUploadImage(formData);

      if (response && response.success && response.data?.url) {
        onChange(response.data.url);
        const serverWarning = response.data.warning || (isBanner && compressionResult.width < 900 
          ? `Perhatian: Resolusi foto (${compressionResult.width}x${compressionResult.height} px) tergolong kecil untuk banner layar lebar desktop. Disarankan menggunakan foto minimal 1280x720 px atau 1920x1080 px agar tidak burik/pecah.`
          : null);

        setUploadStats({
          orig: formatBytes(compressionResult.originalSize || selectedFile.size),
          final: response.data.size_formatted || formatBytes(fileToSend.size),
          dimensions: response.data.dimensions || `${compressionResult.width}x${compressionResult.height}`,
          warning: serverWarning,
        });
      } else {
        throw new Error(response.message || 'Gagal menyimpan gambar di server.');
      }
    } catch (err) {
      console.error('[ImageUploadField] Upload error:', err);
      setUploadError(err.message || 'Gagal mengunggah gambar. Pastikan file valid.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleSelectFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleSelectFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setUploadStats(null);
    setUploadError('');
  };

  return (
    <div className="admin-form-full admin-image-upload-wrapper">
      <label className="admin-upload-label">
        <span>{label}</span>
        {required && <span className="req">*</span>}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Main Container */}
      {value ? (
        <div className={`admin-image-preview-card ${isRound ? 'is-round' : ''}`}>
          <div className="admin-image-thumb-box">
            <img
              src={previewSrc}
              alt="Preview"
              className={isRound ? 'thumb-round' : 'thumb-rect'}
              onError={(e) => {
                e.target.src = previewFallback;
              }}
            />
          </div>

          <div className="admin-image-preview-details">
            <div className="admin-image-status-badge">
              <CheckCircle2 size={15} color="#059669" />
              <span>Gambar Tersimpan di Sistem</span>
            </div>

            {uploadStats ? (
              <p className="admin-image-size-info">
                Dioptimasi: <strong>{uploadStats.final}</strong> (dari {uploadStats.orig}) • {uploadStats.dimensions} px
              </p>
            ) : (
              <p className="admin-image-url-preview">{value}</p>
            )}

            {uploadStats?.warning && (
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                color: '#92400E',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                lineHeight: 1.4,
                marginBottom: '8px'
              }}>
                ⚠️ {uploadStats.warning}
              </div>
            )}

            <div className="admin-image-actions">
              <button
                type="button"
                className="btn-admin-img-action btn-replace"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <RefreshCw size={13} className={isUploading ? 'admin-spin' : ''} />
                <span>{isUploading ? 'Mengompres...' : 'Ganti Gambar'}</span>
              </button>
              <button
                type="button"
                className="btn-admin-img-action btn-remove"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <Trash2 size={13} />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`admin-image-dropzone ${isDragging ? 'is-dragging' : ''} ${isUploading ? 'is-uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="admin-dropzone-loading">
              <div className="admin-spinner-small" style={{ width: 28, height: 28 }} />
              <p className="loading-title">Sedang Mengompresi &amp; Mengunggah Gambar...</p>
              <span className="loading-sub">Mengonversi ke WebP aman &amp; super ringan</span>
            </div>
          ) : (
            <div className="admin-dropzone-content">
              <div className="dropzone-icon-circle">
                <UploadCloud size={24} />
              </div>
              <div className="dropzone-text-group">
                <p className="dropzone-prompt">
                  <strong>Klik untuk memilih gambar</strong> atau seret &amp; lepas berkas ke sini
                </p>
                <p className="dropzone-sub">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="admin-upload-error-banner">
          <AlertCircle size={15} />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}

export default ImageUploadField;
