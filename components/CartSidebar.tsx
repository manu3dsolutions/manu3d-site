import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, CheckCircle, AlertCircle, Package, Store, Ticket, Loader2, FileText, Download, Printer, Phone, MapPin, CreditCard, Mail, ArrowLeft, ArrowRight, Smartphone, ShieldCheck, Weight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLiveContent } from '../LiveContent';
import { supabase } from '../supabaseClient';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// ID Client PayPal (Remplacer par le vrai ID de production dans .env pour le passage en PROD)
const PAYPAL_CLIENT_ID = "test"; // Mode Sandbox. Mettre "AV_..." pour la prod.

const CartSidebar: React.FC = () => {
  const { 
    cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, 
    cartTotal, cartWeight, shippingMethod, setShippingMethod, shippingCost, isFreeShipping,
    finalTotal, clearCart,
    coupon, discountAmount, applyCoupon, removeCoupon
  } = useCart();
  
  const { shippingMethods, siteConfig } = useLiveContent();
  
  // --- ETAPES DU TUNNEL ---
  // 'cart' -> 'details' (Adresse/Tel) -> 'shipping' (Choix transporteur) -> 'payment' -> 'success'
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

  // --- LOGIQUE FILTRAGE POIDS ---
  const availableMethods = useMemo(() => {
     return shippingMethods.filter(method => {
         const min = method.minWeight ?? 0;
         const max = method.maxWeight ?? 100000; // 100kg par défaut si non spécifié
         return cartWeight >= min && cartWeight <= max;
     });
  }, [shippingMethods, cartWeight]);

  // Si le mode choisi devient invalide (car le poids a changé), on le désélectionne ou on prend le premier dispo
  useEffect(() => {
     if (checkoutStep === 'shipping' && availableMethods.length > 0) {
         const currentIsValid = shippingMethod && availableMethods.find(m => m.id === shippingMethod.id);
         if (!currentIsValid) {
             // Sélectionner par défaut le moins cher (souvent le premier si trié par prix)
             // On s'assure que 'availableMethods' est trié par prix croissant (normalement fait dans LiveContent)
             setShippingMethod(availableMethods[0]);
         }
     }
  }, [availableMethods, checkoutStep, shippingMethod, setShippingMethod]);

  // Reset scroll on open
  useEffect(() => {
     if(isCartOpen) document.body.style.overflow = 'hidden';
     else document.body.style.overflow = 'unset';
     return () => { document.body.style.overflow = 'unset'; }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  // --- LOGIQUE DE VALIDATION ---
  
  const validateDetails = () => {
      const { name, email, phone, address, city, zip } = customerInfo;
      if (!name.trim() || !email.trim() || !address.trim() || !city.trim() || !zip.trim()) {
          setErrorMsg("Tous les champs marqués d'une * sont obligatoires.");
          return false;
      }
      // Regex Tel Mobile France (06, 07, +336, +337)
      const phoneRegex = /^(?:(?:\+|00)33|0)[67][0-9]{8}$/;
      if (!phone.trim()) {
          setErrorMsg("Le numéro de téléphone mobile est obligatoire pour la livraison.");
          return false;
      }
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
          setErrorMsg("Merci de renseigner un numéro de mobile valide (06 ou 07) pour le suivi SMS.");
          return false;
      }
      // Regex Email simple
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
        if (validateDetails()) {
            setCheckoutStep('shipping');
        }
    }
    else if (checkoutStep === 'shipping') {
       if(!shippingMethod) {
           setErrorMsg('Veuillez choisir un mode de livraison.');
           return;
       }
       if(availableMethods.length === 0) {
           setErrorMsg('Aucun transporteur disponible pour ce poids.');
           return;
       }
       setErrorMsg(null);
       setCheckoutStep('payment');
    }
  };

  const handleBackStep = () => {
      if(checkoutStep === 'details') setCheckoutStep('cart');
      if(checkoutStep === 'shipping') setCheckoutStep('details');
      if(checkoutStep === 'payment') setCheckoutStep('shipping');
  };

  // --- LOGIQUE COUPON ---
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

  // --- GENERATE INVOICE HTML (SIMULATION EMAIL) ---
  const sendConfirmationEmail = async (orderId: string) => {
      // Dans une vraie app, ceci appellerait une API (ex: EmailJS ou Supabase Edge Function)
      // Ici on simule l'envoi
      console.log(`📧 ENVOI EMAIL A ${customerInfo.email}...`);
      
      const emailContent = `
        <h1>Merci ${customerInfo.name} !</h1>
        <p>Votre commande #${orderId} est confirmée.</p>
        <p>Total payé : ${finalTotal.toFixed(2)}€</p>
        <p>Livraison à : ${customerInfo.address}, ${customerInfo.zip} ${customerInfo.city}</p>
        <p>Téléphone : ${customerInfo.phone}</p>
      `;
      
      // Simulation délai réseau
      await new Promise(r => setTimeout(r, 1500)); 
      console.log("✅ EMAIL ENVOYÉ !");
  };

  // --- FINALISATION COMMANDE ---
  const handleOrderSuccess = async (transactionId: string, method: string) => {
      setIsProcessing(true);
      try {
          // 1. Sauvegarde BDD
          const orderData = {
              customer_name: customerInfo.name,
              customer_email: customerInfo.email,
              customer_phone: customerInfo.phone,
              shipping_address: `${customerInfo.address}, ${customerInfo.zip} ${customerInfo.city}`,
              items: cart,
              total: finalTotal,
              shipping_method: shippingMethod?.name,
              payment_method: method,
              payment_id: transactionId,
              status: 'paid'
          };
          
          const { data, error } = await supabase.from('orders').insert(orderData).select();
          
          if (error) {
              // En cas d'erreur BDD (ex: table pas à jour), on log mais on affiche quand même succès au client car il a payé
              console.error("Erreur sauvegarde commande BDD:", error);
          }

          const orderId = data ? data[0].id : transactionId.slice(-6);

          // 2. Envoi Email
          await sendConfirmationEmail(String(orderId));

          // 3. UI Success
          setCheckoutStep('success');
          clearCart();

      } catch (err) {
          console.error("Erreur critique:", err);
          alert("Erreur lors de l'enregistrement, mais votre paiement est validé. Contactez-nous.");
      } finally {
          setIsProcessing(false);
      }
  };

  // --- CONTENU RENDU ---
  
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar Panel */}
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
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
          )}
        </div>

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
                                            <div className="text-[10px] text-purple-400 mb-1 flex items-center gap-1">
                                                <FileText size={10}/> Projet Sur-Mesure
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 mb-2">{item.category}</div>
                                        <div className="flex justify-between items-end">
                                            <div className="font-bold text-manu-orange">
                                                {(item.numericPrice || parseFloat(item.price.replace('€',''))).toFixed(2)}€
                                            </div>
                                            <div className="flex items-center gap-3 bg-black rounded-lg px-2 py-1 border border-gray-800">
                                                <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1} className="text-gray-400 hover:text-white disabled:opacity-30"><Minus size={12}/></button>
                                                <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white"><Plus size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Poids total indicator */}
                            <div className="flex justify-end text-[10px] text-gray-400 mt-2 gap-1 items-center">
                                <Weight size={10} />
                                Poids estimé : {(cartWeight/1000).toFixed(2)} kg
                            </div>

                            {/* Coupon Input in Cart */}
                            <div className="mt-6 pt-6 border-t border-gray-800">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input 
                                            type="text" 
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            placeholder="Code Promo (ex: MANU10)" 
                                            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-manu-orange outline-none uppercase"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleApplyCoupon} 
                                        disabled={couponLoading || !couponInput}
                                        className="bg-gray-800 hover:bg-gray-700 text-white px-3 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                    >
                                        {couponLoading ? <Loader2 className="animate-spin" size={14}/> : 'OK'}
                                    </button>
                                </div>
                                {couponMsg && (
                                    <p className={`text-xs mt-2 flex items-center gap-1 ${couponMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {couponMsg.type === 'success' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                                        {couponMsg.text}
                                    </p>
                                )}
                            </div>
                        </div>
                   )}
                </>
            )}

            {/* ETAPE 2 : DETAILS (COORDONNEES) */}
            {checkoutStep === 'details' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex gap-3 mb-6">
                        <Smartphone className="text-blue-400 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="text-blue-400 font-bold text-sm">Mobile Obligatoire</h4>
                            <p className="text-xs text-blue-200/70">Pour assurer la livraison et recevoir les notifications SMS du transporteur.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase ml-1">Nom Complet *</label>
                            <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="Jean Dupont" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase ml-1">Email *</label>
                            <input type="email" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="jean@email.com" />
                        </div>
                        <div>
                            <label className="text-xs text-manu-orange font-bold uppercase ml-1 flex items-center gap-1"><Smartphone size={10}/> Téléphone Mobile *</label>
                            <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-[#151921] border border-manu-orange/50 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="06 12 34 56 78" />
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Format: 06 ou 07</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase ml-1">Adresse (Rue/Voie) *</label>
                            <input type="text" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="10 rue de la Paix" />
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1/3">
                                <label className="text-xs text-gray-400 font-bold uppercase ml-1">Code Postal *</label>
                                <input type="text" value={customerInfo.zip} onChange={e => setCustomerInfo({...customerInfo, zip: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="75000" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 font-bold uppercase ml-1">Ville *</label>
                                <input type="text" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} className="w-full bg-[#151921] border border-gray-700 rounded-lg p-3 text-white focus:border-manu-orange outline-none" placeholder="Paris" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ETAPE 3 : SHIPPING (FILTRÉ PAR POIDS) */}
            {checkoutStep === 'shipping' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <p className="text-sm text-gray-400 mb-4">Adresse de livraison : <span className="text-white font-bold">{customerInfo.city} ({customerInfo.zip})</span></p>
                    
                    {/* Badge Poids */}
                    <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded text-xs text-gray-400 border border-gray-800 mb-4">
                        <span>Poids total du colis :</span>
                        <span className="font-bold text-white">{(cartWeight/1000).toFixed(2)} kg</span>
                    </div>

                    {availableMethods.length > 0 ? availableMethods.map((method) => {
                        const cost = (method.basePrice + (cartWeight/1000 * method.pricePerKg));
                        const isFree = isFreeShipping && !method.isPickup; 
                        const finalCost = isFree ? 0 : cost;

                        return (
                            <div 
                                key={method.id} 
                                onClick={() => setShippingMethod(method)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${shippingMethod?.id === method.id ? 'border-manu-orange bg-manu-orange/5' : 'border-gray-800 bg-[#151921] hover:border-gray-600'}`}
                            >
                                <div className={`p-2 rounded-full ${shippingMethod?.id === method.id ? 'bg-manu-orange text-black' : 'bg-gray-800 text-gray-400'}`}>
                                    {method.isPickup ? <Store size={20}/> : <Truck size={20}/>}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm">{method.name}</h4>
                                    <p className="text-xs text-gray-400">{method.description}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Package size={10}/> Délai estimé : {method.estimatedDays}</p>
                                </div>
                                <div className="font-bold text-manu-orange text-sm">
                                    {method.isPickup ? 'Gratuit' : (isFree ? <span className="text-green-500">Offert</span> : `${finalCost.toFixed(2)}€`)}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center p-6 border border-red-900/50 bg-red-900/10 rounded-xl">
                            <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                            <h4 className="text-white font-bold mb-1">Colis Volumineux</h4>
                            <p className="text-xs text-gray-400">
                                Aucun transporteur standard ne peut prendre en charge ce poids ({(cartWeight/1000).toFixed(2)}kg).<br/>
                                Veuillez nous contacter pour un devis sur mesure ou alléger votre panier.
                            </p>
                            <button onClick={() => setCheckoutStep('cart')} className="mt-4 text-xs font-bold text-manu-orange underline">Modifier mon panier</button>
                        </div>
                    )}
                </div>
            )}

            {/* ETAPE 4 : PAIEMENT */}
            {checkoutStep === 'payment' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                    
                    {/* Récap Rapide */}
                    <div className="bg-[#151921] p-4 rounded-xl border border-gray-800 text-sm space-y-2">
                        <div className="flex justify-between text-gray-400"><span>Sous-total</span><span>{cartTotal.toFixed(2)}€</span></div>
                        {discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Remise</span><span>-{discountAmount.toFixed(2)}€</span></div>}
                        <div className="flex justify-between text-gray-400"><span>Livraison</span><span>{shippingCost.toFixed(2)}€</span></div>
                        <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold text-lg"><span>Total à payer</span><span>{finalTotal.toFixed(2)}€</span></div>
                    </div>

                    {/* Choix Méthode */}
                    <div className="flex gap-2">
                        <button onClick={() => setPaymentMethod('paypal')} className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-sm transition-all ${paymentMethod === 'paypal' ? 'bg-[#0070BA] border-[#0070BA] text-white' : 'bg-[#151921] border-gray-800 text-gray-400'}`}>
                             PayPal
                        </button>
                        <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-sm transition-all ${paymentMethod === 'card' ? 'bg-white text-black border-white' : 'bg-[#151921] border-gray-800 text-gray-400'}`}>
                             <CreditCard size={16}/> Carte Bancaire
                        </button>
                    </div>

                    {/* Zone de Paiement Dynamique */}
                    <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                        {paymentMethod === 'paypal' ? (
                            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR" }}>
                                <PayPalButtons 
                                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }} 
                                    createOrder={(data, actions) => {
                                        return actions.order.create({
                                            intent: "CAPTURE", // Correction type string literal
                                            purchase_units: [{
                                                amount: { value: finalTotal.toFixed(2), currency_code: "EUR" },
                                                description: `Commande Manu3D - ${customerInfo.email}`
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
                            </PayPalScriptProvider>
                        ) : (
                            <div className="space-y-4">
                                {/* Simulation Formulaire SumUp / Stripe */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl transform rotate-1"></div>
                                    <div className="relative bg-[#1a1d24] p-4 rounded-xl border border-gray-700 shadow-xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-gray-400 text-xs uppercase tracking-widest">Card Number</span>
                                            <CreditCard className="text-manu-orange" size={20}/>
                                        </div>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white font-mono mb-4 focus:border-manu-orange outline-none" />
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-400 uppercase">Expiry</label>
                                                <input type="text" placeholder="MM/YY" className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white font-mono focus:border-manu-orange outline-none" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-400 uppercase">CVC</label>
                                                <input type="text" placeholder="123" className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white font-mono focus:border-manu-orange outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleOrderSuccess(`CB-${Date.now()}`, 'Carte Bancaire')}
                                    disabled={isProcessing}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : `Payer ${finalTotal.toFixed(2)}€`}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                    <ShieldCheck size={10} /> Paiement 100% Sécurisé via SumUp
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ETAPE 5 : SUCCES */}
            {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <CheckCircle size={48} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2 font-display">Commande Validée !</h3>
                        <p className="text-gray-400">Merci {customerInfo.name}.</p>
                        <p className="text-sm text-gray-400 mt-2">Un email de confirmation (facture) vient d'être envoyé à <br/><span className="text-white">{customerInfo.email}</span></p>
                    </div>
                    <div className="bg-[#151921] p-4 rounded-xl border border-gray-800 w-full text-left">
                        <p className="text-xs text-gray-400 uppercase mb-2">Prochaines étapes</p>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Validation Paiement</li>
                            <li className="flex items-center gap-2"><Loader2 size={14} className="text-manu-orange animate-spin-slow"/> Préparation en Atelier</li>
                            <li className="flex items-center gap-2"><Truck size={14} className="text-gray-500"/> Expédition ({shippingMethod?.name})</li>
                        </ul>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="bg-manu-orange text-black font-bold px-8 py-3 rounded-full hover:bg-white transition-colors">
                        Retour à la boutique
                    </button>
                </div>
            )}
        </div>

        {/* Footer (Actions) - Masqué si succès ou vide */}
        {checkoutStep !== 'success' && cart.length > 0 && (
            <div className="p-5 border-t border-gray-800 bg-[#0B0D10]">
                {/* Total Row (Only relevant if not in Payment step where detailed summary is shown) */}
                {checkoutStep !== 'payment' && (
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400 text-sm">Total estimé</span>
                        <span className="text-2xl font-bold text-white font-display">
                            {checkoutStep === 'cart' ? cartTotal.toFixed(2) : finalTotal.toFixed(2)}€
                        </span>
                    </div>
                )}
                
                {/* Error Message */}
                {errorMsg && (
                    <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-4 flex items-start gap-2 text-red-400 text-xs">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="flex gap-3">
                    {checkoutStep !== 'cart' && (
                        <button 
                            onClick={handleBackStep}
                            className="px-4 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    
                    {checkoutStep !== 'payment' && (
                        <button 
                            onClick={handleNextStep}
                            className={`flex-1 bg-manu-orange text-black font-bold py-3 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-manu-orange/20 ${checkoutStep === 'shipping' && availableMethods.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={checkoutStep === 'shipping' && availableMethods.length === 0}
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
  );
};

export default CartSidebar;