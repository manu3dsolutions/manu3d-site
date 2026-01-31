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
} from '../constants';
import { Product, Partner, Review, PortfolioItem, Creator, ShippingMethod, GlobalSiteConfig, Article } from '../types';
import { supabase } from '../supabaseClient';

// Types pour le contexte complet
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
  articles: Article[];
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
  articles: DEFAULT_ARTICLES,
  loading: false,
  usingLive: false,
  error: null
});

export const LiveContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // États pour toutes les données
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
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);
  
  const [loading, setLoading] = useState(false);
  const [usingLive, setUsingLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Utilisation ultra-sécurisée de import.meta.env
    const env = (import.meta.env || {}) as any;
    const url = env.VITE_SUPABASE_URL;
    
    if (!url || url === '' || url.includes('placeholder')) {
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Exécution en parallèle de toutes les requêtes pour la performance
        const [
            productsRes, 
            configRes, 
            partnersRes, 
            reviewsRes, 
            portfolioRes,
            creatorsRes,
            shippingRes,
            articlesRes 
        ] = await Promise.all([
            supabase.from('products').select('*').eq('active', true).order('id', { ascending: true }),
            supabase.from('site_config').select('*'),
            supabase.from('partners').select('*').order('display_order', { ascending: true }),
            supabase.from('reviews').select('*').order('id', { ascending: false }),
            supabase.from('portfolio').select('*').order('id', { ascending: true }),
            supabase.from('creators').select('*'),
            supabase.from('shipping_methods').select('*').order('base_price', { ascending: true }),
            supabase.from('articles').select('*').order('date', { ascending: false })
        ]);

        // 1. Traitement PRODUITS
        if (productsRes.data && productsRes.data.length > 0) {
            const mappedProducts: Product[] = productsRes.data.map((p: any) => ({
                id: p.id,
                title: p.title,
                category: p.category || 'Figurine',
                price: p.price,
                numericPrice: parseFloat(p.price.replace('€', '').trim()) || 0, // Parsing sécurisé
                image: p.image, 
                gallery: p.gallery || [], // Tableau d'URLs images
                description: p.description,
                tags: p.tags || [], // Tableau de strings
                isNew: p.is_new || false,
                creatorId: p.creator_id,
                weightG: p.weight_g || 100,
                stock: p.stock || 5
            }));
            setProducts(mappedProducts);
        }

        // 2. Traitement CONFIG (Hero, Promo, Assets, Invoice, Shipping Rules)
        if (configRes.data && configRes.data.length > 0) {
            const newHero = { ...DEFAULT_HERO };
            const newPromo = { ...DEFAULT_PROMO };
            const newAssets = { ...DEFAULT_ASSETS };
            const newSiteConfig = { ...SITE_CONFIG_DEFAULT }; 
            
            newSiteConfig.invoice = { ...SITE_CONFIG_DEFAULT.invoice };

            configRes.data.forEach((row: any) => {
                // Hero
                if (row.key === 'hero_title1') newHero.titleLine1 = row.value;
                if (row.key === 'hero_title2') newHero.titleLine2 = row.value;
                if (row.key === 'hero_subtitle') newHero.subtitle = row.value;
                if (row.key === 'hero_badge') newHero.badge = row.value;
                if (row.key === 'hero_cta_primary') newHero.ctaPrimary = row.value;
                if (row.key === 'hero_cta_secondary') newHero.ctaSecondary = row.value;
                
                // Promo
                if (row.key === 'promo_text') newPromo.text = row.value;
                if (row.key === 'promo_link') newPromo.link = row.value;
                if (row.key === 'promo_active') newPromo.isActive = row.value === 'true';

                // Assets
                if (row.key === 'logo_url') newAssets.logo = row.value;
                if (row.key === 'hero_video_url') newAssets.heroVideo = row.value;

                // Site Config Global (Shipping & Invoice)
                if (row.key === 'shipping_free_threshold') newSiteConfig.shippingFreeThreshold = parseFloat(row.value);
                if (row.key === 'invoice_company_name') newSiteConfig.invoice.companyName = row.value;
                if (row.key === 'invoice_address_line1') newSiteConfig.invoice.addressLine1 = row.value;
                if (row.key === 'invoice_address_line2') newSiteConfig.invoice.addressLine2 = row.value;
                if (row.key === 'invoice_siret') newSiteConfig.invoice.siret = row.value;
                if (row.key === 'invoice_email') newSiteConfig.invoice.email = row.value;
                if (row.key === 'invoice_footer_text') newSiteConfig.invoice.footerText = row.value;
            });
            setHero(newHero);
            setPromo(newPromo);
            setAssets(newAssets);
            setSiteConfig(newSiteConfig);
        }

        // 3. Traitement PARTENAIRES
        if (partnersRes.data && partnersRes.data.length > 0) {
            const mappedPartners: Partner[] = partnersRes.data.map((p: any) => ({
                id: p.id,
                name: p.name,
                logoUrl: p.logo_url,
                description: p.description,
                url: p.url
            }));
            setPartners(mappedPartners);
        }

        // 4. Traitement AVIS
        if (reviewsRes.data && reviewsRes.data.length > 0) {
            const mappedReviews: Review[] = reviewsRes.data.map((r: any) => ({
                id: r.id,
                name: r.name,
                role: r.role,
                rating: r.rating,
                text: r.text,
                item: r.item_purchased,
                date: r.display_date || 'Récemment'
            }));
            setReviews(mappedReviews);
        }

        // 5. Traitement PORTFOLIO
        if (portfolioRes.data && portfolioRes.data.length > 0) {
            const mappedPortfolio: PortfolioItem[] = portfolioRes.data.map((p: any) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                image: p.image
            }));
            setPortfolio(mappedPortfolio);
        }

        // 6. Traitement CREATEURS
        if (creatorsRes.data && creatorsRes.data.length > 0) {
            const mappedCreators: Creator[] = creatorsRes.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                bio: c.bio,
                avatarUrl: c.avatar_url,
                bannerUrl: c.banner_url,
                websiteUrl: c.website_url,
                socialInstagram: c.social_instagram
            }));
            setCreators(mappedCreators);
        }

        // 7. Traitement SHIPPING
        if (shippingRes.data && shippingRes.data.length > 0) {
            const mappedShipping: ShippingMethod[] = shippingRes.data.map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                basePrice: s.base_price,
                pricePerKg: s.price_per_kg,
                isPickup: s.is_pickup,
                estimatedDays: s.estimated_days,
                minWeight: s.min_weight || 0,
                maxWeight: s.max_weight || 999999
            }));
            setShippingMethods(mappedShipping);
        }

        // 8. Traitement ARTICLES (BLOG)
        if (articlesRes.data && articlesRes.data.length > 0) {
            const mappedArticles: Article[] = articlesRes.data.map((a: any) => ({
                id: a.id,
                title: a.title,
                excerpt: a.excerpt,
                category: a.category,
                image: a.image,
                date: new Date(a.date).toLocaleDateString('fr-FR'),
                readTime: a.read_time,
                author: a.author
            }));
            setArticles(mappedArticles);
        }

        setUsingLive(true);

      } catch (err: any) {
        console.error("❌ ERREUR SUPABASE:", err.message);
        setError("Erreur de chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <LiveContentContext.Provider value={{ 
        hero, products, promo, assets, partners, reviews, portfolio, creators, shippingMethods, siteConfig, articles,
        loading, usingLive, error 
    }}>
      {children}
    </LiveContentContext.Provider>
  );
};

export const useLiveContent = () => useContext(LiveContentContext);