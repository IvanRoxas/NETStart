import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const firstName = session.user?.name?.split(" ")[0] || "User";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#1e0a2d] relative overflow-hidden flex flex-col pt-12 pb-12 px-6 lg:px-12">
      {/* Background Ambience */}
      <div className="absolute top-[-200px] right-[-100px] w-96 h-96 bg-[#ff912d] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-200px] w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-[40%] left-[50%] w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#361d57] rounded-full blur-[200px] opacity-20 pointer-events-none"></div>

      {/* Main Dashboard Container */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-subs/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-md shadow-2xl">
          <div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">
              Welcome back, <span className="text-[#ff912d]">{firstName}</span>!
            </h1>
            <p className="font-sans text-white/70 text-lg">
              Ready to conquer some code today? Let's pick up where you left off.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Link 
              href="/modules" 
              className="px-6 py-3 bg-[#ff912d] hover:bg-[#ff912d]/90 text-[#1e0a2d] font-bold rounded-full transition-all shadow-[4px_4px_0_#ffc107] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
            >
              Start Coding
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Current Streak', 
                  value: '3 Days', 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
                  color: 'text-orange-400' 
                },
                { 
                  label: 'XP Earned', 
                  value: '2,450', 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                  color: 'text-yellow-400' 
                },
                { 
                  label: 'Modules', 
                  value: '5/12', 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.254 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
                  color: 'text-blue-400' 
                },
                { 
                  label: 'Global Rank', 
                  value: '#432', 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
                  color: 'text-green-400' 
                },
              ].map((stat, i) => (
                <div key={i} className="bg-subs/30 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:bg-subs/50 transition-colors cursor-default shadow-lg">
                  <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                  <h3 className="font-display font-bold text-2xl text-white">{stat.value}</h3>
                  <p className="font-sans text-white/50 text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Continue Learning Card */}
            <div className="bg-gradient-to-br from-[#361d57]/80 to-[#270d3c]/80 border border-[#ffc107]/30 rounded-[32px] p-8 relative overflow-hidden group shadow-xl">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22h20L12 2zm0 3.83L17.17 19H6.83L12 5.83z" fill="#ffc107"/></svg>
              </div>
              <span className="bg-[#ff912d]/20 text-[#ffc107] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#ff912d]/30 mb-4 inline-block">
                In Progress
              </span>
              <h2 className="font-display text-3xl font-bold text-white mb-2">Introduction to Python</h2>
              <p className="font-sans text-white/70 mb-8 max-w-md">
                You're halfway through mastering loops and conditionals. Jump back into the sandbox to complete your challenge!
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-full bg-black/40 rounded-full h-3 max-w-sm overflow-hidden border border-white/10 relative">
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-[#ff912d] to-[#ffc107] h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-white/80 font-mono text-sm font-bold">65%</span>
              </div>
              
              <Link href="/modules/python-basics" className="inline-flex bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl font-semibold transition-colors items-center gap-2">
                Resume Module
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Sidebar / Leaderboard */}
          <div className="flex flex-col gap-8">
            <div className="bg-subs/30 border border-white/5 rounded-[32px] p-8 h-full flex flex-col shadow-lg">
              <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                Recent Achievements
              </h3>
              <div className="flex flex-col gap-4 flex-1">
                {[
                  { title: 'First Blood', desc: 'Completed the very first module.', time: '2 days ago', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
                  { title: 'Bug Squasher', desc: 'Fixed 5 syntax errors in a row.', time: '1 week ago', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
                  { title: 'Night Owl', desc: 'Coded past midnight.', time: '2 weeks ago', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                ].map((ach, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border flex-shrink-0 ${ach.color}`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{ach.title}</h4>
                      <p className="text-white/50 text-xs mt-1">{ach.desc}</p>
                      <span className="text-white/30 text-[10px] mt-2 block font-mono">{ach.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-semibold text-sm">
                View All Achievements
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
