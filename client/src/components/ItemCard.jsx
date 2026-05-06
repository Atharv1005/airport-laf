import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { marker } from '../assets/icons.js';

const CATEGORY_ICONS = {
  'Electronics': '📱', 'Clothing': '👕', 'Bags & Luggage': '🧳',
  'Documents & IDs': '📄', 'Jewellery & Accessories': '💍', 'Keys': '🔑',
  'Wallet & Purse': '👜', 'Books & Stationery': '📚', "Children's Items": '🧸',
  'Food & Beverages': '🥤', 'Sports Equipment': '🏅', 'Umbrellas': '☂️',
  'Eyewear': '👓', 'Medical Items': '💊', 'Other': '📦',
};

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const icon = CATEGORY_ICONS[item.category] || '📦';
  const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short',
  });

  return (
    <button
      onClick={() => navigate(`/items/${item._id}`)}
      className="w-full card flex gap-3 items-start text-left active:scale-[0.98] transition-transform mb-3"
    >
      {/* Image or Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: '#1A1A1A' }}
      >
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
          : <span className="text-2xl">{icon}</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="item-id truncate">{item.itemId}</p>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-white font-medium text-sm mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {item.category}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <img
            src={marker}
            alt="location"
            style={{
              width: 12, height: 12, objectFit: 'contain', flexShrink: 0,
              filter: 'none',
            }}
          />
          <p style={{ color: '#555', fontSize: 12, fontFamily: 'Outfit, sans-serif' }} className="truncate">
            {item.location}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span style={{ color: '#444', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}>{date}</span>
          {item.status === 'ACTIVE' && item.daysRemaining !== undefined && (
            <span style={{
              fontSize: 12,
              fontFamily: 'Outfit, sans-serif',
              color: item.daysRemaining < 10 ? '#EF4444' : '#555',
            }}>
              {item.daysRemaining}d left
            </span>
          )}
          {item.quantity > 1 && (
            <span style={{ color: '#444', fontSize: 12, fontFamily: 'Outfit, sans-serif' }}>
              ×{item.quantity}
            </span>
          )}
        </div>
      </div>

      <span style={{ color: '#333', marginTop: 4 }}>›</span>
    </button>
  );
}
