import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#270d3c] shadow-[0_-4px_20px_rgba(255,193,7,0.1)] relative z-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 w-full">

          {/* Column 1: Project Identity & Institution */}
          <div className="flex flex-col">
            <h3 className="font-display font-bold text-white text-2xl mb-4">About the Project</h3>
            <p className="font-sans text-white/80 text-sm leading-relaxed mb-6">
              An AI-Enhanced IT Career Orientation and Adaptive Practical Laboratory System.
            </p>
            <span className="font-sans text-[#ff912d] text-xs font-bold uppercase tracking-widest leading-loose">
              placeholder ewannn hahahaha
            </span>
          </div>

          {/* Column 2: Quick Navigation Hub */}
          <div className="flex flex-col md:mx-auto">
            <h3 className="font-sans font-semibold text-white text-lg mb-6">System Navigation</h3>
            <nav className="flex flex-col gap-4">
              <Link href="/" className="font-sans text-white/80 text-sm w-max transition-all duration-200 ease-in-out hover:text-[#ffc107] hover:translate-x-1">Home</Link>
              <Link href="/what-we-offer" className="font-sans text-white/80 text-sm w-max transition-all duration-200 ease-in-out hover:text-[#ffc107] hover:translate-x-1">Features</Link>
              <Link href="/about-us" className="font-sans text-white/80 text-sm w-max transition-all duration-200 ease-in-out hover:text-[#ffc107] hover:translate-x-1">About Us</Link>
              <Link href="/our-team" className="font-sans text-white/80 text-sm w-max transition-all duration-200 ease-in-out hover:text-[#ffc107] hover:translate-x-1">Our Team</Link>
            </nav>
          </div>

          {/* Column 3: Ground Control Contact */}
          <div className="flex flex-col md:ml-auto">
            <h3 className="font-sans font-semibold text-white text-lg mb-6">Contact Us!</h3>
            <ul className="flex flex-col gap-4">
              <li className="font-sans text-white/80 text-sm">Email: ccs.support@gnc.edu.ph</li>
              <li className="font-sans text-white/80 text-sm">Hotline: +63 (45) 912 3456</li>
              <li className="font-sans text-white/80 text-sm">Location: TIP Manila</li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="w-full mt-10 pt-6 border-t border-white/10 flex justify-center">
          <p className="font-sans text-white/50 text-sm text-center">
            © 2026 NetStart. All Rights Reserved. Developed as a Capstone 2 requirement.
          </p>
        </div>
      </div>
    </footer>
  );
}
