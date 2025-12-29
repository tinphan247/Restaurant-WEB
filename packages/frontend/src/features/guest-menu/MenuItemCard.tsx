import { useState } from 'react';
import type { GuestMenuItem } from './GuestMenuPage';
import ModifierSelector from './ModifierSelector';
import { useCart } from '../../contexts/CartContext';

interface MenuItemCardProps {
  item: GuestMenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();
  const [showModifiers, setShowModifiers] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});

  const calculateTotalPrice = (): number => {
    let total = item.price;

    // Add price adjustments from selected modifiers
    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = item.modifierGroups.find(g => g.id === groupId);
      if (group) {
        optionIds.forEach(optionId => {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            total += option.priceAdjustment;
          }
        });
      }
    });

    return total;
  };

  const handleAddToCart = () => {
    // Validate required modifier groups
    const missingRequired = item.modifierGroups
      .filter(g => g.isRequired)
      .filter(g => !selectedModifiers[g.id] || selectedModifiers[g.id].length === 0);

    if (missingRequired.length > 0) {
      alert(`Please select options for: ${missingRequired.map(g => g.name).join(', ')}`);
      return;
    }

    // Add to cart using context
    addItem({
      menuItemId: item.id,
      menuItemName: item.name,
      basePrice: item.price,
      quantity: 1,
      selectedModifiers,
      modifierGroups: item.modifierGroups.map(g => ({
        id: g.id,
        name: g.name,
        options: g.options.map(o => ({
          id: o.id,
          name: o.name,
          priceAdjustment: o.priceAdjustment,
        })),
      })),
    });

    // Reset state and show success
    setSelectedModifiers({});
    setShowModifiers(false);
    
  };

  const isSoldOut = item.status === 'sold_out';
  const isUnavailable = item.status === 'unavailable';

  // Helper to resolve image URL (handles relative and absolute)
  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    // Use VITE_BACKEND_URL if set, fallback to production
    const backend = import.meta.env.VITE_BACKEND_URL || 'https://restaurant-web-five-wine.vercel.app';
    return `${backend}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.primaryPhotoUrl ? (
          <img
            src={getImageUrl(item.primaryPhotoUrl)}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
            style={{ maxHeight: '12rem', maxWidth: '80%', objectFit: 'cover', display: 'block', margin: '0 auto' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}

        {/* Status Badges */}
        {item.isChefRecommended && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            Chef's Pick
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            Sold Out
          </div>
        )}
        {isUnavailable && (
          <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded">
            Unavailable
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
        
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price and Prep Time */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-bold text-blue-600">
            ${showModifiers ? calculateTotalPrice().toFixed(2) : item.price.toFixed(2)}
          </span>
          {item.prepTimeMinutes && (
            <span className="text-sm text-gray-500">
              🕐 {item.prepTimeMinutes} min
            </span>
          )}
        </div>

        {/* Modifier Groups Info */}
        {item.modifierGroups.length > 0 && !showModifiers && (
          <p className="text-xs text-gray-500 mb-3">
            Customization available ({item.modifierGroups.length} option{item.modifierGroups.length > 1 ? 's' : ''})
          </p>
        )}

        {/* Modifier Selector (when expanded) */}
        {showModifiers && (
          <div className="mb-4 border-t pt-3">
            <ModifierSelector
              modifierGroups={item.modifierGroups}
              selectedModifiers={selectedModifiers}
              onModifierChange={setSelectedModifiers}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {item.modifierGroups.length > 0 && (
            <button
              onClick={() => setShowModifiers(!showModifiers)}
              className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              {showModifiers ? 'Hide Options' : 'Customize'}
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut || isUnavailable}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              isSoldOut || isUnavailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSoldOut ? 'Sold Out' : isUnavailable ? 'Unavailable' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
