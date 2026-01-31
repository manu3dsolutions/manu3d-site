import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, CheckCircle, AlertCircle, Package, Store, Ticket, Loader2, FileText, Smartphone, ShieldCheck, Weight, CreditCard, ArrowLeft, ArrowRight, FileCheck, Gift } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLiveContent } from '../LiveContent';
import { supabase } from '../supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import LegalDocs from './LegalDocs';

// Sécurisation de l'accès aux variables d'environnement
const env = (import.meta as any).env || {};
const PAYPAL_CLIENT_ID = env.VITE_PAYPAL_CLIENT_ID || "test";
const IS_PRODUCTION = PAYPAL_CLIENT_ID !== "test";

const CartSidebar: React.FC = () => {
  const { 
    cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, 
    cartTotal, cartWeight, shippingMethod, setShippingMethod, shippingCost, isFreeShipping,
    finalTotal, clearCart,
    coupon, discountAmount, applyCoupon, removeCoupon
  } = useCart();
  
  const { shippingMethods, siteConfig } = useLiveContent();
  
  // --- ETAPES DU TUNNEL ---
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'shipping' | 'payment' | 'success'>('cart');
  
  // --- FORMULAIRE CLIENT ---
  const [customerInfo, setCustomerInfo] = useState({ 
      name: '', 
      email: '', 
      phone: '', 
      address: '', 
      city: '', 
      zip: '' 
  });
  
  // --- ETATS UI ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  
  // --- LEGAL ---
  const [acceptCGV, setAcceptCGV] = useState(false);
  const [showLegal, setShowLegal] = useState(false); 

  // --- LOGIQUE FILTRAGE POIDS (SMART FIX KG/G) ---
  const availableMethods = useMemo(() => {
     // 1. Filtrage Intelligent (Gère la confusion KG vs Grammes)
     const validMethods = shippingMethods.filter(method => {
         // Valeurs brutes de la BDD
         const minRaw = method.minWeight ?? 0;
         const maxRaw = (method.maxWeight && method.maxWeight > 0) ? method.maxWeight : 999999;

         // CORRECTION AUTOMATIQUE D'UNITÉ :
         // Si la limite max est < 100, on suppose que l'admin a entré des KILOS (ex: 2 pour 2kg).
         // Sinon, on suppose que ce sont des GRAMMES (ex: 250 pour 250g).
         // On convertit tout en grammes pour comparer avec le panier (qui est en grammes).
         const maxInGrams = maxRaw <= 100 ? maxRaw * 1000 : maxRaw;
         
         // Idem pour le min
         const minInGrams = minRaw <= 100 && minRaw > 0 ? minRaw * 1000 : minRaw;

         return cartWeight >= minInGrams && cartWeight <= maxInGrams;
     });

     // 2. FAIL-SAFE ULTIME : Si aucun transporteur ne matche (trou dans la grille ou bug),
     // on renvoie TOUS les transporteurs pour ne jamais bloquer une vente.
     if (validMethods.length === 0) {
         console.warn("Aucun transporteur compatible trouvé pour ce poids. Activation du mode Fail-Safe.");
         return shippingMethods;
     }

     return validMethods;
  }, [shippingMethods, cartWeight]);

  useEffect(() => {
     if (checkoutStep === 'shipping') {
         if (availableMethods.length > 0) {
             const currentIsValid = shippingMethod && availableMethods.find(m => m.id === shippingMethod.id);
             
             if (!shippingMethod || !currentIsValid) {
                 setShippingMethod(availableMethods[0]);
             }
         }
     }
  }, [availableMethods, checkoutStep, shippingMethod, setShippingMethod]);

  // Reset scroll on open
  useEffect(() => {
     if(isCartOpen) document.body.style.overflow = 'hidden';
     else document.body.style.overflow = 'unset';
     return () => { document.body.style.overflow = 'unset'; }
  }, [isCartOpen]);

  // --- GAMIFICATION LIVRAISON GRATUITE ---
  const freeShippingThreshold = siteConfig.shippingFreeThreshold || 100;
  const remainingForFree = Math.max(0, freeShippingThreshold - cartTotal);
  const progressPercent = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  if (!isCartOpen) return (
      <>
        {showLegal && <LegalDocs isOpen={true} onClose={() => setShowLegal(false)} initialSection="cgv" />}
      </>
  );

  // --- VALIDATION ---
  const validateDetails = () => {
      const { name, email, phone, address, city, zip } = customerInfo;
      if (!name.trim() || !email.trim() || !address.trim() || !city.trim() || !zip.trim()) {
          setErrorMsg("Tous les champs marqués d'une * sont obligatoires.");
          return false;
      }
      const phoneRegex = /^(?:(?:\+|00)33|0)[67][0-9]{8}$/;
      if (!phone.trim()) {
          setErrorMsg("Le numéro de téléphone mobile est obligatoire.");
          return false;
      }
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
          setErrorMsg("Numéro mobile invalide (06 ou 07 requis pour le suivi).");
          return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setErrorMsg("L'adresse email semble invalide.");
          return false;
      }
      setErrorMsg(null);
      return true;
  };

  const handleNextStep = () => {
    if (checkoutStep === 'cart') {
        if(cart.length === 0) return;
        setCheckoutStep('details');
    }
    else if (checkoutStep === 'details') {
        if (validateDetails()) setCheckoutStep('shipping');
    }
    else if (checkoutStep === 'shipping') {
       if(!shippingMethod && availableMethods.length > 0) { setErrorMsg('Veuillez choisir un mode de livraison.'); return; }
       setErrorMsg(null);
       setCheckoutStep('payment');
    }
  };

  const handleBackStep = () => {
      if(checkoutStep === 'details') setCheckoutStep('cart');
      if(checkoutStep === 'shipping') setCheckoutStep('details');
      if(checkoutStep === 'payment') setCheckoutStep('shipping');
  };

  // --- COUPON ---
  const handleApplyCoupon = async () => {
      if(!couponInput.trim()) return;
      setCouponLoading(true);
      setCouponMsg(null);
      const res = await applyCoupon(couponInput.trim());
      setCouponLoading(false);
      if(res.success) {
          setCouponMsg({ type: 'success', text: res.message });
          setCouponInput('');
      } else {
          setCouponMsg({ type: 'error', text: res.message });
      }
  };

  // --- COMMANDE ---
  const handleOrderSuccess = async (transactionId: string, method: string) => {
      setIsProcessing(true);
      try {
          const orderData = {
              customer_name: customerInfo.name,
              customer_email: customerInfo.email,
              customer_phone: customerInfo.phone,
              shipping_address: `${customerInfo.address}, ${customerInfo.zip} ${customerInfo.city}`,
              items: cart,
              total: finalTotal,
              shipping_method: shippingMethod?.name || 'Standard',
              payment_method: method,
              payment_id: transactionId,
              status: 'paid'
          };
          
          const { data, error } = await supabase.from('orders').insert(orderData).select();
          if (error) console.error("Erreur BDD:", error);
          
          setCheckoutStep('success');
          clearCart();
          setAcceptCGV(false);
      } catch (err) {
          console.error(err);
          alert("Erreur lors de l'enregistrement. Contactez-nous.");
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <>
    <LegalDocs isOpen={showLegal} onClose={() => setShowLegal(false)} initialSection="cgv" />
    
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />

      <div className="relative w-full max-w-md h-full bg-[#0F1216] border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#0B0D10]">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            {checkoutStep === 'success' ? <CheckCircle className="text-green-500"/> : <ShoppingBag className="text-manu-orange" />}
            {checkoutStep === 'cart' && 'Mon Panier'}
            {checkoutStep === 'details' && 'Mes Coordonnées'}
            {checkoutStep === 'shipping' && 'Livraison'}
            {checkoutStep === 'payment' && 'Paiement'}
            {checkoutStep === 'success' && 'Commande Validée'}
          </h2>
          {checkoutStep !== 'success' && (
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
          )}
        </div>
        
        {/* FREE SHIPPING PROGRESS BAR */}
        {checkoutStep === 'cart' && cart.length > 0 && (
            <div className="bg-[#151921] p-4 border-b border-gray-800">
               {remainingForFree > 0 ? (
                   <div className="space-y-2">
                       <p className="text-xs text-gray-400">
                           Plus que <span className="text-manu-orange font-bold">{remainingForFree.toFixed(2)}€</span> pour la livraison offerte !
                       </p>
                       <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                       </div>
                   </div>
               ) : (
                   <div className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                       <Gift size={16} className="animate-bounce" /> Livraison OFFERTE sur cette commande !
                   </div>
               )}
            </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 relative">
            
            {/* ETAPE 1 : PANIER */}
            {checkoutStep === 'cart' && (
                <>
                   {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                            <ShoppingBag size={64} className="mb-4" />
                            <p className="text-lg font-medium">Votre panier est vide</p>
                            <button onClick={() => setIsCartOpen(false)} className="mt-4 text-manu-orange underline hover:text-white">Retourner à la boutique</button>
                        </div>
                   ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 bg-[#151921] p-3 rounded-xl border border-gray-800 relative group">
                                    <div className="w-20 h-20 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-gray-700">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white text-sm line-clamp-2">{item.title}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                                        </div>
                                        {item.type === 'custom' && (
                                            <div className="text-[10px] text-purple-400 mb-1 flex items-center gap-1"><FileText size={10}/> Projet Sur-Mesure</div>
                                        )}
                                        <div className="text-xs text-gray-400 mb-2">{item.category}</div>
                                        <div className="flex justify-between items-end">
                                            <div className="font-bold text-manu-orange">{(item.numericPrice || parseFloat(item.price.replace('€',''))).toFixed(2)}€</div>
                                            <div className="flex items-center gap-3 bg-black rounded-lg px-2 py-1 border border-gray-800">
                                                <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1} className="text-gray-400 hover:text-white disabled:opacity-30"><Minus size={12}/></button>
                                                <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white"><Plus size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="flex justify-end text-[10px] text-gray-400 mt-2 gap-1 items-center bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                                <Weight size={12} /> Poids total estimé : <span className="text-white font-bold">{(cartWeight/1000).toFixed(2)} kg</span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-800">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Code Promo (ex: MANU10)" className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-manu-orange outline-none uppercase" />
                                    </div>
                                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponInput} className="bg-gray-800 hover:bg-gray-700 text-white px-3 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                                        {couponLoading ? <Loader2 className="animate-spin" size={14}/> : 'OK'}
                                    </button>
                                </div>
                                {couponMsg && (
                                    <p className={`text-xs mt-2 flex items-center gap-1 ${couponMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {couponMsg.type === 'success' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>} {couponMsg.text}
                                    </p>
                                )}
                            </div>
                        </div>
                   )}
                </>
            )}

            {/* ETAPE 2 : DETAILS */}
            {checkoutStep === 'details' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 mb-6">
                        <Smartphone className="text-blue-400 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="text-blue-400 font-bold text-sm">Mobile Obligatoire</h4>
                            <p className="text-xs text-blue-200/70">Nous envoyons le suivi de colis par SMS.</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="Nom Complet *" />
                        <input type="email" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="Email *" />
                        <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-[#151921] border border-manu-orange/50 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="Téléphone Mobile (06/07) *" />
                        <input type="text" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="Adresse *" />
                        <div className="flex gap-3">
                            <input type="text" value={customerInfo.zip} onChange={e => setCustomerInfo({...customerInfo, zip: e.target.value})} className="w-1/3 bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="CP *" />
                            <input type="text" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} className="flex-1 bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="Ville *" />
                        </div>
                    </div>
                </div>
            )}

            {/* ETAPE 3 : LIVRAISON */}
            {checkoutStep === 'shipping' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="flex justify-between items-center text-sm text-gray-400 mb-2 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <span>Poids colis : <span className="text-white font-bold">{(cartWeight/1000).toFixed(2)} kg</span></span>
                        <span>Ville : <span className="text-white font-bold">{customerInfo.city}</span></span>
                    </div>

                    {availableMethods.length > 0 ? availableMethods.map((method) => {
                        const cost = (method.basePrice + (cartWeight/1000 * method.pricePerKg));
                        const isFree = isFreeShipping && !method.isPickup; 
                        const finalCost = isFree ? 0 : cost;

                        return (
                            <div key={method.id} onClick={() => setShippingMethod(method)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${shippingMethod?.id === method.id ? 'border-manu-orange bg-manu-orange/5' : 'border-gray-800 bg-[#151921] hover:border-gray-600'}`}>
                                <div className={`p-2 rounded-full ${shippingMethod?.id === method.id ? 'bg-manu-orange text-black' : 'bg-gray-800 text-gray-400'}`}>
                                    {method.isPickup ? <Store size={20}/> : <Truck size={20}/>}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm">{method.name}</h4>
                                    <p className="text-xs text-gray-400">{method.description}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Package size={10}/> Délai : {method.estimatedDays}</p>
                                </div>
                                <div className="font-bold text-manu-orange text-sm">
                                    {method.isPickup ? 'Gratuit' : (isFree ? <span className="text-green-500">Offert</span> : `${finalCost.toFixed(2)}€`)}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center p-6 border border-red-900/50 bg-red-900/10 rounded-xl">
                            <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                            <h4 className="text-white font-bold mb-1">Aucun transporteur</h4>
                            <p className="text-xs text-gray-400">Veuillez nous contacter pour une expédition sur mesure.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ETAPE 4 : PAIEMENT */}
            {checkoutStep === 'payment' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="bg-[#151921] p-4 rounded-xl border border-gray-800 text-sm space-y-2">
                        <div className="flex justify-between text-gray-400"><span>Sous-total</span><span>{cartTotal.toFixed(2)}€</span></div>
                        {discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Remise</span><span>-{discountAmount.toFixed(2)}€</span></div>}
                        <div className="flex justify-between text-gray-400"><span>Livraison</span><span>{shippingCost.toFixed(2)}€</span></div>
                        <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold text-lg"><span>Total</span><span>{finalTotal.toFixed(2)}€</span></div>
                    </div>

                    {/* Zone de Paiement */}
                    <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                        
                        {/* CASE CGV OBLIGATOIRE - LOI FRANCE */}
                        <div className="mb-6 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={acceptCGV} 
                                    onChange={(e) => setAcceptCGV(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-manu-orange focus:ring-manu-orange"
                                />
                                <span className="text-xs text-gray-300">
                                    J'ai lu et j'accepte les <button onClick={(e) => { e.preventDefault(); setShowLegal(true); }} className="text-manu-orange underline font-bold">Conditions Générales de Vente</button>. <br/>
                                    <span className="text-[10px] text-gray-500">En validant ma commande, je reconnais mon obligation de paiement.</span>
                                </span>
                            </label>
                        </div>

                        {paymentMethod === 'paypal' ? (
                            <div className={`${!acceptCGV ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all`}>
                                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR" }}>
                                    <PayPalButtons 
                                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }} 
                                        disabled={!acceptCGV}
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                intent: "CAPTURE",
                                                purchase_units: [{
                                                    amount: { value: finalTotal.toFixed(2), currency_code: "EUR" },
                                                    description: `Manu3D - ${customerInfo.email}`
                                                }]
                                            });
                                        }}
                                        onApprove={async (data, actions) => {
                                            if (actions.order) {
                                                const details = await actions.order.capture();
                                                handleOrderSuccess(details.id || 'PAYPAL_ID', 'PayPal');
                                            }
                                        }}
                                    />
                                    <p className="text-center text-[10px] text-gray-500 mt-2 flex items-center justify-center gap-1">
                                        <ShieldCheck size={10}/> Paiement sécurisé par PayPal (Compte ou Carte Bancaire)
                                    </p>
                                </PayPalScriptProvider>
                            </div>
                        ) : (
                            /* Simulation UNIQUEMENT visible si on n'est PAS en PROD */
                            !IS_PRODUCTION && (
                                <div className="space-y-4">
                                    <div className="bg-red-900/20 border border-red-500 text-red-500 p-2 text-center text-xs font-bold rounded">MODE DÉMO UNIQUEMENT</div>
                                    <button 
                                        onClick={() => handleOrderSuccess(`CB-TEST-${Date.now()}`, 'Carte Test')}
                                        disabled={isProcessing || !acceptCGV}
                                        className={`w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg ${!acceptCGV ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : `Simuler Validation`}
                                    </button>
                                </div>
                            )
                        )}
                        
                        {/* Switcher pour DEV seulement */}
                        {!IS_PRODUCTION && (
                            <div className="mt-4 flex gap-2 justify-center">
                                <button onClick={() => setPaymentMethod('paypal')} className={`text-xs px-2 py-1 rounded ${paymentMethod === 'paypal' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>PayPal</button>
                                <button onClick={() => setPaymentMethod('card')} className={`text-xs px-2 py-1 rounded ${paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Simulation</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ETAPE 5 : SUCCES */}
            {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]"><CheckCircle size={48} /></div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2 font-display">Commande Validée !</h3>
                        <p className="text-gray-400">Merci {customerInfo.name}. Vous recevrez un email de confirmation.</p>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="bg-manu-orange text-black font-bold px-8 py-3 rounded-full hover:bg-white transition-colors">Retour à la boutique</button>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        {checkoutStep !== 'success' && cart.length > 0 && (
            <div className="p-5 border-t border-gray-800 bg-[#0B0D10]">
                {checkoutStep !== 'payment' && (
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400 text-sm">Total estimé</span>
                        <span className="text-2xl font-bold text-white font-display">{checkoutStep === 'cart' ? cartTotal.toFixed(2) : finalTotal.toFixed(2)}€</span>
                    </div>
                )}
                {errorMsg && <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-4 text-red-400 text-xs flex gap-2"><AlertCircle size={14}/> {errorMsg}</div>}
                <div className="flex gap-3">
                    {checkoutStep !== 'cart' && (
                        <button onClick={handleBackStep} className="px-4 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"><ArrowLeft size={20} /></button>
                    )}
                    {checkoutStep !== 'payment' && (
                        <button 
                            onClick={handleNextStep}
                            className={`flex-1 bg-manu-orange text-black font-bold py-3 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 ${checkoutStep === 'shipping' && availableMethods.length === 0 ? '' : ''}`}
                            
                        >
                            {checkoutStep === 'cart' && 'Commander'}
                            {checkoutStep === 'details' && 'Vers la Livraison'}
                            {checkoutStep === 'shipping' && 'Vers le Paiement'}
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CartSidebar;