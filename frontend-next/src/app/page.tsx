import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center relative overflow-hidden px-6">
        

        
        <div className="z-10 max-w-3xl">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            Lorem ipsum dolor sit <span className="text-borders">amet</span> consectetur
          </h1>
          
          <p className="font-sans text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          <Link href="/login">
            <button className="bg-buttons text-white font-sans font-bold text-lg py-4 px-10 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>
      </section>




    </>
  );
}
