import React from 'react';
import { type MenuCategory } from '@shared/types/menu.d';

interface CategoryGridProps {
  categories: MenuCategory[];
  onEdit: (category: MenuCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onEdit }) => {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50 uppercase text-xs font-medium text-gray-500">
          <tr>
            <th className="py-3 px-4 text-left">Tên danh mục</th>
            <th className="py-3 px-4 text-left">Thứ tự</th>
            <th className="py-3 px-4 text-left">Số món ăn</th>
            <th className="py-3 px-4 text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories?.length > 0 ? (
            categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-indigo-50 cursor-pointer transition" onClick={() => onEdit(cat)}>
                <td className="py-3 px-4 font-bold text-gray-800">{cat.name}</td>
                <td className="py-3 px-4 text-sm">{cat.displayOrder}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{cat.itemCount || 0} món</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                    cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cat.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">Không có danh mục nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};