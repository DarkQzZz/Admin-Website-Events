import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Upload, X, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function Submit() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (authLoading) return null;
  if (!user) return <Redirect to="/login" />;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 5 * 1024 * 1024) {
        toast.error("File must be less than 5MB");
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description || !category) {
      toast.error("Please fill all required fields and upload an image");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app with proper schema:
      // 1. Fetch current active event
      // 2. Upload to storage
      // const fileExt = file.name.split('.').pop();
      // const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      // await supabase.storage.from('artwork-images').upload(filePath, file);
      // const publicUrl = supabase.storage.from('artwork-images').getPublicUrl(filePath).data.publicUrl;
      // 3. Insert to submissions table

      // Simulate network request
      await new Promise(r => setTimeout(r, 1500));
      
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF4FA3', '#74C8FF']
      });
      
      setTimeout(() => {
        setLocation('/profile');
      }, 3000);

    } catch (err) {
      toast.error("Failed to submit artwork");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Masterpiece Submitted!</h1>
          <p className="text-gray-500 text-lg">Your artwork has been submitted for the current event.<br/>Redirecting to your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAFAFA]">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Submit Your Masterpiece</h1>
          <p className="text-gray-500">Enter your artwork into the current active event.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Image Upload */}
            <div className="space-y-4">
              <Label className="text-base font-bold text-gray-900">Artwork Image</Label>
              <div className="relative aspect-square w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden flex flex-col items-center justify-center group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFile}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <p className="text-white font-medium flex items-center"><Upload className="w-4 h-4 mr-2" /> Change Image</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 group-hover:text-[#FF4FA3] transition-colors" />
                    <p className="font-medium text-gray-600 mb-1">Click to upload or drag & drop</p>
                    <p className="text-xs">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 flex flex-col justify-center">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-bold text-gray-900">Title</Label>
                <Input 
                  id="title"
                  placeholder="e.g. Neon Dreams" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="h-12 bg-white rounded-xl focus-visible:ring-[#FF4FA3]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-bold text-gray-900">Category</Label>
                <select 
                  id="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="3D">3D Art</option>
                  <option value="Illustration">Illustration</option>
                  <option value="Abstract">Abstract</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="text-base font-bold text-gray-900">Description</Label>
                <textarea 
                  id="desc"
                  placeholder="Tell the story behind your creation..."
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#74C8FF] hover:opacity-90 text-white font-bold text-lg shadow-md hover:-translate-y-0.5 transition-all mt-4"
              >
                {isSubmitting ? "Submitting..." : "Submit to Event"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
