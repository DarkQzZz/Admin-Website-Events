import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Image as ImageIcon, Trophy, User, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-border shadow-sm py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4FA3] to-[#74C8FF] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-serif text-2xl font-bold text-gray-900 tracking-tight">Artopia</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/events/current" className="text-gray-600 hover:text-[#FF4FA3] font-medium transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Current Event
          </Link>
          <Link href="/gallery" className="text-gray-600 hover:text-[#FF4FA3] font-medium transition-colors flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> Gallery
          </Link>
          <Link href="/hall-of-fame" className="text-gray-600 hover:text-[#FF4FA3] font-medium transition-colors flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Hall of Fame
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/submit" className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 hover:shadow-[0_4px_14px_0_rgba(255,79,163,0.39)]">
                Submit Art
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:border-[#FF4FA3] transition-colors">
                  <img src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.id} alt="Avatar" className="w-full h-full object-cover" />
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-500 rounded-full">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 h-10 px-6 py-2 shadow-sm">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
