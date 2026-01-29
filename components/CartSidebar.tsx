import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, CheckCircle, AlertCircle, Package, Store, Ticket, Loader2, FileText, Download, Printer } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLiveContent } from '../LiveContent';
import { supabase } from '../supabaseClient';

const CartSidebar: React.FC = () => {
  const { 
    cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, 
    cartTotal, cartWeight, shippingMethod, setShippingMethod, shippingCost, isFreeShipping,
    finalTotal, clearCart,
    coupon, discountAmount, applyCoupon, removeCoupon
  } = useCart();
  
  const { shippingMethods, siteConfig } = useLiveContent();
  
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', address: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State pour l'input coupon
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  if (!isCartOpen) return null;

  const handleNextStep = () => {
    if (checkoutStep === 'cart') setCheckoutStep('shipping');
    else if (checkoutStep === 'shipping') {
       if(!shippingMethod) return alert('Veuillez choisir un mode de livraison');
       setCheckoutStep('payment');
    }
  };

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

  // --- GENERATE INVOICE HTML ---
  const generateInvoice = () => {
      const invoiceDate = new Date().toLocaleDateString('fr-FR');
      const invoiceNum = `FACT-${Date.now().toString().slice(-6)}`;
      const { invoice } = siteConfig;
      
      const invoiceHTML = `
        <html>
        <head>
          <title>Facture ${invoiceNum}</title>
          <style>
            body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #F39C12; }
            .logo { font-size: 24px; font-weight: bold; color: #F39C12; text-transform: uppercase; }
            .meta { text-align: right; }
            .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .box { width: 45%; }
            .box h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; font-size: 12px; text-transform: uppercase; color: #777; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; border-bottom: 2px solid #000; padding: 10px; font-size: 12px; text-transform: uppercase; }
            td { border-bottom: 1px solid #eee; padding: 10px; }
            .totals { width: 300px; margin-left: auto; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
             <div class="logo">${invoice.companyName}</div>
             <div class="meta">
               <strong>Facture N° :</strong> ${invoiceNum}<br>
               <strong>Date :</strong> ${invoiceDate}
             </div>
          </div>
          
          <div class="addresses">
             <div class="box">
               <h3>Vendeur</h3>
               <strong>${invoice.companyName}</strong><br>
               ${invoice.addressLine1}<br>
               ${invoice.addressLine2}<br>
               ${invoice.email}<br>
               ${invoice.siret}
             </div>
             <div class="box">
               <h3>Client</h3>
               <strong>${customerInfo.name}</strong><br>
               ${customerInfo.email}<br>
               ${customerInfo.address.replace(/\n/g, '<br>')}
             </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qté</th>
                <th>PU</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>
                    <strong>${item.title}</strong><br>
                    <small>${item.type === 'custom' ? 'Impression Sur Mesure' : item.category}</small>
                  </td>
                  <td>${item.quantity}</td>
                  <td>${item.numericPrice ? item.numericPrice.toFixed(2) : parseFloat(item.price).toFixed(2)}€</td>
                  <td style="text-align:right">${((item.numericPrice ? item.numericPrice : parseFloat(item.price)) * item.quantity).toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
             <div class="row">
               <span>Sous-total</span>
               <span>${cartTotal.toFixed(2)}€</span>
             </div>
             ${discountAmount > 0 ? `
             <div class="row" style="color:green">
               <span>Remise (${coupon?.code})</span>
               <span>-${discountAmount.toFixed(2)}€</span>
             </div>` : ''}
             <div class="row">
               <span>Livraison (${shippingMethod?.name})</span>
               <span>${shippingCost === 0 ? 'Offert' : shippingCost.toFixed(2) + '€'}</span>
             </div>
             <div class="row total-row">
               <span>Net à Payer</span>
               <span>${finalTotal.toFixed(2)}€</span>
             </div>
          </div>

          <div class="footer">
             ${invoice.footerText}<br>
             Merci de votre confiance !
          </div>
          
          <script>window.print();</script>
        </body>
        </html>
      `;
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
          newWindow.document.write(invoiceHTML);
          newWindow.document.close();
      } else {
          alert("Pop-up bloqué. Autorisez les pop-ups pour imprimer la facture.");
      }
  };

  const finalizeOrder = async () => {
    setIsProcessing(true);
    try {
        const { error } = await supabase.from('orders').insert({
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            shipping_address: customerInfo.address,
            total_amount: finalTotal,
            shipping_cost: shippingCost,
            discount_amount: discountAmount,
            coupon_code: coupon ? coupon.code : null,
            shipping_method_text: shippingMethod?.name,
            items_json: JSON.stringify(cart),
            payment_status: 'pending_manual',
            order_status: 'new'
        });

        if (error) throw error;

        setTimeout(() => {
          setCheckoutStep('success');
          // On ne vide pas le panier tout de suite pour permettre l'impression de la facture, ou on sauvegarde l'état pour la facture
          // Dans cette implémentation simple, on garde les infos en mémoire jusqu'à la fermeture
          setIsProcessing(false);
        }, 1500);

    } catch (err: any) {
        setErrorMsg("Erreur sauvegarde commande: " + err.message);
        setIsProcessing(false);
    }
  };

  // Petit helper pour fermer proprement après succès
  const handleCloseSuccess = () => {
      clearCart();
      setIsCartOpen(false);
      setCheckoutStep('cart');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />
      
      <div className="relative w-full max-w-md bg-[#151921] h-full shadow-2xl border-l border-gray-800 flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#0F1216]">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-manu-orange" />
            {checkoutStep === 'cart' && 'Mon Loot Bag'}
            {checkoutStep === 'shipping' && 'Expédition'}
            {checkoutStep === 'payment' && 'Confirmation'}
            {checkoutStep === 'success' && 'Commande Validée'}
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
          
          {errorMsg && (
            <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 p-3 rounded text-sm flex items-center gap-2">
               <AlertCircle size={16} /> {errorMsg}
               <button onClick={() => setErrorMsg(null)} className="ml-auto"><X size={14}/></button>
            </div>
          )}

          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                   <ShoppingBag size={48} className="mb-4 opacity-50" />
                   <p>Votre sac est vide, aventurier !</p>
                   <button onClick={() => setIsCartOpen(false)} className="mt-4 text-manu-orange underline text-sm">Retourner à la boutique</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-black/30 p-3 rounded-lg border border-gray-700">
                      {item.type === 'custom' ? (
                          <div className="w-16 h-16 bg-blue-900/20 border border-blue-500/30 rounded flex items-center justify-center text-blue-400">
                              <FileText size={24} />
                          </div>
                      ) : (
                          <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded bg-gray-800" />
                      )}
                      
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-bold line-clamp-1">{item.title}</h4>
                        {item.type === 'custom' && (
                            <p className="text-[10px] text-gray-400 line-clamp-1">{item.description}</p>
                        )}
                        <p className="text-manu-orange font-mono text-xs font-bold mt-1">
                            {item.numericPrice ? item.numericPrice.toFixed(2) : item.price}€
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1">
                             <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-white"><Minus size={12} /></button>
                             <span className="text-xs text-white font-mono w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white"><Plus size={12} /></button>
                           </div>
                           <button onClick={() => removeFromCart(item.id)} className="text-red-900 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Coupon Section */}
                  <div className="mt-6 pt-4 border-t border-gray-800">
                     <label className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-1">
                        <Ticket size={12} /> Code Promo
                     </label>
                     {coupon ? (
                         <div className="flex justify-between items-center bg-green-900/20 border border-green-500/50 rounded p-3 text-sm">
                             <div className="flex flex-col">
                                <span className="text-green-400 font-bold tracking-wider">{coupon.code}</span>
                                <span className="text-green-600/70 text-[10px]">
                                    -{coupon.discount_type === 'percent' ? `${coupon.value}%` : `${coupon.value}€`} appliqué
                                </span>
                             </div>
                             <button onClick={removeCoupon} className="text-gray-400 hover:text-white"><X size={14} /></button>
                         </div>
                     ) : (
                         <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={couponInput}
                                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="ENTREZ LE CODE"
                                className="flex-1 bg-black border border-gray-700 rounded p-2 text-white text-sm focus:border-manu-orange outline-none uppercase tracking-widest"
                             />
                             <button 
                                onClick={handleApplyCoupon}
                                disabled={couponLoading}
                                className="bg-gray-800 hover:bg-manu-orange hover:text-black text-white px-4 rounded text-xs font-bold transition-colors disabled:opacity-50"
                             >
                                {couponLoading ? <Loader2 className="animate-spin" size={14} /> : "OK"}
                             </button>
                         </div>
                     )}
                     {couponMsg && (
                        <p className={`text-[10px] mt-2 ${couponMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {couponMsg.text}
                        </p>
                     )}
                  </div>
                </div>
              )}
            </>
          )}

          {checkoutStep === 'shipping' && (
            <div className="space-y-6 animate-in fade-in">
                <div>
                    <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Poids total du colis</label>
                    <div className="flex items-center gap-2 bg-black/30 p-3 rounded border border-gray-700 text-white">
                        <Package size={16} className="text-gray-500" />
                        <span>{cartWeight} g</span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Choisir un mode de livraison</label>
                    <div className="space-y-2">
                        {/* Option pour affichage seulement si applicable. Ici on affiche tout car la logique métier du 'gratuit' est dans le prix affiché */}
                        {shippingMethods.map(method => {
                            // Calcul du prix à afficher pour cette méthode
                            let displayPrice = 0;
                            if (method.isPickup) displayPrice = 0;
                            else if (isFreeShipping) displayPrice = 0;
                            else displayPrice = method.basePrice + ((cartWeight/1000) * method.pricePerKg);

                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setShippingMethod(method)}
                                    className={`w-full flex justify-between items-center p-4 rounded-lg border transition-all ${shippingMethod?.id === method.id ? 'bg-manu-orange/10 border-manu-orange text-white' : 'bg-black/30 border-gray-700 text-gray-400 hover:bg-black/50'}`}
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-sm flex items-center gap-2">
                                            {method.name}
                                            {method.name.includes('Relais') && <Store size={14} className="text-manu-orange" />}
                                        </div>
                                        <div className="text-xs opacity-70">{method.description}</div>
                                        <div className="text-[10px] mt-1 text-green-500 flex items-center gap-1"><Truck size={10} /> {method.estimatedDays}</div>
                                    </div>
                                    <div className="font-mono font-bold text-sm">
                                        {displayPrice === 0 ? 'Gratuit' : displayPrice.toFixed(2) + '€'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {isFreeShipping && (
                        <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
                           <CheckCircle size={10} /> Frais de port offerts (commande {'>'} {siteConfig.shippingFreeThreshold}€)
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                   <h4 className="text-white text-sm font-bold border-b border-gray-700 pb-2">Vos Coordonnées</h4>
                   <input 
                      type="text" 
                      placeholder="Nom complet" 
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-manu-orange outline-none text-sm"
                   />
                   <input 
                      type="email" 
                      placeholder="Email" 
                      value={customerInfo.email}
                      onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-manu-orange outline-none text-sm"
                   />
                   {!shippingMethod?.isPickup && (
                       <textarea 
                          placeholder="Adresse de livraison complète" 
                          value={customerInfo.address}
                          onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                          className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-manu-orange outline-none text-sm h-20"
                       />
                   )}
                </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
             <div className="space-y-6 animate-in fade-in py-2">
                
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 flex flex-col items-center justify-center text-center">
                   <span className="text-gray-400 text-sm mb-2">Montant total à régler</span>
                   <span className="text-manu-orange font-bold font-display text-4xl mb-4">{finalTotal.toFixed(2)}€</span>
                   
                   <div className="text-xs text-gray-500 space-y-1 w-full text-left bg-black/20 p-3 rounded">
                        <div className="flex justify-between">
                            <span>Sous-total:</span>
                            <span>{cartTotal.toFixed(2)}€</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-green-400">
                                <span>Remise ({coupon?.code}):</span>
                                <span>-{discountAmount.toFixed(2)}€</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Livraison ({shippingMethod?.name}):</span>
                            <span>{shippingCost === 0 ? 'Offerte' : `${shippingCost.toFixed(2)}€`}</span>
                        </div>
                   </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg border border-gray-700 text-sm space-y-3">
                    <p className="text-gray-300">
                        <span className="font-bold text-white">Note Importante :</span> Le paiement en ligne est désactivé.
                    </p>
                    <p className="text-gray-400">
                        En validant, la commande est enregistrée. Vous recevrez la facture officielle et le lien de paiement par email.
                    </p>
                </div>

                <button 
                  onClick={finalizeOrder}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Validation...' : 'Valider la commande'}
                </button>

             </div>
          )}

          {checkoutStep === 'success' && (
             <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6">
                   <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Commande Validée !</h3>
                <p className="text-gray-400 text-sm mb-6">
                   Merci {customerInfo.name}.<br/>
                   Votre facture est prête.
                </p>
                
                <div className="space-y-3 w-full">
                    <button onClick={generateInvoice} className="w-full bg-manu-orange hover:bg-white text-black px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                        <Printer size={16} /> Imprimer la Facture
                    </button>
                    <button onClick={handleCloseSuccess} className="w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-sm font-bold">
                        Fermer et Nouveau Panier
                    </button>
                </div>
             </div>
          )}

        </div>

        {checkoutStep === 'cart' && cart.length > 0 && (
          <div className="p-5 border-t border-gray-800 bg-[#0F1216]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-sm">Sous-total</span>
              <span className="text-white font-bold">{cartTotal.toFixed(2)}€</span>
            </div>
            {discountAmount > 0 && (
                <div className="flex justify-between items-center mb-1 text-green-400 text-sm">
                    <span>Remise</span>
                    <span>-{discountAmount.toFixed(2)}€</span>
                </div>
            )}
            <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-800">
              <span className="text-white font-bold">Total estimé</span>
              <span className="text-2xl font-bold text-manu-orange font-display">{(cartTotal - discountAmount).toFixed(2)}€</span>
            </div>
            <button 
              onClick={handleNextStep}
              className="w-full bg-manu-orange hover:bg-white text-black font-bold py-3 rounded-lg uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(243,156,18,0.3)] hover:shadow-[0_0_25px_rgba(243,156,18,0.5)]"
            >
              Commander
            </button>
          </div>
        )}

        {checkoutStep === 'shipping' && (
             <div className="p-5 border-t border-gray-800 bg-[#0F1216]">
                <button 
                  onClick={handleNextStep}
                  className="w-full bg-manu-orange hover:bg-white text-black font-bold py-3 rounded-lg uppercase tracking-wider transition-all"
                >
                  Suivant
                </button>
                 <button onClick={() => setCheckoutStep('cart')} className="w-full text-center text-gray-500 text-xs mt-3 hover:text-white">Retour au panier</button>
             </div>
        )}

        {checkoutStep === 'payment' && (
             <div className="p-5 border-t border-gray-800 bg-[#0F1216]">
                 <button onClick={() => setCheckoutStep('shipping')} className="w-full text-center text-gray-500 text-xs mt-3 hover:text-white">Retour expédition</button>
             </div>
        )}

      </div>
    </div>
  );
};

export default CartSidebar;