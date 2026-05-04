import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../App';
import { 
  Trophy, 
  Target, 
  Percent, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  FileText,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';



import API from '../../api/axios';

const StudentResultContent = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'review'

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/attempts/${attemptId}/details`, { validateStatus: () => true });
      
      if (res.status === 403 && res.data.message === 'Results not published yet') {
        setResult({ notPublished: true });
        setLoading(false);
        return;
      }
      if (res.status !== 200) {
        setResult(null);
        setLoading(false);
        return;
      }
      const data = res.data;
      
      if (!data || data.length === 0) {
        setResult(null);
        setLoading(false);
        return;
      }

      const firstRow = data[0];
      
      // Build questions array from all questions (including unattempted)
      const allQuestions = data.map(row => ({
        question_id: row.question_id,
        question_text: row.question_text,
        question_type: row.type,
        marks: row.max_marks,
        student_answer: row.selected_option || row.descriptive_answer || null,
        correct_answer: row.correct_answer,
        is_correct: row.marks_awarded === row.max_marks,
        marks_obtained: row.marks_awarded || 0,
        is_attempted: row.answer_id !== null,
        is_evaluated: row.type === 'DESC' ? (row.marks_awarded !== null && row.marks_awarded !== undefined) : true
      }));

      const transformed = {
        attempt_id: attemptId,
        student_name: firstRow.student_name,
        student_id: firstRow.student_id,
        exam_id: firstRow.exam_id,
        exam_title: firstRow.exam_title,
        course_id: firstRow.course_id,
        submitted_at: firstRow.submitted_at,
        integrity_score: firstRow.integrity_score,
        start_time: firstRow.start_time,
        end_time: firstRow.end_time,
        score: data.reduce((sum, row) => sum + (row.marks_awarded || 0), 0),
        total_marks: firstRow.exam_total_marks,
        answers: allQuestions
      };
      
      setResult(transformed);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className="text-center animate-pulse">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Calculating Final Grades...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className="text-center">
          <p className="text-slate-500 font-bold">Result not found</p>
        </div>
      </div>
    );
  }

  if (result.notPublished) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className={`text-center max-w-md rounded-[3rem] p-12 ${
          theme === 'dark' ? 'bg-[#161b2b]' : 'bg-white'
        }`}>
          <AlertCircle className="mx-auto mb-6 text-amber-500" size={64} />
          <h2 className={`text-2xl font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Results Not Published</h2>
          <p className="text-slate-500 font-medium mb-8">Your teacher is still reviewing submissions. Results will be available once published.</p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const percentage = result.score && result.total_marks ? Math.round((result.score / result.total_marks) * 100) : 0;
  const isPassed = percentage >= 40;

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`border-b px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm ${
        theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => viewMode === 'review' ? setViewMode('summary') : navigate(-1)}
            className={`p-2 rounded-xl transition-colors text-slate-400 ${
              theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-lg font-black tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {viewMode === 'summary' ? 'Result Transcript' : 'Detailed Review'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {result?.attempt_id}</p>
          </div>
        </div>
        <div className={`flex p-1 rounded-xl border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
           <button 
             onClick={() => setViewMode('summary')}
             className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
               viewMode === 'summary' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400'
             }`}
           >Summary</button>
           <button 
             onClick={() => setViewMode('review')}
             className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
               viewMode === 'review' ? (theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400'
             }`}
           >Review</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        
        {viewMode === 'summary' ? (
          <>
            {/* Summary Hero */}
            <div className={`rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl transition-all duration-500 ${
              isPassed ? (theme === 'dark' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-indigo-600 shadow-indigo-200') : (theme === 'dark' ? 'bg-rose-600 shadow-rose-500/20' : 'bg-rose-600 shadow-rose-200')
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-left">
                  <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Assessment Outcome</span>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
                    {isPassed ? 'Pass' : 'Fail'}
                  </h2>
                  <p className="text-white/80 font-medium text-lg">
                    {isPassed ? 'Congratulations on clearing the threshold.' : 'You did not meet the 40% passing requirement.'}
                  </p>
                </div>
                <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-[3rem] text-center min-w-[220px]">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Percentage</p>
                  <div className="text-6xl font-black">{percentage}%</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
              {/* Stats & Integrity */}
              <div className="md:col-span-4 space-y-6">
                <div className={`rounded-[2.5rem] p-8 shadow-sm border ${
                  theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Exam Info</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Calendar size={18} className="text-slate-300" />
                      <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="flex gap-4">
                      <Clock size={18} className="text-slate-300" />
                      <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        {result.start_time && result.end_time ? (
                          (() => {
                            const minutes = Math.round((new Date(result.end_time) - new Date(result.start_time)) / 60000);
                            if (minutes < 60) return `${minutes}m`;
                            const hours = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return `${hours}h ${mins}m`;
                          })()
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-[2.5rem] p-8 border-2 ${result.integrity_score < 70 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest">Integrity Score</span>
                    {result.integrity_score < 70 ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                  </div>
                  <p className="text-2xl font-black">{result.integrity_score || 0}%</p>
                  <p className="text-[10px] font-bold uppercase mt-1 opacity-70">
                    {result.integrity_score < 50 ? 'Flagged for Review' : 'Verified Session'}
                  </p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="md:col-span-8">
                <div className={`rounded-[3rem] p-10 shadow-sm border h-full ${
                  theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Performance Breakdown</h3>
                  <div className="flex items-center gap-10 mb-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                      <p className={`text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{result.score || 0} <span className="text-slate-400 text-3xl">/ {result.total_marks || 0}</span></p>
                    </div>
                    <div className="h-16 w-px bg-slate-100" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Result Status</p>
                      <p className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPassed ? 'PASSED' : 'FAILED'}
                      </p>
                    </div>
                  </div>

                  <div className={`pt-8 border-t flex gap-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button onClick={() => navigate(`/student/leaderboard/${result.exam_id}`)} className={`flex-1 py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-xl ${
                      theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-slate-900 hover:bg-slate-800'
                    }`}>
                      <Trophy size={18} /> View Leaderboard
                    </button>
                    <button onClick={() => setViewMode('review')} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}>
                      Detailed Review <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* DETAILED REVIEW SECTION */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Question Analysis</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{result.answers?.length || 0} Assessment Items</p>
            </div>

            {result.answers?.map((resp, idx) => (
              <div key={resp.question_id} className={`rounded-[2.5rem] border shadow-sm overflow-hidden ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Question {idx + 1}</span>
                    <div className="flex gap-2">
                      {!resp.is_attempted && (
                        <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                          Not Attempted
                        </span>
                      )}
                      {resp.is_attempted && resp.question_type === 'DESC' && !resp.is_evaluated && (
                        <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">
                          Pending Evaluation
                        </span>
                      )}
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        resp.marks_obtained > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {resp.marks_obtained || 0} / {resp.marks} Marks
                      </span>
                    </div>
                  </div>

                  <h4 className={`text-lg font-bold mb-8 leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{resp.question_text}</h4>

                  {!resp.is_attempted ? (
                    <div className={`p-8 rounded-2xl border-2 border-dashed text-center ${
                      theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <AlertCircle className="mx-auto mb-3 text-slate-400" size={32} />
                      <p className="text-slate-400 font-bold">No answer submitted for this question</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {resp.question_type === 'MCQ' ? (
                        <div className="grid gap-3">
                          <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${resp.is_correct ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-rose-100 bg-rose-50 text-rose-800'}`}>
                            <div className="flex items-center gap-3">
                              {resp.is_correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                              <span className="font-bold">Your Answer: {resp.student_answer}</span>
                            </div>
                          </div>
                          {!resp.is_correct && resp.correct_answer && (
                            <div className={`p-5 rounded-2xl border-2 ${
                              theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-100 bg-slate-50 text-slate-500'
                            }`}>
                              <span className="font-bold">Correct Answer: {resp.correct_answer}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Your Submitted Response</p>
                          <div className={`p-8 rounded-[2rem] border italic text-sm leading-relaxed ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
                          }`}>
                            "{resp.student_answer}"
                          </div>
                          {!resp.is_evaluated && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm font-bold">
                              <AlertCircle size={16} />
                              <span>Awaiting teacher evaluation</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentResultContent;