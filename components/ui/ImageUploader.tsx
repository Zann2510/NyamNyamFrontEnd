'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
}

export default function ImageUploader({ onUploadSuccess, currentImage, onRemove }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diizinkan');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload response:', res.data);
      const imageUrl = res.data.data?.url;
      setPreview(imageUrl);
      onUploadSuccess(imageUrl);
      toast.success('Gambar berhasil diupload');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    if (onRemove) onRemove();
    else onUploadSuccess('');
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="max-h-32 rounded-md" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          <div className="flex flex-col items-center gap-2 py-4">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {uploading ? 'Mengupload...' : 'Klik untuk upload gambar'}
            </span>
          </div>
        </label>
      )}
    </div>
  );
}