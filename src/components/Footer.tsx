export default function Footer() {
  return (
    <footer className="px-6 py-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
        <span>© {new Date().getFullYear()} MINDMUSH</span>
        <div className="flex items-center gap-6">
          <a href="/privacy.html" className="hover:text-white transition-colors">Privacy</a>
          <a href="/terms.html" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
