import { useEffect, useState } from 'react';
import modifierApi from '../../services/modifierApi';
import menuItemApi from '../../services/menuItemApi';
import type { ModifierGroupWithOptions } from '../../services/modifierApi';
import type { MenuItemDropdown } from '../../services/menuItemApi';

export default function AttachModifiersToItem() {
  const [itemId, setItemId] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItemDropdown[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<ModifierGroupWithOptions[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await modifierApi.getModifierGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tải được danh sách modifier groups');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      setLoadingItems(true);
      const data = await menuItemApi.getMenuItems();
      setMenuItems(data);
    } catch (err: any) {
      console.error('Failed to load menu items:', err);
      setMenuItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadGroups();
    loadMenuItems();
  }, []);

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter menu items based on search query
  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected item info
  const selectedItem = menuItems.find(item => item.id === itemId);

  const handleAttach = async () => {
    setError(null);
    setSuccess(null);
    if (!itemId) {
      setError('Vui lòng chọn một món từ danh sách');
      return;
    }
    if (selectedGroups.size === 0) {
      setError('Chọn ít nhất 1 modifier group để gắn vào món');
      return;
    }

    try {
      setIsSubmitting(true);
      await modifierApi.attachGroupsToItem(itemId, {
        modifierGroupIds: Array.from(selectedGroups),
      });
      setSuccess(`Đã gắn ${selectedGroups.size} modifier group(s) vào món "${selectedItem?.name}" thành công`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gắn modifiers vào món');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetach = async (groupId: string) => {
    setError(null);
    setSuccess(null);
    if (!itemId) {
      setError('Vui lòng chọn một món từ danh sách');
      return;
    }
    try {
      setIsSubmitting(true);
      await modifierApi.detachGroupFromItem(itemId, groupId);
      setSuccess('Đã gỡ modifier group khỏi món');
      setSelectedGroups(prev => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gỡ modifier group khỏi món');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Gắn Modifiers vào Món</h1>
      <p className="text-gray-600 mb-6">Chọn món từ danh sách, chọn modifier groups và lưu.</p>

      <div className="space-y-4 mb-6">
        {/* Menu Item Selector */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Chọn Món <span className="text-red-500">*</span>
          </label>
          
          {loadingItems ? (
            <div className="text-sm text-gray-500">Đang tải danh sách món...</div>
          ) : (
            <>
              {/* Search box */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="🔍 Tìm món theo tên..."
              />
              
              {/* Dropdown */}
              <select
                className="w-full border rounded p-2"
                value={itemId}
                onChange={e => setItemId(e.target.value)}
              >
                <option value="">-- Chọn món --</option>
                {filteredItems?.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.price.toLocaleString('vi-VN')}đ
                    {item.categoryName ? ` (${item.categoryName})` : ''}
                    {item.status !== 'available' ? ` [${item.status}]` : ''}
                  </option>
                ))}
              </select>

              {/* Selected item preview */}
              {selectedItem && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm font-medium text-blue-900">{selectedItem.name}</div>
                  <div className="text-xs text-blue-700 mt-1">
                    Giá: {selectedItem.price.toLocaleString('vi-VN')}đ
                    {selectedItem.description && ` • ${selectedItem.description}`}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    ID: {selectedItem.id}
                  </div>
                </div>
              )}
              
              {searchQuery && filteredItems.length === 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Không tìm thấy món nào phù hợp với "{searchQuery}"
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">{success}</div>}

      {loading ? (
        <div className="text-center py-10">Đang tải modifier groups...</div>
      ) : (
        <div className="grid gap-4">
          {groups?.map(group => {
            const checked = selectedGroups.has(group.id);
            return (
              <div key={group.id} className="bg-white shadow rounded p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGroup(group.id)}
                        className="h-4 w-4"
                        id={`group-${group.id}`}
                      />
                      <label htmlFor={`group-${group.id}`} className="font-semibold cursor-pointer">
                        {group.name}
                      </label>
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                        {group.selectionType === 'single' ? 'Single' : 'Multiple'}
                      </span>
                      {group.isRequired && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Required</span>
                      )}
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                        {group.status}
                      </span>
                    </div>
                    {group.selectionType === 'multiple' && (
                      <p className="text-sm text-gray-600 mt-1">
                        Min: {group.minSelections ?? 0} | Max: {group.maxSelections ?? 'Unlimited'}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">Options: {group.options.length}</p>
                  </div>
                  {checked && (
                    <button
                      onClick={() => handleDetach(group.id)}
                      disabled={isSubmitting || !itemId}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gỡ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleAttach}
          disabled={isSubmitting || selectedGroups.size === 0 || !itemId}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : `Lưu gắn modifiers (${selectedGroups.size})`}
        </button>
      </div>
    </div>
  );
}
