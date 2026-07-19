import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Clock, Info, Trophy, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";

export default function CurrentEvent() {
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data } = await supabase
          .from('events')
          .select('*')
          .neq('status', 'archived')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (data) {
          setEvent(data);
          if (data.status === 'results_published') {
            fireConfetti();
          }
        } else {
          setEvent({
            id: 1,
            title: "Digital Genesis: The Awakening",
            description: "Explore the intersection of biological forms and digital structures. We're looking for artwork that blurs the line between the organic and the synthetic.",
            status: "submission_open",
            rules: ["Must be original work", "AI generated base allowed if heavily modified", "Maximum 5MB upload"],
            prizes: ["1st: Featured on homepage for 1 month + Discord Role", "2nd: Discord Role", "3rd: Discord Role"],
            categories: ["3D", "Illustration", "Abstract"],
            end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            banner_url: "/attached_assets/generated_images/artwork_6.jpg"
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, []);

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF4FA3', '#74C8FF', '#A8F0C6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF4FA3', '#74C8FF', '#A8F0C6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  if (loading) {
    return <div className="min-h-screen pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#FF4FA3] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!event) return <div className="min-h-screen pt-32 text-center">No active events found.</div>;

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#FAFAFA]">
      {/* Event Banner */}
      <div className="w-full h-[40vh] md:h-[50vh] relative">
        <img src={event.banner_url} alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-black/40 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold tracking-wider uppercase mb-4 shadow-lg">
              {event.status.replace('_', ' ')}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-md">
              {event.title}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 md:p-10">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="text-[#FF4FA3]" /> About the Event
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {event.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.categories?.map((c: string) => (
                      <span key={c} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" /> Prizes
                  </h3>
                  <ul className="space-y-2">
                    {event.prizes?.map((p: string, i: number) => (
                      <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8">
               <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Rules & Guidelines</h2>
               <ul className="space-y-3">
                 {event.rules?.map((r: string, i: number) => (
                   <li key={i} className="flex gap-3 text-gray-600">
                     <span className="font-bold text-[#FF4FA3]">{i + 1}.</span>
                     {r}
                   </li>
                 ))}
               </ul>
            </motion.div>
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-8 bg-gradient-to-b from-white to-[#FFE8F3]/20 border-[#FF4FA3]/20 text-center">
              <Clock className="w-10 h-10 text-[#FF4FA3] mx-auto mb-4" />
              <h3 className="text-gray-500 font-medium mb-1">Time Remaining</h3>
              <div className="text-3xl font-serif font-bold text-gray-900 mb-6">
                5d 12h 45m
              </div>

              {event.status === 'submission_open' && (
                user ? (
                  <Link href="/submit" className="w-full flex h-14 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-[0_4px_14px_0_rgba(255,79,163,0.39)] hover:shadow-[0_6px_20px_rgba(255,79,163,0.23)] hover:-translate-y-1">
                    <Plus className="w-5 h-5 mr-2" /> Submit Your Art
                  </Link>
                ) : (
                  <Link href="/login" className="w-full flex h-14 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition-all">
                    Log in to Submit
                  </Link>
                )
              )}

              {event.status === 'submission_closed' && (
                <div className="w-full py-4 rounded-xl bg-gray-100 text-gray-500 font-bold border border-gray-200">
                  Submissions Closed
                </div>
              )}

              {event.status === 'voting_open' && (
                user ? (
                  <Link href="/gallery" className="w-full flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#74C8FF] text-white font-bold text-lg hover:opacity-90 transition-all shadow-md hover:-translate-y-1">
                    Vote Now in Gallery
                  </Link>
                ) : (
                  <Link href="/login" className="w-full flex h-14 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-lg hover:bg-gray-800 transition-all">
                    Log in to Vote
                  </Link>
                )
              )}

              {event.status === 'results_published' && (
                <Link href="/hall-of-fame" className="w-full flex h-14 items-center justify-center rounded-xl bg-yellow-400 text-black font-bold text-lg hover:bg-yellow-300 transition-all shadow-md">
                  <Trophy className="w-5 h-5 mr-2" /> View Winners
                </Link>
              )}
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
