import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../App';
import { ArrowLeft, Loader2, CheckCircle, Clock } from 'lucide-react';
import API from '../../api/axios';

const AdminExamSubmissions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [submissions, setSubmissions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, submissionsRes] = await Promise.all([
          API.get(`/exams/${examId}`),
          API.get(`/exams/${examId}/submissions`)
        ]);
        setExam(examRes.data);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <main className="p-6 md:p-8 lg:p-12 space-y-10">
        
        {/* Header */}
        <header className="flex items-center gap-5">
          <button 
            onClick={() => navigate(`/admin/exam/${examId}`)} 
            className={`p-3 border rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Submissions for {exam?.title}
            </h2>
            <p className="text-slate-500 font-medium text-sm">Review student responses (Read-only)</p>
          </div>
        </header>

        {/* Submissions List */}
        <div className={`rounded-[2rem] border shadow-sm overflow-hidden ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
          {submissions.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-bold">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50/50'}>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Score</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.map((sub) => (
                    <tr key={sub.attempt_id} className={`transition-all ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-6">
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{sub.student_name}</p>
                        <p className="text-xs text-slate-400">{sub.student_email}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${sub.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <p className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {sub.score !== null ? `${sub.score}/${exam?.total_marks || 100}` : 'Pending'}
                        </p>
                      </td>
                      <td className="p-6 text-slate-500 font-medium">
                        {sub.start_time && sub.end_time ? (
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {(() => {
                              const start = new Date(sub.start_time);
                              const end = new Date(sub.end_time);
                              const minutes = Math.floor((end - start) / 60000);
                              const hours = Math.floor(minutes / 60);
                              const mins = minutes % 60;
                              return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                            })()}
                          </div>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#161b2b] border border-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {selectedSubmission.student_name}'s Submission
                </h3>
                <p className="text-slate-500 text-sm mt-1">Review only - No evaluation</p>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                ✕
              </button>
            </div>

            {/* Submission Info */}
            <div className={`p-6 rounded-2xl mb-6 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedSubmission.status}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                  <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {selectedSubmission.score !== null ? `${selectedSubmission.score}/${exam?.total_marks || 100}` : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <h4 className={`font-black text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Student Responses</h4>
              {selectedSubmission.answers && selectedSubmission.answers.length > 0 ? (
                selectedSubmission.answers.map((answer, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Q{idx + 1}: {answer.question_text}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="font-bold">Answer:</span> {answer.student_answer || 'No answer provided'}
                    </p>
                    {answer.is_correct !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <CheckCircle size={16} className={answer.is_correct ? 'text-emerald-500' : 'text-rose-500'} />
                        <span className={`text-xs font-bold ${answer.is_correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {answer.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No responses recorded</p>
              )}
            </div>

            <button 
              onClick={() => setSelectedSubmission(null)}
              className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExamSubmissions;
