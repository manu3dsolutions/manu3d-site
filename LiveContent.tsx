import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  HERO_CONTENT as DEFAULT_HERO, 
  PRODUCTS as DEFAULT_PRODUCTS, 
  PROMO_CONTENT as DEFAULT_PROMO,
  PARTNERS as DEFAULT_PARTNERS,
  REVIEWS as DEFAULT_REVIEWS,
  PORTFOLIO_ITEMS as DEFAULT_PORTFOLIO,
  ASSETS as DEFAULT_ASSETS,
  SITE_CONFIG_DEFAULT,
  ARTICLES as DEFAULT_ARTICLES
} from './constants';
import { Product, Partner, Review, PortfolioItem, Creator, ShippingMethod, GlobalSiteConfig, Article } from './types';
import { supabase } from './supabaseClient';

// Interface étendue pour inclure les matériaux
export interface PrintingMaterial {
  id: string;
  name: string;
  type: string;
  density: number;
  cost_per_gram: number;
  color_hex: string;
  active: boolean;
}

interface LiveContentContextType {
  hero: typeof DEFAULT_HERO;
  products: Product[];
  promo: typeof DEFAULT_PROMO;
  assets: typeof DEFAULT_ASSETS;
  partners: Partner[];
  reviews: Review[];
  portfolio: PortfolioItem[];
  creators: Creator[];
  shippingMethods: ShippingMethod[];
  siteConfig: GlobalSiteConfig;
  printingMaterials: PrintingMaterial[];
  articles: Article[];
  refreshData: () => Promise<void>; 
  loading: boolean;
  usingLive: boolean;
  error: string | null;
}

const LiveContentContext = createContext<LiveContentContextType>({
  hero: DEFAULT_HERO,
  products: DEFAULT_PRODUCTS,
  promo: DEFAULT_PROMO,
  assets: DEFAULT_ASSETS,
  partners: DEFAULT_PARTNERS,
  reviews: DEFAULT_REVIEWS,
  portfolio: DEFAULT_PORTFOLIO,
  creators: [],
  shippingMethods: [],
  siteConfig: SITE_CONFIG_DEFAULT,
  printingMaterials: [],
  articles: DEFAULT_ARTICLES,
  refreshData: async () => {},
  loading: false,
  usingLive: false,
  error: null
});

export const LiveContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [promo, setPromo] = useState(DEFAULT_PROMO);
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [siteConfig, setSiteConfig] = useState<GlobalSiteConfig>(SITE_CONFIG_DEFAULT);
  const [printingMaterials, setPrintingMaterials] = useState<PrintingMaterial[]>([]);
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);
  
  const [loading, setLoading] = useState(false);
  const [usingLive, setUsingLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    // Utilisation ultra-sécurisée de import.meta.env
    const env = (import.meta.env || {}) as any;
    const url = env.VITE_SUPABASE_URL;
    
    if (!url || url === '' || url.includes('placeholder')) {
        return;
    }

    setLoading(true);
    setError(null);

    // Fonction helper pour récupérer des données sans faire planter tout le site si une table manque
    const safeFetch = async (query: any, fallbackValue: any = []) => {
        try {
            const { data, error } = await query;
            if (error) {
                console.warn(`⚠️ Supabase Warning: ${error.message}`);
                return fallbackValue;
            }
            return data;
        } catch (e) {
            console.warn("⚠️ Fetch Error:", e);
            return fallbackValue;
        }
    };

    try {
      // 1. CHARGEMENT PARALLÈLE ROBUSTE
      const [
          productsData, 
          configData, 
          partnersData, 
          reviewsData, 
          portfolioData,
          creatorsData,
          shippingData,
          materialsData,
          articlesData
      ] = await Promise.all([
          safeFetch(supabase.from('products').select('*').eq('active', true).order('id', { ascending: true })),
          safeFetch(supabase.from('site_config').select('*')),
          safeFetch(supabase.from('partners').select('*').order('display_order', { ascending: true })),
          safeFetch(supabase.from('reviews').select('*').order('id', { ascending: false })),
          safeFetch(supabase.from('portfolio').select('*').order('id', { ascending: true })),
          safeFetch(supabase.from('creators').select('*')),
          safeFetch(supabase.from('shipping_methods').select('*').order('base_price', { ascending: true })),
          safeFetch(supabase.from('printing_materials').select('*').eq('active', true)),
          safeFetch(supabase.from('articles').select('*').order('date', { ascending: false }))
      ]);

      // 2. PRODUITS
      if (productsData && productsData.length > 0) {
          const mappedProducts: Product[] = productsData.map((p: any) => ({
              id: p.id,
              title: p.title,
              category: p.category || 'Figurine',
              price: p.price,
              numericPrice: parseFloat(p.price.replace('€', '').trim()) || 0,
              image: p.image, 
              gallery: p.gallery || [],
              description: p.description,
              tags: p.tags || [],
              isNew: p.is_new || false,
              creatorId: p.creator_id,
              weightG: p.weight_g || 100,
              stock: p.stock || 5
          }));
          setProducts(mappedProducts);
      }

      // 3. CONFIG GLOBALE
      if (configData && configData.length > 0) {
          const newHero = { ...DEFAULT_HERO };
          const newPromo = { ...DEFAULT_PROMO };
          const newAssets = { ...DEFAULT_ASSETS };
          const newSiteConfig = { ...SITE_CONFIG_DEFAULT };
          newSiteConfig.invoice = { ...SITE_CONFIG_DEFAULT.invoice };

          configData.forEach((row: any) => {
              if (row.key === 'hero_title1') newHero.titleLine1 = row.value;
              if (row.key === 'hero_title2') newHero.titleLine2 = row.value;
              if (row.key === 'hero_subtitle') newHero.subtitle = row.value;
              if (row.key === 'hero_badge') newHero.badge = row.value;
              if (row.key === 'hero_cta_primary') newHero.ctaPrimary = row.value;
              if (row.key === 'hero_cta_secondary') newHero.ctaSecondary = row.value;
              
              if (row.key === 'promo_text') newPromo.text = row.value;
              if (row.key === 'promo_link') newPromo.link = row.value;
              if (row.key === 'promo_active') newPromo.isActive = row.value === 'true';

              if (row.key === 'logo_url') newAssets.logo = row.value;
              if (row.key === 'hero_video_url') newAssets.heroVideo = row.value;

              if (row.key === 'shipping_free_threshold') newSiteConfig.shippingFreeThreshold = parseFloat(row.value);
              if (row.key === 'invoice_company_name') newSiteConfig.invoice.companyName = row.value;
              if (row.key === 'invoice_siret') newSiteConfig.invoice.siret = row.value;
              if (row.key === 'invoice_email') newSiteConfig.invoice.email = row.value;
          });
          setHero(newHero);
          setPromo(newPromo);
          setAssets(newAssets);
          setSiteConfig(newSiteConfig);
      }

      // 4. MATERIAUX
      if (materialsData && materialsData.length > 0) {
          const mappedMats = materialsData.map((m: any) => ({
              id: m.id,
              name: m.name,
              type: m.type,
              density: Number(m.density),
              cost_per_gram: Number(m.cost_per_gram),
              color_hex: m.color_hex || 'FFFFFF',
              active: m.active
          }));
          setPrintingMaterials(mappedMats);
      }

      // 5. AUTRES DONNEES
      if (partnersData && partnersData.length > 0) setPartners(partnersData.map((p: any) => ({...p, logoUrl: p.logo_url})));
      if (reviewsData && reviewsData.length > 0) setReviews(reviewsData.map((r: any) => ({...r, item: r.item_purchased, date: r.display_date || 'Récemment'})));
      if (portfolioData && portfolioData.length > 0) setPortfolio(portfolioData);
      if (creatorsData && creatorsData.length > 0) setCreators(creatorsData.map((c: any) => ({...c, avatarUrl: c.avatar_url, bannerUrl: c.banner_url, websiteUrl: c.website_url, socialInstagram: c.social_instagram})));
      if (shippingData && shippingData.length > 0) setShippingMethods(shippingData.map((s: any) => ({...s, basePrice: s.base_price, pricePerKg: s.price_per_kg, isPickup: s.is_pickup, estimatedDays: s.estimated_days, minWeight: s.min_weight, maxWeight: s.max_weight})));
      if (articlesData && articlesData.length > 0) setArticles(articlesData.map((a: any) => ({...a, date: new Date(a.date).toLocaleDateString('fr-FR'), readTime: a.read_time})));

      setUsingLive(true);
    } catch (err: any) {
      console.error("❌ ERREUR CRITIQUE:", err.message);
      // On ne set pas d'erreur globale si on a pu charger au moins les produits par défaut du code
      if (products.length === 0) {
          setError("Erreur de chargement.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LiveContentContext.Provider value={{ 
        hero, products, promo, assets, partners, reviews, portfolio, creators, shippingMethods, siteConfig, printingMaterials, articles,
        loading, usingLive, error,
        refreshData: fetchData
    }}>
      {children}
    </LiveContentContext.Provider>
  );
};

export const useLiveContent = () => useContext(LiveContentContext);