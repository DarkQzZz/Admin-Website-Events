import { Link } from "wouter";
import { motion } from "framer-motion";
import { Palette, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#FFE8F3] to-[#DDF2FF] rounded-full blur-[100px] -z-10 opacity-70" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 px-6"
      >
        <div className="text-[150px] font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] to-[#74C8FF] leading-none mb-4 drop-shadow-sm select-none">
          404
        </div>
        <div className="w-20 h-20 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center mb-8 border border-gray-100">
          <Palette className="w-10 h-10 text-[#FF4FA3]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Blank Canvas</h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto mb-10">
          The artwork you're looking for has either been moved or doesn't exist. Let's get you back to the gallery.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex h-14 items-center justify-center rounded-full bg-gray-900 px-8 text-lg font-medium text-white shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Go Back Home
        </Link>
      </motion.div>
    </div>
  );
}
