import { createContext, useContext, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (item, vendor) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            // Include vendor object internally for grouping in checkout
            return [...prev, { ...item, quantity: 1, vendor }];
        });
        toast.success(`Added ${item.name} to cart.`);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    const clearCartItemsForVendor = (vendorId) => {
        setCartItems(prev => prev.filter(i => i.vendor?.id !== vendorId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    }, [cartItems]);

    const cartCount = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [cartItems]);

    // Group items by vendor for multi-vendor checkout UI
    const groupedCart = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const vId = item.vendor?.id;
            if (!vId) return acc;
            if (!acc[vId]) {
                acc[vId] = { vendor: item.vendor, items: [], total: 0 };
            }
            acc[vId].items.push(item);
            acc[vId].total += parseFloat(item.price) * item.quantity;
            return acc;
        }, {});
    }, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            clearCartItemsForVendor,
            cartTotal,
            cartCount,
            groupedCart,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};

export default CartContext;
