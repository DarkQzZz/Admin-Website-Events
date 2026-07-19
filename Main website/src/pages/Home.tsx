import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Palette, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [stats, setStats] = useState({ members: 0, submissions: 0, events: 0, votes: 0 });
  const [featuredArt, setFeaturedArt] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  
  useEffect(() => {
    async function fetchData() {
      // Fetch mock data if DB is empty or fails
      try {
        const { data: eventData } = await supabase.from('events').select('*').neq('status', 'archived').order('created_at', { ascending: false }).limit(1);
        if (eventData && eventData.length > 0) setCurrentEvent(eventData[0]);
        
        const { data: artData } = await supabase.from('submissions').select('*, profiles(username, avatar_url)').eq('status', 'approved').order('created_at', { ascending: false }).limit(6);
        if (artData && artData.length > 0) setFeaturedArt(artData);
        
        // Mock stats since counts can be tricky without proper schema
        setStats({
          members: 1248,
          submissions: 4209,
          events: 12,
          votes: 18492
        });
      } catch (err) {
        console.error("Error fetching data", err);
      }
    }
    fetchData();
  }, []);

  const mockFeaturedArt = featuredArt.length > 0 ? featuredArt : [
    { id: 1, title: 'Ethereal Dreams', image_url: '/attached_assets/generated_images/artwork_1.jpg', profiles: { username: 'ArtisanNeo' } },
    { id: 2, title: 'Neon Geometry', image_url: '/attached_assets/generated_images/artwork_2.jpg', profiles: { username: 'CyberBrush' } },
    { id: 3, title: 'Glass Botanica', image_url: '/attached_assets/generated_images/artwork_3.jpg', profiles: { username: 'Lumiere' } },
    { id: 4, title: 'Vaporwave Gallery', image_url: '/attached_assets/generated_images/artwork_4.jpg', profiles: { username: 'RetroGaze' } },
    { id: 5, title: 'Pastel Explosion', image_url: '/attached_assets/generated_images/artwork_5.jpg', profiles: { username: 'ChromaFlow' } },
    { id: 6, title: 'Floating Islands', image_url: '/attached_assets/generated_images/artwork_6.jpg', profiles: { username: 'SkyPainter' } }
  ];

  return (
    <div className="w-full flex flex-col min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden flex items-center justify-center min-h-[80vh]">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FF4FA3]/20 rounded-full blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#74C8FF]/30 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFE8F3]/50 rounded-full blur-[120px] -z-10" />

        <div className="container px-6 mx-auto text-center z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-pink-100 shadow-sm text-sm font-medium text-[#FF4FA3] mb-8"
          >
            <Star className="w-4 h-4 fill-current" />
            Welcome to the ultimate creative arena
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-900 tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto"
          >
            Where Digital Art <br />
            <span className="text-gradient">Becomes Legendary.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Compete in live creative events, discover breathtaking artwork, and celebrate the world's most innovative digital artists.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/events/current" className="h-14 px-8 rounded-full bg-primary text-white text-lg font-medium inline-flex items-center justify-center hover:bg-primary/90 transition-all shadow-[0_8px_30px_rgb(255,79,163,0.3)] hover:shadow-[0_8px_40px_rgb(255,79,163,0.4)] hover:-translate-y-1">
              Join Current Event <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/gallery" className="h-14 px-8 rounded-full bg-white text-gray-900 text-lg font-medium inline-flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
              Explore Gallery
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Artwork Grid */}
      <section className="py-24 bg-white/50 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Curated Masterpieces</h2>
              <p className="text-gray-500 text-lg max-w-xl">Discover the most breathtaking submissions from our community of world-class digital artists.</p>
            </div>
            <Link href="/gallery" className="group flex items-center text-primary font-medium hover:text-primary/80 transition-colors">
              View all artwork <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockFeaturedArt.map((art, i) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img src={art.image_url} alt={art.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white text-2xl font-serif font-bold mb-1">{art.title}</h3>
                  <p className="text-white/80 font-medium">by {art.profiles?.username}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Event Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A] -z-20" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FF4FA3]/20 to-transparent -z-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#74C8FF]/20 to-transparent -z-10 blur-3xl" />
        
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="glass-card bg-white/5 border-white/10 p-1 md:p-12 text-center md:text-left shadow-2xl rounded-[3rem] relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center p-8 md:p-0">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" /> Live Event
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                  {currentEvent ? currentEvent.title : "Neon Renaissance"}
                </h2>
                <p className="text-lg text-white/70 max-w-xl">
                  {currentEvent ? currentEvent.description : "Merge classic art paradigms with cyberpunk aesthetics. Show us the future of classical mastery."}
                </p>
                <div className="pt-6">
                  <Link href="/events/current" className="h-12 px-8 rounded-full bg-white text-black font-medium inline-flex items-center justify-center hover:bg-gray-100 transition-colors">
                    Participate Now
                  </Link>
                </div>
              </div>
              <div className="flex-1 w-full aspect-square md:aspect-auto md:h-96 rounded-2xl overflow-hidden border border-white/10 relative">
                <img src={currentEvent?.banner_url || "/attached_assets/generated_images/artwork_2.jpg"} alt="Event Banner" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Community Members", value: stats.members.toLocaleString(), icon: Users, color: "text-[#FF4FA3]" },
              { label: "Total Artworks", value: stats.submissions.toLocaleString(), icon: Palette, color: "text-[#74C8FF]" },
              { label: "Events Hosted", value: stats.events.toLocaleString(), icon: Trophy, color: "text-[#A8F0C6]" },
              { label: "Votes Cast", value: stats.votes.toLocaleString(), icon: Star, color: "text-[#FF87C5]" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className={`w-12 h-12 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-4xl font-serif font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
