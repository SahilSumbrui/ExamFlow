import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../App';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertTriangle, 
  LayoutGrid, 
  FileText,
  CheckCircle2,
  Timer,
  ShieldAlert,
  Loader2
} from 'lucide-react';

const ExamRoom = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Exam State
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Anti-Cheat State
  const [violationCount, setViolationCount] = useState(0);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await API.get(`/tests/${attemptId}/questions`);
        const data = res.data;
        setExam(data);

        // Calculate remaining time
        const startTime = new Date(data.start_time);
        const endTime = new Date(data.end_time);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalSeconds = data.duration_minutes * 60;
        const timeUntilEnd = Math.floor((endTime - now) / 1000);
        
        // Use the minimum of duration remaining or time until exam ends
        const remaining = Math.max(0, Math.min(totalSeconds - elapsedSeconds, timeUntilEnd));
        setTimeLeft(remaining);

        // Request fullscreen
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.log('Fullscreen request failed:', err);
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [attemptId]);

  // 1. Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Violation logging function
  const logViolation = async (type) => {
    if (isFinished) return;

    // First violation - just warning
    if (!hasShownWarning) {
      setHasShownWarning(true);
      setWarningMessage('This is your first and only warning. Further violations will be counted.');
      setShowViolationWarning(true);
      return;
    }

    // Subsequent violations - count and log
    const newCount = violationCount + 1;
    setViolationCount(newCount);
    setWarningMessage(`Violation ${newCount} of 3 detected. ${newCount >= 3 ? 'Exam will be auto-submitted.' : ''}`);
    setShowViolationWarning(true);

    try {
      const res = await API.post('/tests/violation', {
        attempt_id: attemptId,
        violation_type: type
      });
      const data = res.data;
      
      // Auto-submit if limit reached
      if (data.auto_submitted || newCount >= 3) {
        await handleSubmit();
      }
    } catch (err) {
      console.error('Failed to log violation:', err);
    }
  };

  // Anti-Cheat: Fullscreen, Tab Switch, Window Blur, Copy, Right-click
  useEffect(() => {
    if (isFinished) return;

    // Fullscreen exit detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isFinished) {
        logViolation('FULLSCREEN_EXIT');
      }
    };

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        logViolation('TAB_SWITCH');
      }
    };

    // Window blur detection
    const handleBlur = () => {
      if (!isFinished) {
        logViolation('WINDOW_BLUR');
      }
    };

    // Copy attempt detection
    const handleCopy = (e) => {
      e.preventDefault();
      logViolation('COPY_ATTEMPT');
    };

    // Right-click detection
    const handleContextMenu = (e) => {
      e.preventDefault();
      logViolation('RIGHT_CLICK');
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [attemptId, isFinished, hasShownWarning, violationCount]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswer = (val) => {
    const currentQ = exam.questions[currentIdx];
    setAnswers({ ...answers, [currentQ.question_id]: val });
  };

  const submitAnswer = async (val) => {
    const currentQ = exam.questions[currentIdx];

    try {
      const response = await API.post('/tests/submit-answer', {
        attempt_id: attemptId,
        question_id: currentQ.question_id,
        selected_option_id: currentQ.type === 'MCQ' ? currentQ.options.find(o => o.option_text === val)?.option_id : null,
        descriptive_answer: currentQ.type === 'DESC' ? val : null
      });
      if (response.status === 409) return;
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await API.post('/tests/end', { attempt_id: attemptId });
      setIsFinished(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <p className={`font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Exam not found</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 font-sans ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className={`max-w-md w-full rounded-[3rem] p-12 text-center shadow-xl border animate-in zoom-in duration-500 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h2 className={`text-3xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Assessment Submitted</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Your responses have been securely encrypted and transmitted. Results will be published after faculty review.
          </p>
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold hover:bg-slate-800 transition shadow-xl"
          >
            Back to Portal Home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentIdx];

  return (
    <div className={`min-h-screen font-sans flex flex-col ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Fixed Navigation Header */}
      <header className={`border-b px-8 py-5 flex justify-between items-center sticky top-0 z-30 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <ShieldAlert size={20} className={violationCount > 0 ? "text-amber-400" : "text-white"} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">{exam.title}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Attempt ID: {attemptId}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black transition-colors shadow-sm ${timeLeft < 60 ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
          <Timer size={18} />
          <span className="tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 grid lg:grid-cols-12 gap-10">
        
        {/* Left: Question Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className={`rounded-[3rem] p-10 md:p-12 shadow-sm border relative overflow-hidden ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
            
            <div className="flex justify-between items-start mb-10">
              <span className="px-5 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                Question {currentIdx + 1} of {exam.questions.length}
              </span>
              <span className="text-slate-400 font-bold text-sm tracking-tight">{currentQ.marks} Marks</span>
            </div>

            <h3 className={`text-2xl font-bold leading-snug mb-10 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {currentQ.question_text}
            </h3>

            {currentQ.type === 'MCQ' ? (
              <div className="grid gap-4">
                {currentQ.options.map((option, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      handleAnswer(option.option_text);
                      submitAnswer(option.option_text);
                    }}
                    className={`p-6 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-4 group ${answers[currentQ.question_id] === option.option_text ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${answers[currentQ.question_id] === option.option_text ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    {option.option_text}
                  </button>
                ))}
              </div>
            ) : (
              <textarea 
                className={`w-full min-h-[300px] p-8 border rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium leading-relaxed ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                placeholder="Type your response here..."
                value={answers[currentQ.question_id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center px-4">
            <button 
              disabled={currentIdx === 0}
              onClick={() => {
                if (answers[currentQ.question_id]) {
                  submitAnswer(answers[currentQ.question_id]);
                }
                setCurrentIdx(prev => prev - 1);
              }}
              className="flex items-center gap-2 font-black text-sm uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={20} /> Previous
            </button>

            {currentIdx === exam.questions.length - 1 ? (
              <button 
                onClick={async () => {
                  if (answers[currentQ.question_id]) {
                    await submitAnswer(answers[currentQ.question_id]);
                  }
                  handleSubmit();
                }}
                disabled={isSubmitting}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {isSubmitting ? "Finalizing..." : "Final Submission"}
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (answers[currentQ.question_id]) {
                    submitAnswer(answers[currentQ.question_id]);
                  }
                  setCurrentIdx(prev => prev + 1);
                }}
                className="flex items-center gap-2 font-black text-sm uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-all"
              >
                Next Question <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Overview Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className={`rounded-[2.5rem] p-8 border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-8 px-2">
              <LayoutGrid size={20} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Navigation</h4>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {exam.questions.map((q, idx) => (
                <button 
                  key={q.question_id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-12 rounded-xl font-black text-xs transition-all border-2 ${
                    currentIdx === idx 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : answers[q.question_id] 
                        ? (theme === 'dark' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-50 text-emerald-600')
                        : (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200')
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className={`mt-10 pt-8 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
               <div className={`flex items-center gap-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Answered</p>
                    <p className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{Object.keys(answers).length} / {exam.questions.length}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Warning Card */}
          {violationCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 animate-in shake duration-500">
              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <AlertTriangle size={24} />
                <h5 className="font-black uppercase text-xs tracking-widest">Violations: {violationCount}/3</h5>
              </div>
              <p className="text-amber-800/80 text-xs font-medium leading-relaxed">
                Suspicious activity detected and logged. {3 - violationCount} violations remaining before auto-submission.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Warning Modal Overlay */}
      {showViolationWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in">
          <div className={`rounded-[3rem] p-10 w-full max-w-md shadow-2xl text-center relative overflow-hidden animate-in zoom-in ${theme === 'dark' ? 'bg-[#161b2b]' : 'bg-white'}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className={`text-2xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Security Violation Detected</h3>
            <p className={`font-medium mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {warningMessage}
            </p>
            <button 
              onClick={() => {
                setShowViolationWarning(false);
                // Re-request fullscreen if exited
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(err => console.log(err));
                }
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRoom;
