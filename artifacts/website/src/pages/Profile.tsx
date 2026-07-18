import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Link } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Settings, Image as ImageIcon, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      async function fetchSubmissions() {
        try {
          const { data } = await supabase
            .from('submissions')
            .select('*, events(title, status)')
            .eq('user_id', user!.id)
            .order('created_at', { ascending: false });
          if (data) setSubmissions(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      fetchSubmissions();
    }
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Redirect to="/login" />;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAFAFA]">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Profile Header */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 mb-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-[#FF4FA3]/20 to-transparent blur-3xl -z-10" />
          
          <img 
            src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{user.user_metadata?.full_name || 'Artist'}</h1>
            <p className="text-gray-500 font-medium mb-4">{user.email}</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-xl text-center">
                <div className="text-xl font-bold text-gray-900">{submissions.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Submissions</div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="rounded-full shadow-sm">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="text-[#FF4FA3]" /> Your Artworks
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-2 border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No artworks yet</h3>
              <p className="text-gray-500 mb-6">Submit your first masterpiece to the current event.</p>
              <Link href="/submit" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-md">
                Submit Artwork
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((sub, i) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row group"
                >
                  <div className="w-full sm:w-48 aspect-square relative overflow-hidden bg-gray-50">
                    <img src={sub.image_url} alt={sub.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-bold text-lg text-gray-900 line-clamp-1">{sub.title}</h3>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                          sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{sub.events?.title || 'Unknown Event'}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                        <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
