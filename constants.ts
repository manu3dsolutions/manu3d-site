import { Product, Partner, PortfolioItem, GlobalSiteConfig, Article } from './types';

// --- CONFIGURATION GOOGLE SHEETS (MODE AUTOMATIQUE) ---
// 1. Crée un Google Sheet
// 2. Mets-le en "Public" (Lecture seule)
// 3. Copie l'ID dans l'URL (entre /d/ et /edit) et colle-le ci-dessous
export const GOOGLE_SHEET_ID = "1vP8KdN2NfgLhEsfKpbjfKgHpe7LY3wxE_LQpzyfKm7E"; // ID mis à jour

// NOTE: Assurez-vous que le fichier 'manulogo.mp4' et 'logo.png' sont bien dans votre dossier public/
export const ASSETS = {
  logo: "./logo.png", 
  heroVideo: "./manulogo.mp4", 
  badges: {
    abc3d: "https://via.placeholder.com/150?text=ABC3D",
    alkemia: "https://via.placeholder.com/150?text=Alkemia",
    scrazyone: "https://via.placeholder.com/150?text=Scrazyone",
    messy: "https://via.placeholder.com/150?text=MessyPanda",
    modern: "https://via.placeholder.com/150?text=ModernMachine",
    nostalgic: "https://via.placeholder.com/150?text=Nostalgic",
    yosh: "https://via.placeholder.com/150?text=Yosh",
    valeria: "https://via.placeholder.com/150?text=Valeria+Momo",
    puffy: "https://via.placeholder.com/150?text=PuffyPuff",
  }
};

export const PROMO_CONTENT = {
  isActive: true,
  text: "💥 OFFRE DE LANCEMENT : -15% sur tout le rayon Figurine avec le code MANU15 !",
  link: "#shop"
};

export const HERO_CONTENT = {
  badge: "Basé à Montivilliers (76)",
  titleLine1: "Donnez vie à",
  titleLine2: "vos passions",
  subtitle: "Impression 3D résine haute définition, Figurines et Décoration Geek.",
  ctaPrimary: "Découvrir la Boutique",
  ctaSecondary: "Service sur mesure"
};

export const CONTACT_INFO = {
  address: "Montivilliers (76), Normandie",
  email: "contact@manu3d.fr",
  cta: "Tu as les idées ? J'ai la 3D !"
};

export const SITE_CONFIG_DEFAULT: GlobalSiteConfig = {
  shippingFreeThreshold: 100,
  invoice: {
    companyName: "Manu3D",
    addressLine1: CONTACT_INFO.address,
    addressLine2: "France",
    siret: "SIRET : 000 000 000 00000",
    email: CONTACT_INFO.email,
    footerText: "TVA non applicable, article 293 B du CGI."
  }
};

export const PARTNERS: Partner[] = [
  { 
    name: "Scrazyone 3D Printing", 
    logoUrl: ASSETS.badges.scrazyone, 
    description: "Authorized Seller", 
    url: "https://www.patreon.com/scrazyone" 
  },
  { 
    name: "ABC3D Models", 
    logoUrl: ASSETS.badges.abc3d, 
    description: "Official License", 
    url: "https://www.patreon.com/abc3d" 
  },
  { 
    name: "Alkemia Art", 
    logoUrl: ASSETS.badges.alkemia, 
    description: "Official License", 
    url: "https://www.patreon.com/alkemia" 
  },
  { 
    name: "PuffyPuff Toys", 
    logoUrl: ASSETS.badges.puffy, 
    description: "Authorized Seller", 
    url: "https://thangs.com/designer/puffypuff" 
  },
  { 
    name: "Valeria Momo & Mattia", 
    logoUrl: ASSETS.badges.valeria, 
    description: "Premium Partner", 
    url: "https://www.patreon.com/valeriamomo" 
  },
  { 
    name: "Messy Panda", 
    logoUrl: ASSETS.badges.messy, 
    description: "Cute & Pop", 
    url: "https://www.patreon.com/messypanda" 
  },
  { 
    name: "Modern Machine", 
    logoUrl: ASSETS.badges.modern, 
    description: "Tech Design", 
    url: "https://thangs.com/designer/modernmachine" 
  },
  { 
    name: "Nostalgic 3D", 
    logoUrl: ASSETS.badges.nostalgic, 
    description: "Retro Gaming", 
    url: "https://www.patreon.com/nostalgic" 
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 101,
    title: "Pikachu - Gameboy Breakout",
    category: "Decor",
    price: "24.00€",
    image: "/assets/products/pikachu-bronze.jpg",
    gallery: ["/assets/products/pikachu-bronze.jpg", "https://picsum.photos/600/600?random=1", "https://picsum.photos/600/600?random=2"],
    description: "Relief mural effet Bronze Antique. Pikachu jaillissant d'une cartouche Gameboy. Design par ABC3D.",
    isNew: true,
    tags: ["Pokémon", "Retro", "Gameboy", "Résine"]
  },
  {
    id: 102,
    title: "Lugia - Soul Silver",
    category: "Decor",
    price: "24.00€",
    image: "/assets/products/lugia-bronze.jpg",
    gallery: ["/assets/products/lugia-bronze.jpg", "https://picsum.photos/600/600?random=3"],
    description: "Le gardien des mers en relief sortant de sa cartouche. Impression résine & finition Or Vieilli. Design ABC3D.",
    tags: ["Pokémon", "Légendaire", "Silver", "Résine"]
  },
  {
    id: 103,
    title: "Ho-Oh - Heart Gold",
    category: "Decor",
    price: "24.00€",
    image: "/assets/products/hooh-bronze.jpg",
    description: "L'oiseau légendaire Arc-en-ciel. Sculpture murale détaillée résine 8k, effet bronze. Design ABC3D.",
    tags: ["Pokémon", "Légendaire", "Gold", "Résine"]
  },
  {
    id: 104,
    title: "Dracolosse (Dragonite)",
    category: "Figurine",
    price: "24.00€",
    image: "/assets/products/dragonite-bronze.jpg",
    description: "Carte en relief effet métal antique. Le dragon original, majestueux et puissant. Design ABC3D.",
    tags: ["Pokémon", "Dragon", "Gen 1"]
  },
  {
    id: 105,
    title: "Electhor (Zapdos)",
    category: "Decor",
    price: "24.00€",
    image: "/assets/products/zapdos-bronze.jpg",
    description: "L'oiseau de foudre. Cadre relief haute précision, peinture effet bronze. Design ABC3D.",
    tags: ["Pokémon", "Légendaire", "Gen 1"]
  },
  {
    id: 106,
    title: "Groudon - Ruby",
    category: "Decor",
    price: "24.00€",
    image: "/assets/products/groudon-bronze.jpg",
    description: "Le titan de la terre brisant sa cartouche. Texture rocailleuse réaliste. Design ABC3D.",
    tags: ["Pokémon", "Légendaire", "Gen 3"]
  },
  {
    id: 107,
    title: "Léviator (Gyarados)",
    category: "Decor",
    price: "24.00€",
    image: "/assets/products/gyarados-bronze.jpg",
    gallery: ["/assets/products/gyarados-bronze.jpg", "https://picsum.photos/600/600?random=4", "https://picsum.photos/600/600?random=5"],
    description: "La fureur du dragon d'eau sortant de l'écran. Finition dorée impeccable. Design ABC3D.",
    isNew: true,
    tags: ["Pokémon", "Eau", "Shiny"]
  },
  {
    id: 108,
    title: "Papilusion (Butterfree)",
    category: "Figurine",
    price: "24.00€",
    image: "/assets/products/butterfree-bronze.jpg",
    description: "Délicatesse et nostalgie. Carte relief avec patine dorée artisanale. Design ABC3D.",
    tags: ["Pokémon", "Insecte", "Cute"]
  },
  {
    id: 109,
    title: "Excelangue (Lickitung)",
    category: "Figurine",
    price: "24.00€",
    image: "/assets/products/lickitung-bronze.jpg",
    description: "Une touche d'humour en bronze. Finition lisse et détaillée. Design ABC3D.",
    tags: ["Pokémon", "Fun"]
  },
  {
    id: 110,
    title: "Chrysacier (Metapod)",
    category: "Figurine",
    price: "24.00€",
    image: "/assets/products/metapod-bronze.jpg",
    description: "L'armure impénétrable. Carte relief minimaliste et élégante. Design ABC3D.",
    tags: ["Pokémon", "Mème"]
  },
  {
    id: 111,
    title: "Chenipan (Caterpie)",
    category: "Figurine",
    price: "24.00€",
    image: "/assets/products/caterpie-bronze.jpg",
    description: "Le début de l'aventure. Sculpture détaillée sur carte bronze. Design ABC3D.",
    tags: ["Pokémon", "Nature"]
  }
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: "Comment lisser vos impressions PLA ?",
    excerpt: "Le guide ultime pour faire disparaître les stries d'impression sans perdre les détails. Ponçage, enduit et peinture.",
    category: "Tuto",
    image: "https://picsum.photos/600/400?random=20",
    date: "12 Oct 2024",
    readTime: "5 min",
    author: "Manu"
  },
  {
    id: 2,
    title: "L'arrivée des Résines 12K : Révolution ou Marketing ?",
    excerpt: "Nous avons testé les dernières machines du marché. La différence est-elle visible à l'œil nu ? Spoiler : Oui, sur les miniatures.",
    category: "News",
    image: "https://picsum.photos/600/400?random=21",
    date: "05 Oct 2024",
    readTime: "3 min",
    author: "Manu"
  },
  {
    id: 3,
    title: "Promo Flash : -20% sur la gamme Pokémon",
    excerpt: "C'est le moment de compléter votre collection de cartes en relief. Offre valable jusqu'à dimanche minuit.",
    category: "Bon Plan",
    image: "https://picsum.photos/600/400?random=22",
    date: "Aujourd'hui",
    readTime: "1 min",
    author: "Team"
  },
  {
    id: 4,
    title: "Cosplay : Créer une visière transparente",
    excerpt: "Thermoformage vs Moulage résine. Quelle technique choisir pour votre casque de Daft Punk ou de Halo ?",
    category: "Tuto",
    image: "https://picsum.photos/600/400?random=23",
    date: "28 Sept 2024",
    readTime: "8 min",
    author: "Manu"
  }
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 1,
    title: "Diorama Berserk - Eclipse",
    description: "Impression résine 8k grand format. Peinture acrylique et encres pour un rendu sombre et réaliste.",
    image: "https://picsum.photos/600/400?random=10"
  },
  {
    id: 2,
    title: "Casque Iron Man MK85",
    description: "Prop Cosplay échelle 1:1 motorisé. Finition carrosserie automobile rouge candy et or.",
    image: "https://picsum.photos/600/400?random=11"
  },
  {
    id: 3,
    title: "Trophée E-Sport League",
    description: "Design sur mesure pour une compétition locale. PLA Silk Gold et socle marbre.",
    image: "https://picsum.photos/600/400?random=12"
  },
  {
    id: 4,
    title: "Dragon Ancestral",
    description: "Figurine de jeu de rôle peinte à la main. Textures d'écailles et socle enneigé.",
    image: "https://picsum.photos/600/400?random=13"
  }
];

export const REVIEWS = [
  {
    id: 1,
    name: "Thomas D.",
    role: "Cosplayer Confirmé",
    date: "Il y a 2 semaines",
    rating: 5,
    text: "J'ai commandé une armure complète de Mandalorian. Le respect des dimensions est parfait, et le travail de ponçage préliminaire m'a fait gagner un temps fou. Manu est un vrai passionné !",
    item: "Armure Beskar (PLA)"
  },
  {
    id: 2,
    name: "Sarah 'Pixie' L.",
    role: "Collectionneuse",
    date: "Il y a 1 mois",
    rating: 5,
    text: "La figurine de Malenia est juste incroyable. Les détails de la peinture sont fous, surtout sur le casque. Emballage ultra sécurisé, rien n'a bougé pendant le transport.",
    item: "Figurine Elden Ring (Résine)"
  },
  {
    id: 3,
    name: "Guilde du Rolliste 76",
    role: "Association JDR",
    date: "Il y a 3 jours",
    rating: 4,
    text: "Super lot de décors pour nos soirées D&D. Le rapport qualité/prix est top pour de la résine. Un petit délai supplémentaire dû au succès, mais la qualité valait l'attente.",
    item: "Pack Décors Donjon"
  }
];