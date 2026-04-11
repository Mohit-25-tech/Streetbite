export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
};

export const formatDistance = (km) => {
    if (!km && km !== 0) return null;
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)} km`;
};

export const formatRating = (rating) => {
    return rating ? parseFloat(rating).toFixed(1) : '0.0';
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
};

export const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, len = 80) => {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
};

export const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

export const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#22c55e';
    if (rating >= 4.0) return '#16a34a';
    if (rating >= 3.5) return '#f59e0b';
    if (rating >= 3.0) return '#f97316';
    return '#ef4444';
};

export const CATEGORIES = [
    { name: 'Chaat', icon: '🥗', color: '#FF6B35' },
    { name: 'Momos', icon: '🥟', color: '#6B7CFF' },
    { name: 'Rolls', icon: '🌯', color: '#29c47e' },
    { name: 'Biryani', icon: '🍚', color: '#f59e0b' },
    { name: 'Juice & Drinks', icon: '🥤', color: '#06b6d4' },
    { name: 'Sandwiches', icon: '🥪', color: '#8b5cf6' },
    { name: 'Sweets', icon: '🍮', color: '#ec4899' },
    { name: 'Noodles', icon: '🍜', color: '#ef4444' },
];
