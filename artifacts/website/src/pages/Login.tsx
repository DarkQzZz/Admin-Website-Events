import { Link } from "wouter";
import { signInWithDiscord } from "@/lib/auth";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      {/* Background artwork */}
      <div className="absolute inset-0 z-0">
        <img src="/attached_assets/generated_images/artwork_1.jpg" alt="Background" className="w-full h-full object-cover opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-10 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FF4FA3] to-[#74C8FF] flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome to Artopia</h1>
          <p className="text-gray-500">Sign in to submit artwork, cast votes, and join the creative arena.</p>
        </div>

        <Button 
          onClick={signInWithDiscord}
          className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-lg font-medium shadow-[0_4px_14px_0_rgba(88,101,242,0.39)] hover:shadow-[0_6px_20px_rgba(88,101,242,0.23)] transition-all hover:-translate-y-0.5"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
          </svg>
          Sign in with Discord
        </Button>

        <p className="text-center text-sm text-gray-400 mt-8">
          By signing in, you agree to our <a href="#" className="underline hover:text-gray-600">Terms of Service</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
