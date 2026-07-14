"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const PATH_TO_INDEX: Record<string, number> = {
  '/': 0,
  '/what-we-offer': 1,
  '/about-us': 2,
  '/our-team': 3,
};

const planets = [
  // Slide 1 (Home)
  { src: '/Spaceship.svg', left: '2%', top: '25%', width: '150px' },
  { src: '/Planet 8.svg', left: '17%', top: '6%', width: '220px' },
  
  // Slide 2 (Features)
  { src: '/Debris.svg', left: '26%', top: '35%', width: '40px' },
  { src: '/UFO.svg', left: '25%', top: '41%', width: '90px' },
  { src: '/Planet 3.svg', left: '33%', top: '-5%', width: '600px' },
  { src: '/Meteor.svg', left: '47%', top: '42%', width: '120px' },
  
  // Slide 3 (About Us)
  { src: '/Planet 4.svg', left: '55%', top: '30%', width: '180px' }, 
  { src: '/Planet 6.svg', left: '70%', top: '-2%', width: '450px' },
  { src: '/Debris.svg', left: '63%', top: '18%', width: '30px' },
  
  // Slide 4 (Our Team)
  { src: '/Planet 7.svg', left: '92%', top: '25%', width: '250px' },
  { src: '/Planet 1.svg', left: '98%', top: '10%', width: '90px' },
  { src: '/Debris.svg', left: '82%', top: '45%', width: '50px' },
];

export default function SpaceBackground() {
  const pathname = usePathname();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (pathname && PATH_TO_INDEX[pathname] !== undefined) {
      setCurrentSlide(PATH_TO_INDEX[pathname]);
    }
  }, [pathname]);

  const bgPosition = `${(currentSlide / 3) * 100}%`;
  const startingAngle = 45; 
  const moonRotation = `rotate(${startingAngle + (currentSlide * 90)}deg)`;

  return (
    <div className="fixed inset-0 w-[100vw] h-[100vh] -z-50 pointer-events-none overflow-hidden animate-fade-in">
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.645,0.045,0.355,1)]"
        style={{ 
          backgroundImage: "url('/Landing Page BG.png')",
          backgroundPositionX: bgPosition,
          backgroundSize: 'auto 100%'
        }}
      ></div>
      
      {/* Black Transparent Overlay */}
      <div className="absolute inset-0 bg-black/60 z-[2]" />

      {/* Scattered Planets Layer */}
      <div 
        className="absolute top-0 left-0 h-full z-[1] transition-transform duration-1000 ease-[cubic-bezier(0.645,0.045,0.355,1)] animate-fade-in-more-delayed"
        style={{ 
          width: '400vw',
          transform: `translateX(-${currentSlide * 100}vw)` 
        }}
      >
        {planets.map((planet, index) => (
          <img
            key={index}
            src={planet.src}
            className="absolute animate-float-planet max-w-none"
            style={{
              left: planet.left,
              top: planet.top,
              width: planet.width
            }}
            alt={`Planet ${index + 1}`}
          />
        ))}
      </div>

      {/* Rotating Moon */}
      <div className="absolute bottom-[-1500px] left-1/2 -translate-x-1/2 z-[1] pointer-events-none animate-fade-in-delayed">
        <img 
          src="/cc.svg" 
          alt="Moon" 
          className="w-[1700px] h-[1700px] max-w-none transition-transform duration-1000 ease-[cubic-bezier(0.645,0.045,0.355,1)]"
          style={{ transform: moonRotation }}
        />
      </div>
    </div>
  );
}
