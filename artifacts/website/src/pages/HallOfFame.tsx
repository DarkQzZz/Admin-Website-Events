import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Trophy, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function HallOfFame() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHoF() {
      try {
        const { data, error } = await supabase
          .from('event_results')
          .select(`
            rank, total_points,
            events (id, title, created_at, banner_url),
            submissions (id, title, image_url),
            profiles (username, avatar_url)
          `)
          .order('events(created_at)', { ascending: false });

        if (data && data.length > 0) {
          // Group by event
          const grouped = data.reduce((acc: any, curr: any) => {
            const eventId = curr.events.id;
            if (!acc[eventId]) {
              acc[eventId] = { event: curr.events, winners: [] };
            }
            acc[eventId].winners.push(curr);
            return acc;
          }, {});
          
          setEvents(Object.values(grouped));
        } else {
          // Mock data
          setEvents([
            {
              event: { title: "Neon Renaissance", created_at: new Date().toISOString(), banner_url: "/attached_assets/generated_images/artwork_4.jpg" },
              winners: [
                { rank: 1, total_points: 156, submissions: { id: 2, title: "Neon Geometry", image_url: "/attached_assets/generated_images/artwork_2.jpg" }, profiles: { username: "CyberBrush" } },
                { rank: 2, total_points: 132, submissions: { id: 4, title: "Vaporwave Gallery", image_url: "/attached_assets/generated_images/artwork_4.jpg" }, profiles: { username: "RetroGaze" } },
                { rank: 3, total_points: 98, submissions: { id: 1, title: "Ethereal Dreams", image_url: "/attached_assets/generated_images/artwork_1.jpg" }, profiles: { username: "ArtisanNeo" } }
              ]
            },
            {
              event: { title: "Organic Abstraction", created_at: new Date(Date.now() - 30*24*60*60*1000).toISOString(), banner_url: "/attached_assets/generated_images/artwork_5.jpg" },
              winners: [
                { rank: 1, total_points: 210, submissions: { id: 5, title: "Pastel Explosion", image_url: "/attached_assets/generated_images/artwork_5.jpg" }, profiles: { username: "ChromaFlow" } },
                { rank: 2, total_points: 185, submissions: { id: 3, title: "Glass Botanica", image_url: "/attached_assets/generated_images/artwork_3.jpg" }, profiles: { username: "Lumiere" } },
                { rank: 3, total_points: 140, submissions: { id: 6, title: "Floating Islands", image_url: "/attached_assets/generated_images/artwork_6.jpg" }, profiles: { username: "SkyPainter" } }
              ]
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHoF();
  }, []);

  if (loading) {
    return <div className="min-h-screen pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#FF4FA3] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAFAFA] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FFE8F3]/50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DDF2FF]/50 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 text-gradient">Hall of Fame</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Celebrating the visionaries who defined our past events. The highest honored artworks in Artopia history.</p>
        </div>

        <div className="space-y-24">
          {events.map((eventData, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#FF4FA3] to-[#74C8FF] hidden md:block" />
                <h2 className="text-3xl font-serif font-bold text-gray-900">{eventData.event.title}</h2>
                <div className="flex items-center text-sm font-medium text-gray-500 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(eventData.event.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Reorder to show 2nd, 1st, 3rd visually for a podium feel on desktop */}
                {[
                  eventData.winners.find((w:any) => w.rank === 2),
                  eventData.winners.find((w:any) => w.rank === 1),
                  eventData.winners.find((w:any) => w.rank === 3)
                ].filter(Boolean).map((winner: any, i) => (
                  <Link 
                    key={winner.rank} 
                    href={`/artwork/${winner.submissions.id}`}
                    className={`block group relative rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 ${
                      winner.rank === 1 ? "md:-translate-y-8 md:shadow-lg z-10 border-[#FF4FA3]/30 ring-4 ring-[#FF4FA3]/5" : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    <div className="aspect-[4/5] relative">
                      <img src={winner.submissions.image_url} alt={winner.submissions.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      
                      {/* Medal Badge */}
                      <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg backdrop-blur-md ${
                        winner.rank === 1 ? "bg-yellow-400/90 text-white" :
                        winner.rank === 2 ? "bg-gray-300/90 text-white" :
                        "bg-orange-400/90 text-white"
                      }`}>
                        {winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉"}
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white text-xl font-serif font-bold mb-1 truncate">{winner.submissions.title}</h3>
                        <p className="text-white/80 font-medium text-sm flex justify-between items-center">
                          <span>by {winner.profiles.username}</span>
                          <span className="text-[#FF4FA3] font-bold">{winner.total_points} pts</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
