import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Filter, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function Gallery() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "3D", "Illustration", "Abstract", "Character Design", "Environment"];

  useEffect(() => {
    async function fetchGallery() {
      try {
        const { data } = await supabase
          .from('submissions')
          .select('*, profiles(username, avatar_url)')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          setArtworks(data);
        } else {
          // Mock data if db is empty
          setArtworks([
            { id: 1, title: 'Ethereal Dreams', category: 'Abstract', image_url: '/attached_assets/generated_images/artwork_1.jpg', profiles: { username: 'ArtisanNeo', avatar_url: '' } },
            { id: 2, title: 'Neon Geometry', category: '3D', image_url: '/attached_assets/generated_images/artwork_2.jpg', profiles: { username: 'CyberBrush', avatar_url: '' } },
            { id: 3, title: 'Glass Botanica', category: '3D', image_url: '/attached_assets/generated_images/artwork_3.jpg', profiles: { username: 'Lumiere', avatar_url: '' } },
            { id: 4, title: 'Vaporwave Gallery', category: 'Environment', image_url: '/attached_assets/generated_images/artwork_4.jpg', profiles: { username: 'RetroGaze', avatar_url: '' } },
            { id: 5, title: 'Pastel Explosion', category: 'Abstract', image_url: '/attached_assets/generated_images/artwork_5.jpg', profiles: { username: 'ChromaFlow', avatar_url: '' } },
            { id: 6, title: 'Floating Islands', category: 'Environment', image_url: '/attached_assets/generated_images/artwork_6.jpg', profiles: { username: 'SkyPainter', avatar_url: '' } }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const filteredArtworks = artworks.filter(art => 
    (activeCategory === "All" || art.category === activeCategory) &&
    art.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAFAFA]">
      <div className="container mx-auto px-6 max-w-[1400px]">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">The Gallery</h1>
          
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search masterpieces..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-gray-50 border-none rounded-xl text-base focus-visible:ring-1 focus-visible:ring-[#FF4FA3]"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat 
                      ? "bg-gray-900 text-white shadow-md" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Masonry Grid Simulation */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="rounded-2xl bg-gray-200 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredArtworks.map((art, i) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-gray-100"
              >
                <img 
                  src={art.image_url} 
                  alt={art.title} 
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white text-xl font-serif font-bold leading-tight">{art.title}</h3>
                      <button className="text-white/50 hover:text-[#FF4FA3] transition-colors bg-white/10 backdrop-blur-md p-2 rounded-full">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <img 
                        src={art.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${art.profiles?.username}`} 
                        alt="avatar" 
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-white/80 text-sm font-medium">{art.profiles?.username}</span>
                    </div>
                    <Link href={`/artwork/${art.id}`} className="block w-full text-center py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl font-medium transition-colors text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && filteredArtworks.length === 0 && (
          <div className="text-center py-32">
            <h3 className="text-2xl font-serif text-gray-900 mb-2">No artwork found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
