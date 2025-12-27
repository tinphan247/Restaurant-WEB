import React, { useState, useEffect, useRef } from 'react';
import { photoApi } from '../../services/photoApi';
import { menuItemApi } from '../../services/menuItemApi';

/**
 * PhotoPage - Trang quản lý upload ảnh cho menu item
 * - Tìm kiếm món ăn bằng tên, hiển thị đề xuất động
 * - Chọn món ăn để upload ảnh
 * - Hiển thị danh sách ảnh đã upload cho từng món
 */
export const PhotoPage: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Tìm kiếm và chọn món ăn
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const fetchPhotos = async (itemId: string) => {
    try {
      const data = await photoApi.getByItem(itemId);
      setPhotos(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    // Debounce search to prevent flickering
    const timer = setTimeout(() => {
      if (search.length > 0) {
        menuItemApi.list({ q: search, limit: 10 })
          .then(res => {
            setSuggestions(res?.data || []);
          })
          .catch(err => {
            console.error('Failed to search menu items', err);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (selectedItem?.id) fetchPhotos(selectedItem.id);
    else setPhotos([]);
  }, [selectedItem]);

  const handleImportClick = () => {
    if (!selectedItem?.id) {
      alert("Vui lòng chọn món ăn trước khi import ảnh!");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedItem?.id) {
      alert("Vui lòng chọn món ăn trước khi import ảnh!");
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      try {
        await photoApi.upload(selectedItem.id, e.target.files);
        alert("Import hình ảnh thành công!");
        fetchPhotos(selectedItem.id); // Load lại ảnh mới
      } catch (err) { alert("Lỗi khi import!"); }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Thanh tìm kiếm món ăn */}
      <div className="mb-6 relative">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full"
          placeholder="Tìm món ăn..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {suggestions.length > 0 && (
          <div className="border rounded bg-white shadow mt-1 max-h-60 overflow-y-auto z-10 absolute w-full">
            {suggestions.map(item => (
              <div
                key={item.id}
                className={`px-3 py-2 cursor-pointer hover:bg-indigo-100 ${selectedItem?.id === item.id ? 'bg-indigo-50' : ''}`}
                onClick={() => {
                  setSelectedItem(item);
                  setSearch(item.name);
                  setSuggestions([]);
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Khu vực upload ảnh */}
      {!selectedItem ? (
        <div className="text-red-500 font-semibold text-center py-8">
          Vui lòng chọn món ăn trước khi import ảnh!
        </div>
      ) : (
        <div 
          onClick={handleImportClick}
          className="w-full h-48 border-2 border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all"
        >
          <span className="text-4xl mb-2">📸</span>
          <span className="text-indigo-600 font-semibold text-lg">Nhấn để Import hình ảnh cho: <b>{selectedItem.name}</b></span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            className="hidden" 
            accept="image/*" 
          />
        </div>
      )}

      {/* Hiển thị danh sách ảnh đã import */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {photos.map(p => (
          <div key={p.id} className="relative aspect-square border rounded-lg overflow-hidden group">
            <img
              src={p.url.startsWith('http') ? p.url : `${import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app'}${p.url.startsWith('/') ? p.url : '/' + p.url}`}
              className="w-full h-full object-cover"
              alt={selectedItem?.name}
            />
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs opacity-80 hover:opacity-100 z-10"
              onClick={async (e) => {
                e.stopPropagation();
                if (!selectedItem?.id) return;
                if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
                  try {
                    await photoApi.delete(selectedItem.id, p.id);
                    fetchPhotos(selectedItem.id);
                  } catch (err) {
                    alert('Xóa ảnh thất bại!');
                  }
                }
              }}
            >Xóa</button>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};