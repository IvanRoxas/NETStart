import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center relative overflow-hidden px-6 pt-12 md:pt-16 pb-8">
        <div className="z-10 max-w-3xl">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-5 md:mb-6 drop-shadow-lg">
            Discover Your Tech <span className="text-borders">Potential</span> Without the Stress
          </h1>
          
          <p className="font-sans text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto drop-shadow-md">
            An AI-enhanced programming sandbox and adaptive virtual laboratory designed specifically for undecided Senior High School students at Guagua National Colleges. Assess your logical aptitude and explore coding fundamentals in a risk-free, gamified environment where mistakes never impact your academic grades.
          </p>
          
          <Link href="/login">
            <button className="bg-buttons text-white font-sans font-bold text-base sm:text-lg py-3.5 sm:py-4 px-8 sm:px-10 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
