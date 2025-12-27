import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CreateMenuItemDto,
  MenuCategory,
  MenuItem,
  MenuItemQueryDto,
  MenuItemStatus,
  UpdateMenuItemDto,
} from '@shared/types/menu.d';
import menuItemApi from '../../services/menuItemApi';
import { categoryApi } from '../../services/categoryApi';

function formatMoneyVnd(value: number) {
  // Fallback formatting (repo doesn't have a shared formatter)
  return value.toLocaleString('vi-VN');
}

function statusBadge(status: MenuItemStatus) {
  const cls =
    status === 'available'
      ? 'bg-green-100 text-green-800'
      : status === 'sold_out'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800';

  return <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${cls}`}>{status}</span>;
}

function parseBackendError(err: unknown): string {
  const anyErr = err as any;
  const msg = anyErr?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  const codeMsg = anyErr?.response?.data?.message?.message;
  if (typeof codeMsg === 'string') return codeMsg;
  return (anyErr?.message as string) || 'Thao tác thất bại';
}

export const MenuItemsPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [query, setQuery] = useState<MenuItemQueryDto>({
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'DESC',
  });

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await categoryApi.getAll({ page: 1, limit: 100 });
      setCategories(res.data ?? []);
    } catch (e) {
      console.error('Failed to load categories', e);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuItemApi.list(query);
      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      console.error('Failed to load menu items', e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onSaved = async () => {
    closeModal();
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa (soft delete) món này?')) return;
    try {
      await menuItemApi.remove(id);
      await fetchItems();
    } catch (e: unknown) {
      alert(parseBackendError(e));
    }
  };

  const handleStatusQuickChange = async (id: string, status: MenuItemStatus) => {
    try {
      await menuItemApi.updateStatus(id, status);
      await fetchItems();
    } catch (e: unknown) {
      alert(parseBackendError(e));
    }
  };

  const canPrev = (query.page ?? 1) > 1;
  const canNext = (query.page ?? 1) * (query.limit ?? 10) < total;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Quản Lý Món Ăn</h2>
          <p className="text-gray-600 mt-1">CRUD + filter/sort/paging</p>
        </div>
        <button
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
          onClick={openCreate}
          disabled={loadingCategories}
        >
          + Thêm Món
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        <input
          className="border rounded-md p-2 md:col-span-2"
          placeholder="Tìm theo tên (q)"
          value={query.q ?? ''}
          onChange={e => setQuery(prev => ({ ...prev, q: e.target.value || undefined, page: 1 }))}
        />

        <select
          className="border rounded-md p-2"
          value={query.categoryId ?? ''}
          onChange={e => setQuery(prev => ({ ...prev, categoryId: e.target.value || undefined, page: 1 }))}
          disabled={loadingCategories}
        >
          <option value="">Tất cả category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md p-2"
          value={query.status ?? ''}
          onChange={e => {
            const v = e.target.value;
            const nextStatus = v === '' ? undefined : (v as MenuItemStatus);
            setQuery(prev => ({ ...prev, status: nextStatus, page: 1 }));
          }}
        >
          <option value="">Tất cả status</option>
          <option value="available">available</option>
          <option value="unavailable">unavailable</option>
          <option value="sold_out">sold_out</option>
        </select>

        <select
          className="border rounded-md p-2"
          value={query.chefRecommended === undefined ? '' : query.chefRecommended ? 'true' : 'false'}
          onChange={e => {
            const v = e.target.value;
            setQuery(prev => ({
              ...prev,
              chefRecommended: v === '' ? undefined : v === 'true',
              page: 1,
            }));
          }}
        >
          <option value="">Chef picks (all)</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>

        <div className="flex gap-2 md:col-span-2">
          <select
            className="border rounded-md p-2 flex-1"
            value={query.sort ?? 'createdAt'}
            onChange={e => setQuery(prev => ({ ...prev, sort: e.target.value as any, page: 1 }))}
          >
            <option value="createdAt">Sort: createdAt</option>
            <option value="price">Sort: price</option>
            <option value="popularity">Sort: popularity</option>
          </select>
          <select
            className="border rounded-md p-2"
            value={query.order ?? 'DESC'}
            onChange={e => setQuery(prev => ({ ...prev, order: e.target.value as any, page: 1 }))}
          >
            <option value="DESC">DESC</option>
            <option value="ASC">ASC</option>
          </select>
          <select
            className="border rounded-md p-2"
            value={String(query.limit ?? 10)}
            onChange={e => setQuery(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center py-12 text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50 uppercase text-xs font-medium text-gray-500">
              <tr>
                <th className="py-3 px-4 text-left">Tên món</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Giá</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Chef</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items?.length > 0 ? (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-indigo-50 transition">
                    <td className="py-3 px-4 font-bold text-gray-800 cursor-pointer" onClick={() => openEdit(item)}>
                      {item.name}
                      {item.description ? <div className="text-xs text-gray-500 font-normal mt-1">{item.description}</div> : null}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {categoryNameById.get(item.categoryId) ?? item.categoryId}
                    </td>
                    <td className="py-3 px-4 text-sm">{formatMoneyVnd(Number(item.price))}đ</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {statusBadge(item.status)}
                        <select
                          className="border rounded px-2 py-1 text-xs"
                          value={item.status}
                          onChange={e => handleStatusQuickChange(item.id, e.target.value as MenuItemStatus)}
                          title="Cập nhật nhanh status"
                        >
                          <option value="available">available</option>
                          <option value="unavailable">unavailable</option>
                          <option value="sold_out">sold_out</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{item.isChefRecommended ? '✅' : '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 mr-2"
                        onClick={() => openEdit(item)}
                      >
                        Sửa
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        onClick={() => handleDelete(item.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Không có dữ liệu hoặc lỗi kết nối.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paging */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            disabled={!canPrev}
            onClick={() => setQuery(prev => ({ ...prev, page: Math.max((prev.page ?? 1) - 1, 1) }))}
          >
            Prev
          </button>
          <div className="text-sm">Page {query.page ?? 1}</div>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            disabled={!canNext}
            onClick={() => setQuery(prev => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <MenuItemModal
          categories={categories}
          loadingCategories={loadingCategories}
          item={editingItem}
          saving={saving}
          onClose={closeModal}
          onSave={async (payload, mode) => {
            setSaving(true);
            try {
              if (mode === 'create') {
                await menuItemApi.create(payload as CreateMenuItemDto);
              } else {
                await menuItemApi.update((editingItem as MenuItem).id, payload as UpdateMenuItemDto);
              }
              await onSaved();
            } catch (e: unknown) {
              alert(parseBackendError(e));
            } finally {
              setSaving(false);
            }
          }}
        />
      )}
    </div>
  );
};

function MenuItemModal(props: {
  categories: MenuCategory[];
  loadingCategories: boolean;
  item: MenuItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateMenuItemDto | UpdateMenuItemDto, mode: 'create' | 'edit') => Promise<void>;
}) {
  const isEdit = !!props.item;

  const [form, setForm] = useState({
    categoryId: props.item?.categoryId ?? '',
    name: props.item?.name ?? '',
    price: props.item?.price ? String(props.item.price) : '',
    prepTimeMinutes: props.item?.prepTimeMinutes !== undefined ? String(props.item.prepTimeMinutes) : '',
    description: props.item?.description ?? '',
    status: (props.item?.status ?? 'available') as MenuItemStatus,
    isChefRecommended: props.item?.isChefRecommended ?? false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const base = {
      categoryId: form.categoryId,
      name: form.name,
      price: Number(form.price),
      description: form.description || undefined,
      prepTimeMinutes: form.prepTimeMinutes === '' ? undefined : Number(form.prepTimeMinutes),
      status: form.status,
      isChefRecommended: form.isChefRecommended,
    };

    if (!isEdit) {
      await props.onSave(base as CreateMenuItemDto, 'create');
    } else {
      await props.onSave(base as UpdateMenuItemDto, 'edit');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">{isEdit ? 'Sửa Món' : 'Thêm Món'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="mt-1 block w-full border rounded-md p-2"
              value={form.categoryId}
              onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
              disabled={props.loadingCategories}
              required
            >
              <option value="">-- Chọn category --</option>
              {props.categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tên món</label>
            <input
              className="mt-1 block w-full border rounded-md p-2"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              minLength={2}
              maxLength={80}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Giá</label>
              <input
                type="number"
                className="mt-1 block w-full border rounded-md p-2"
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                min={0.01}
                step={0.01}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prep time (minutes)</label>
              <input
                type="number"
                className="mt-1 block w-full border rounded-md p-2"
                value={form.prepTimeMinutes}
                onChange={e => setForm(prev => ({ ...prev, prepTimeMinutes: e.target.value }))}
                min={0}
                max={240}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full border rounded-md p-2"
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value as MenuItemStatus }))}
            >
              <option value="available">available</option>
              <option value="unavailable">unavailable</option>
              <option value="sold_out">sold_out</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              className="mt-1 block w-full border rounded-md p-2"
              rows={3}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isChefRecommended}
              onChange={e => setForm(prev => ({ ...prev, isChefRecommended: e.target.checked }))}
            />
            Chef recommended
          </label>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button type="button" onClick={props.onClose} className="px-4 py-2 text-gray-600">
            Hủy
          </button>
          <button
            type="submit"
            disabled={props.saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {props.saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
}
