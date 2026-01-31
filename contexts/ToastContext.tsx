import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove après 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Container des Toasts */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 border backdrop-blur-md ${
              t.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' :
              t.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' :
              'bg-gray-800/90 border-gray-600 text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${t.type === 'success' ? 'bg-green-500 text-black' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>
                {t.type === 'success' ? <CheckCircle size={14} /> : t.type === 'error' ? <AlertCircle size={14} /> : <Info size={14} />}
            </div>
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={14}/></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);