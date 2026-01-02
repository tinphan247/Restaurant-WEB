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
    return res.json();
  },
  getById: async (id: string) => {
      const res = await fetch(`${API_URL}/api/orders/${id}`);
      return res.json();
  }
};