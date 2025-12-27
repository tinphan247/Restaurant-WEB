import React, { useRef } from 'react';
import { type MenuItemPhoto } from '@shared/types/menu.d';

interface PhotoManagerProps {
  photos: MenuItemPhoto[];
  onUpload: (files: FileList) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetPrimary: (id: string) => Promise<void>;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({ photos, onUpload, onDelete, onSetPrimary }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Khu vực Upload */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          className="hidden" 
          accept="image/*"
        />
        <div className="text-gray-600">
          <p className="text-lg font-semibold">Nhấn để tải ảnh lên</p>
          <p className="text-sm">Hỗ trợ JPG, PNG, WebP (Tối đa 5MB/file)</p>
        </div>
      </div>

      {/* Danh sách ảnh hiển thị dạng Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative border rounded-lg overflow-hidden bg-gray-100 aspect-square">
            <img 
              src={`${import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app'}${photo.url}`} 
              alt="Menu item" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay điều khiển */}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end">
                <button 
                  onClick={() => onDelete(photo.id)}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <button 
                onClick={() => onSetPrimary(photo.id)}
                className={`text-xs py-1 px-2 rounded ${photo.isPrimary ? 'bg-yellow-500 text-white' : 'bg-white text-gray-800 hover:bg-yellow-400'}`}
              >
                {photo.isPrimary ? '★ Ảnh chính' : 'Đặt làm ảnh chính'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};