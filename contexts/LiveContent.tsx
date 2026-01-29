import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GOOGLE_SHEET_ID, 
  HERO_CONTENT as DEFAULT_HERO, 
  PRODUCTS as DEFAULT_PRODUCTS, 
  PROMO_CONTENT as DEFAULT_PROMO 
} from '../constants';
import { Product } from '../types';

// Types pour le contexte
interface LiveContentContextType {
  hero: typeof DEFAULT_HERO;
  products: Product[];
  promo: typeof DEFAULT_PROMO;
  loading: boolean;
  usingLive: boolean;
}

const LiveContentContext = createContext<LiveContentContextType>({
  hero: DEFAULT_HERO,
  products: DEFAULT_PRODUCTS,
  promo: DEFAULT_PROMO,
  loading: false,
  usingLive: false
});

// Helper pour parser le CSV (simple et robuste pour ce cas d'usage)
const parseCSV = (text: string) => {
  const lines = text.split('\n');
  if (lines.length < 2) return []; // Pas assez de données

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values: string[] = [];
    let inQuote = false;
    let currentValue = '';
    
    // Parser CSV caractère par caractère pour gérer les virgules dans le texte
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentValue.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

    // Création de l'objet
    const obj: any = {};
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        // Nettoyage des valeurs
        obj[header] = values[index];
      }
    });
    return obj;
  });
};

export const LiveContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [promo, setPromo] = useState(DEFAULT_PROMO);
  const [loading, setLoading] = useState(false);
  const [usingLive, setUsingLive] = useState(false);

  useEffect(() => {
    if (!GOOGLE_SHEET_ID) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Utilisation de l'endpoint Google Visualization API (gviz) qui gère mieux le CORS pour les feuilles partagées publiquement
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;
        
        const res = await fetch(url);
        
        if (!res.ok) {
           throw new Error(`Erreur HTTP: ${res.status}`);
        }

        const text = await res.text();
        const data = parseCSV(text);

        if (data.length === 0) return; // Tableau vide ou erreur de parsing

        const newProducts: Product[] = [];
        const newHero = { ...DEFAULT_HERO };
        const newPromo = { ...DEFAULT_PROMO };
        let hasLiveConfig = false;

        data.forEach((row: any) => {
            // Si c'est un produit
            if (row.type === 'product' && row.title) {
                newProducts.push({
                    id: parseInt(row.id) || Math.floor(Math.random() * 10000),
                    title: row.title,
                    category: row.category || 'Figurine',
                    price: row.price || '0€',
                    image: row.image || 'https://via.placeholder.com/400',
                    description: row.description || '',
                    rarity: row.rarity || 'common',
                    isNew: row.is_new ? row.is_new.toLowerCase() === 'true' : false
                });
                hasLiveConfig = true;
            }
            // Si c'est de la config Hero/Promo
            else if (row.type === 'config') {
                if (row.key === 'hero_title1') newHero.titleLine1 = row.value;
                if (row.key === 'hero_title2') newHero.titleLine2 = row.value;
                if (row.key === 'hero_subtitle') newHero.subtitle = row.value;
                if (row.key === 'hero_badge') newHero.badge = row.value;
                if (row.key === 'promo_text') newPromo.text = row.value;
                if (row.key === 'promo_active') newPromo.isActive = row.value ? row.value.toLowerCase() === 'true' : false;
                hasLiveConfig = true;
            }
        });

        if (hasLiveConfig) {
            if (newProducts.length > 0) setProducts(newProducts);
            setHero(newHero);
            setPromo(newPromo);
            setUsingLive(true);
        }

      } catch (error) {
        console.error("Erreur chargement Google Sheet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <LiveContentContext.Provider value={{ hero, products, promo, loading, usingLive }}>
      {children}
    </LiveContentContext.Provider>
  );
};

export const useLiveContent = () => useContext(LiveContentContext);