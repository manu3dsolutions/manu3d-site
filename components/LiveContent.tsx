import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  HERO_CONTENT as DEFAULT_HERO, 
  PRODUCTS as DEFAULT_PRODUCTS, 
  PROMO_CONTENT as DEFAULT_PROMO 
} from '../constants';
import { Product } from '../types';
import { supabase } from '../supabaseClient';

// Types pour le contexte
interface LiveContentContextType {
  hero: typeof DEFAULT_HERO;
  products: Product[];
  promo: typeof DEFAULT_PROMO;
  loading: boolean;
  usingLive: boolean;
  error: string | null;
}

const LiveContentContext = createContext<LiveContentContextType>({
  hero: DEFAULT_HERO,
  products: DEFAULT_PRODUCTS,
  promo: DEFAULT_PROMO,
  loading: false,
  usingLive: false,
  error: null
});

export const LiveContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [promo, setPromo] = useState(DEFAULT_PROMO);
  const [loading, setLoading] = useState(false);
  const [usingLive, setUsingLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const env = (import.meta.env || {}) as any;
    const url = env.VITE_SUPABASE_URL;
    
    if (!url || url === '' || url.includes('placeholder')) {
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // CORRECTION: Table 'products' en minuscules
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('id', { ascending: true });

        if (productsError) throw productsError;

        if (productsData && productsData.length > 0) {
            const mappedProducts: Product[] = productsData.map((p: any) => ({
                id: p.id,
                title: p.title,
                category: p.category || 'Figurine',
                price: p.price,
                // Gestion du prix numérique s'il n'est pas dans la BDD
                numericPrice: p.price ? parseFloat(p.price.replace('€', '').trim()) : 0,
                image: p.image, 
                description: p.description,
                rarity: p.rarity || 'common',
                isNew: p.is_new || false,
                creatorId: p.creator_id,
                weightG: p.weight_g || 100,
                stock: p.stock || 0
            }));
            setProducts(mappedProducts);
            setUsingLive(true);
        }

        // Récupération de la config
        const { data: configData } = await supabase.from('site_config').select('*');

        if (configData && configData.length > 0) {
            const newHero = { ...DEFAULT_HERO };
            const newPromo = { ...DEFAULT_PROMO };
            
            configData.forEach((row: any) => {
                if (row.key === 'hero_title1') newHero.titleLine1 = row.value;
                if (row.key === 'hero_title2') newHero.titleLine2 = row.value;
                if (row.key === 'hero_subtitle') newHero.subtitle = row.value;
                if (row.key === 'hero_badge') newHero.badge = row.value;
                if (row.key === 'promo_text') newPromo.text = row.value;
                if (row.key === 'promo_active') newPromo.isActive = row.value === 'true';
            });
            setHero(newHero);
            setPromo(newPromo);
        }

      } catch (err: any) {
        console.error("Erreur Supabase:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <LiveContentContext.Provider value={{ hero, products, promo, loading, usingLive, error }}>
      {children}
    </LiveContentContext.Provider>
  );
};

export const useLiveContent = () => useContext(LiveContentContext);