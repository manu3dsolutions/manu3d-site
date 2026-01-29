import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ShippingMethod, Coupon } from '../types';
import { supabase } from '../supabaseClient';
import { useLiveContent } from '../LiveContent';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product | CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartWeight: number; // en grammes
  shippingMethod: ShippingMethod | null;
  setShippingMethod: (method: ShippingMethod | null) => void;
  shippingCost: number;
  isFreeShipping: boolean;
  
  // Coupon logic
  coupon: Coupon | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{success: boolean, message: string}>;
  removeCoupon: () => void;
  
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  
  const { siteConfig } = useLiveContent();

  // Charger le panier depuis le localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('manu3d_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erreur lecture panier", e);
      }
    }
  }, []);

  // Sauvegarder le panier
  useEffect(() => {
    localStorage.setItem('manu3d_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (itemToAdd: Product | CartItem) => {
    setCart(prev => {
      // Pour les produits custom, on ne groupe pas par ID car la config peut changer, on ajoute une nouvelle ligne ou on génère un ID unique avant
      // Pour les produits classiques, on groupe
      const isCustom = (itemToAdd as CartItem).type === 'custom';
      
      if (!isCustom) {
          const existing = prev.find(item => item.id === itemToAdd.id && item.type !== 'custom');
          if (existing) {
            return prev.map(item => 
              item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
      }
      
      // Conversion Product -> CartItem si nécessaire
      const newItem: CartItem = {
          ...itemToAdd,
          quantity: (itemToAdd as CartItem).quantity || 1,
          type: (itemToAdd as CartItem).type || 'product'
      };
      
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setShippingMethod(null);
    setCoupon(null);
  };

  // Calculs de base
  const cartTotal = cart.reduce((sum, item) => {
    let price = item.numericPrice;
    if (price === undefined) {
        price = parseFloat(item.price.replace('€', '').trim());
    }
    return sum + (price * item.quantity);
  }, 0);

  const cartWeight = cart.reduce((sum, item) => {
    return sum + ((item.weightG || 100) * item.quantity);
  }, 0);

  // Logique Coupon
  const applyCoupon = async (code: string): Promise<{success: boolean, message: string}> => {
      try {
          const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('active', true)
            .single();

          if (error || !data) {
              return { success: false, message: "Code invalide ou expiré." };
          }
          
          setCoupon(data as Coupon);
          return { success: true, message: "Code appliqué avec succès !" };
      } catch (err) {
          return { success: false, message: "Erreur lors de la vérification." };
      }
  };

  const removeCoupon = () => {
      setCoupon(null);
  };

  // Calcul du montant de la réduction
  const discountAmount = React.useMemo(() => {
      if (!coupon) return 0;
      if (coupon.discount_type === 'percent') {
          return cartTotal * (coupon.value / 100);
      } else {
          // Type 'fixed'
          return Math.min(coupon.value, cartTotal); // Ne peut pas dépasser le total
      }
  }, [cartTotal, coupon]);

  // Règle: Frais de port offerts si > SEUIL (100€ par défaut)
  // Utilisation de siteConfig pour le seuil dynamique
  const isFreeShipping = cartTotal >= (siteConfig?.shippingFreeThreshold || 100);

  const shippingCost = React.useMemo(() => {
    if (!shippingMethod) return 0;
    if (shippingMethod.isPickup) return 0; // Toujours gratuit en retrait
    if (isFreeShipping) return 0; // Gratuit si > seuil
    
    const weightKg = cartWeight / 1000;
    return shippingMethod.basePrice + (weightKg * shippingMethod.pricePerKg);
  }, [shippingMethod, cartWeight, isFreeShipping]);

  // Total Final : (Produits - Réduction) + Frais de port
  const finalTotal = Math.max(0, (cartTotal - discountAmount) + shippingCost);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartWeight,
      shippingMethod, setShippingMethod, shippingCost, isFreeShipping,
      coupon, discountAmount, applyCoupon, removeCoupon,
      finalTotal,
      isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);