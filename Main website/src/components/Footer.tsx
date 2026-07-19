export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-border py-12 mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#FFE8F3] rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#DDF2FF] rounded-full blur-3xl opacity-50 -z-10" />
      
      <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 mb-6 rounded-2xl bg-gradient-to-br from-[#FF4FA3] to-[#74C8FF] flex items-center justify-center text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
        </div>
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">Artopia</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The intersection of a gallery opening night and a competitive art tournament. Where digital artists gather to celebrate and be celebrated.
        </p>
        
        <div className="flex gap-6 mb-8">
          <a href="#" className="text-gray-400 hover:text-[#FF4FA3] transition-colors">
             Twitter
          </a>
          <a href="#" className="text-gray-400 hover:text-[#FF4FA3] transition-colors">
            Discord
          </a>
          <a href="#" className="text-gray-400 hover:text-[#FF4FA3] transition-colors">
            Instagram
          </a>
        </div>
        
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Artopia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
