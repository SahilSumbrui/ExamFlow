import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { useTheme } from '../../App';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { theme } = useTheme();
  const [leaderboard, setLeaderboard] = useState([]);
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/leaderboard/${examId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setLeaderboard(data);
        
        // Get exam total marks from first result
        if (data.length > 0 && data[0].total_marks) {
          setExamInfo({ total_marks: data[0].total_marks });
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [examId]);

  const filteredRankings = useMemo(() => {
    return leaderboard.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaderboard, searchTerm]);

  const avgScore = leaderboard.length > 0 && examInfo?.total_marks
    ? Math.round(leaderboard.reduce((sum, s) => sum + ((s.score || 0) / examInfo.total_marks * 100), 0) / leaderboard.length)
    : 0;

  if (loading) return (
    <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen font-sans transition-colors duration-500">
      <main className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/student/dashboard')} 
              className={`p-3 rounded-2xl border shadow-sm transition-all active:scale-95 ${
                theme === 'dark' 
                ? 'bg-[#161b2b] border-slate-800 text-slate-400 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-3xl font-black tracking-tight">Leaderboard</h2>
              <p className="text-slate-500 font-medium text-sm">Exam Rankings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={`px-5 py-3 rounded-[1.5rem] border ${
               theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
             }`}>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5 text-center">Average Score</p>
                <p className="text-xl font-black text-indigo-600 text-center">{avgScore}%</p>
             </div>
          </div>
        </header>

        <div className="space-y-6 pt-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <h3 className="text-xl font-black tracking-tight">Full Ranking List</h3>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="text" placeholder="Find participant..."
                    className={`pl-11 pr-4 py-3 rounded-2xl outline-none text-sm font-medium transition-all border w-full md:w-64 ${
                      theme === 'dark' ? 'bg-[#161b2b] border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                    }`}
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className={`rounded-[2.5rem] border overflow-hidden shadow-sm ${
             theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
           }`}>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className={theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50/50'}>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800/10 w-24 text-center">Rank</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800/10">Student</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800/10 text-center">Score</th>
                          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800/10 text-right">Integrity</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10">
                       {filteredRankings.map((item) => {
                         const rank = item.rank;
                         const isGold = rank === 1;
                         const isSilver = rank === 2;
                         const isBronze = rank === 3;

                         return (
                           <tr key={item.student_id} className={`group transition-all ${
                             isGold ? (theme === 'dark' ? 'bg-yellow-600/20 hover:bg-yellow-600/30' : 'bg-yellow-100/70 hover:bg-yellow-100') :
                             isSilver ? (theme === 'dark' ? 'bg-gray-600/20 hover:bg-gray-600/30' : 'bg-gray-200/70 hover:bg-gray-200') :
                             isBronze ? (theme === 'dark' ? 'bg-amber-700/20 hover:bg-amber-700/30' : 'bg-amber-100/70 hover:bg-amber-100') :
                             'hover:bg-slate-800/5'
                           }`}>
                            <td className="p-6 text-center">
                               <div className="flex justify-center">
                                  {isGold ? (
                                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-200/20">
                                      <Crown size={20} />
                                    </div>
                                  ) : isSilver ? (
                                    <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 shadow-lg shadow-slate-200/20">
                                      <Medal size={20} />
                                    </div>
                                  ) : isBronze ? (
                                    <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-800/20">
                                      <Award size={20} />
                                    </div>
                                  ) : (
                                    <span className="font-black text-slate-400">#{rank}</span>
                                  )}
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-4">
                                  <div>
                                     <p className="font-bold">{item.name}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6 text-center">
                               <p className="text-lg font-black">{item.score || 0} <span className="text-slate-400 text-sm">/ {item.total_marks || 0}</span></p>
                            </td>
                            <td className="p-6 text-right">
                               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                 item.integrity_score >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
                                 item.integrity_score >= 60 ? 'bg-amber-400/10 text-amber-600' :
                                 'bg-rose-500/10 text-rose-500'
                               }`}>
                                  {item.integrity_score}%
                               </div>
                            </td>
                           </tr>
                         );
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
