"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'What We Offer', path: '/what-we-offer' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Our Team', path: '/our-team' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 flex justify-center ${scrolled ? 'pt-6' : 'pt-[40px]'}`}>
      <div className={`flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-[#270d3c]/80 backdrop-blur-md shadow-lg rounded-full py-3 px-8 border border-white/10 w-[95%] md:w-[85%] max-w-6xl' : 'bg-transparent py-2 px-6 w-full max-w-7xl border border-transparent rounded-none'}`}>
        <Link href="/">
          <div className="font-display font-bold text-2xl text-white cursor-pointer">
            Net<span className="text-buttons">Start</span>
          </div>
        </Link>
        <nav className="hidden md:flex gap-6 font-sans font-medium text-[1.1rem]">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              href={link.path} 
              className={`text-white transition-colors rounded-[50px] px-6 py-2 border-[1.5px] ${pathname === link.path ? 'border-[#ffb703] text-[#ffb703]' : 'border-transparent hover:text-[#ffb703] hover:border-transparent'}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <Link href="/login">
          <button className="bg-buttons text-white font-sans font-bold py-2 px-6 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer">
            Login
          </button>
        </Link>
      </div>
    </header>
  );
}
