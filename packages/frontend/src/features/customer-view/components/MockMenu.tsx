import React from 'react';

interface MockMenuProps {
  tableNumber: string;
  tableId: string;
}

// Dữ liệu menu giả để hiển thị
export const mockMenuItems = [
  {
    id: '1',
    category: 'Khai vị',
    items: [
      { name: 'Gỏi cuốn tôm thịt', price: 45000, description: '4 cuốn, kèm nước mắm chua ngọt' },
      { name: 'Chả giò rế', price: 55000, description: '6 cái, giòn rụm' },
      { name: 'Súp hải sản', price: 65000, description: 'Tôm, mực, nấm, rau củ' },
    ]
  },
  {
    id: '2',
    category: 'Món chính',
    items: [
      { name: 'Cơm chiên Dương Châu', price: 75000, description: 'Tôm, lạp xưởng, trứng, rau củ' },
      { name: 'Phở bò tái chín', price: 65000, description: 'Nước dùng hầm xương 12 tiếng' },
      { name: 'Bún bò Huế', price: 70000, description: 'Giò heo, thịt bò, chả Huế' },
      { name: 'Cá kho tộ', price: 120000, description: 'Cá basa kho tiêu, ăn kèm cơm trắng' },
    ]
  },
  {
    id: '3',
    category: 'Đồ uống',
    items: [
      { name: 'Trà đá', price: 5000, description: 'Miễn phí refill' },
      { name: 'Nước ngọt', price: 20000, description: 'Coca, Pepsi, 7Up' },
      { name: 'Sinh tố bơ', price: 35000, description: 'Bơ tươi, sữa đặc' },
      { name: 'Cà phê sữa đá', price: 25000, description: 'Cà phê phin truyền thống' },
    ]
  },
  {
    id: '4',
    category: 'Tráng miệng',
    items: [
      { name: 'Chè ba màu', price: 30000, description: 'Đậu xanh, đậu đỏ, nước cốt dừa' },
      { name: 'Bánh flan', price: 25000, description: 'Caramen trứng mềm mịn' },
      { name: 'Trái cây tươi', price: 40000, description: 'Theo mùa' },
    ]
  }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export const MockMenu: React.FC<MockMenuProps> = ({ tableNumber, tableId }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-700">🍽️ Nhà Hàng ABC</h1>
              <p className="text-sm text-gray-500">Chào mừng quý khách!</p>
            </div>
            <div className="bg-amber-100 px-4 py-2 rounded-full">
              <span className="font-semibold text-amber-800">Bàn {tableNumber}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Thông báo chào mừng */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Xác thực thành công!</h3>
              <p className="text-sm text-green-700 mt-1">
                Bạn đang xem menu của bàn <strong>{tableNumber}</strong>. Chọn món và gọi nhân viên để đặt hàng.
              </p>
            </div>
          </div>
        </div>

        {/* Menu Categories */}
        {mockMenuItems.map((category) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-amber-300">
              {category.category}
            </h2>
            <div className="space-y-3">
              {category.items.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <span className="font-bold text-amber-600 ml-4 whitespace-nowrap">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">📞 Cần hỗ trợ?</h3>
          <p className="text-sm text-gray-600">
            Gọi nhân viên bằng cách giơ tay hoặc nhấn nút gọi trên bàn. 
            Chúng tôi sẵn sàng phục vụ bạn!
          </p>
        </div>

        {/* Debug Info (có thể ẩn trong production) */}
        <div className="text-center text-xs text-gray-400 pb-6">
          Table ID: {tableId}
        </div>
      </div>
    </div>
  );
};
