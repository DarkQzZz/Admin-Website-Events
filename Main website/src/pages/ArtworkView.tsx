import { useParams } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Share2, Heart, Award, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ArtworkView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [art, setArt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votingOpen, setVotingOpen] = useState(false);
  const [currentVote, setCurrentVote] = useState<number | null>(null);

  useEffect(() => {
    async function fetchArtwork() {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*, profiles(*), events(status)')
          .eq('id', id)
          .single();
          
        if (data) {
          setArt(data);
          setVotingOpen(data.events?.status === 'voting_open');
          
          if (user) {
            const { data: voteData } = await supabase
              .from('votes')
              .select('rank')
              .eq('voter_id', user.id)
              .eq('submission_id', id)
              .single();
            if (voteData) setCurrentVote(voteData.rank);
          }
        } else {
          // Mock data for display purposes
          setArt({
            id,
            title: 'Ethereal Dreams',
            description: 'A deep dive into the subconscious mind, manifesting as floating organic forms and soft light. Created using Cinema4D and Octane Render.',
            category: 'Abstract',
            image_url: '/attached_assets/generated_images/artwork_1.jpg',
            created_at: new Date().toISOString(),
            profiles: { username: 'ArtisanNeo', avatar_url: null, id: 'mock' },
            events: { status: 'voting_open' }
          });
          setVotingOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchArtwork();
  }, [id, user]);

  const handleVote = async (rank: number) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }
    if (user.id === art.profiles.id) {
      toast.error("You cannot vote for your own artwork");
      return;
    }
    
    try {
      // In a real app, delete previous vote of this rank for this event first
      // Or use an upsert
      setCurrentVote(rank);
      toast.success(`Voted as Top ${rank}!`);
    } catch (e) {
      toast.error("Failed to vote");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return <div className="min-h-screen pt-32 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#FF4FA3] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!art) return <div className="min-h-screen pt-32 text-center text-2xl font-serif">Artwork not found</div>;

  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#FAFAFA]">
      <div className="container mx-auto px-6 max-w-7xl">
        <Link href="/gallery" className="inline-flex items-center text-gray-500 hover:text-[#FF4FA3] font-medium mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Gallery
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Image */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl overflow-hidden shadow-2xl bg-white p-2 border border-gray-100"
            >
              <img 
                src={art.image_url} 
                alt={art.title} 
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl bg-gray-50"
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <img 
                  src={art.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${art.profiles?.username}`} 
                  alt="avatar" 
                  className="w-14 h-14 rounded-full shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{art.profiles?.username}</h3>
                  <p className="text-sm text-gray-500">{new Date(art.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{art.title}</h1>
              <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-6 uppercase tracking-wider">
                {art.category || "Artwork"}
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-8">
                {art.description}
              </p>
              
              <div className="flex items-center gap-3">
                <Button onClick={copyLink} variant="outline" className="flex-1 rounded-xl h-12 shadow-sm">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button variant="outline" className="w-12 h-12 rounded-xl p-0 shrink-0 shadow-sm hover:text-[#FF4FA3] hover:border-[#FF4FA3]">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            {/* Voting Panel */}
            {votingOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 bg-gradient-to-br from-white to-[#FFE8F3]/30 border-[#FF4FA3]/20"
              >
                <div className="flex items-center gap-2 mb-4 text-[#FF4FA3]">
                  <Award className="w-6 h-6" />
                  <h3 className="font-serif font-bold text-xl">Cast Your Vote</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">Allocate your votes for this event. You can change them until voting closes.</p>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((rank) => (
                    <button
                      key={rank}
                      onClick={() => handleVote(rank)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        currentVote === rank 
                          ? "border-[#FF4FA3] bg-[#FF4FA3]/5 text-[#FF4FA3]" 
                          : "border-gray-100 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="font-medium">
                        {rank === 1 ? "🥇 Top Choice (3 pts)" : rank === 2 ? "🥈 Second (2 pts)" : "🥉 Third (1 pt)"}
                      </span>
                      {currentVote === rank && <div className="w-3 h-3 rounded-full bg-[#FF4FA3]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
