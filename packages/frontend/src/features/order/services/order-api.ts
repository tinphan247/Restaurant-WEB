const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const orderApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/orders`);
    return res.json();
  },
  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Order creation failed: ${res.status}`);
    }
    return res.json();
  },
  getById: async (id: string) => {
      const res = await fetch(`${API_URL}/api/orders/${id}`);
      return res.json();
  },
  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        throw new Error(`Failed to update status: ${res.status}`);
    }
    return res.json();
  }
};