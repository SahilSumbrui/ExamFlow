import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTheme } from '../../App';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  LayoutList, 
  FileText 
} from 'lucide-react';

const QuestionBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { question_id } = useParams();
  const { theme } = useTheme();
  
  const examId = location.state?.examId || 1;
  const isEditMode = !!question_id;

  const [qType, setQType] = useState('MCQ');
  const [qText, setQText] = useState('');
  const [qMarks, setQMarks] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  
  const [options, setOptions] = useState([
    { option_text: '', is_correct: true },
    { option_text: '', is_correct: false }
  ]);

  useEffect(() => {
    if (isEditMode) {
      fetchQuestion();
    }
  }, [question_id]);

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${question_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const question = await res.json();
      
      setQType(question.type);
      setQText(question.question_text);
      setQMarks(question.marks);
      if (question.type === 'MCQ' && question.options) {
        setOptions(question.options.map(opt => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct
        })));
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      exam_id: examId,
      type: qType,
      question_text: qText,
      marks: qMarks,
      options: qType === 'MCQ' ? options : []
    };

    try {
      if (isEditMode) {
        await fetch(`http://localhost:5000/api/questions/${question_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
        alert('Question updated successfully!');
        navigate(`/teacher/exam/${examId}`);
      } else {
        const res = await fetch('http://localhost:5000/api/questions/create-Question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alert('Question added successfully!');
          setQText('');
          setOptions([{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }]);
        } else {
          throw new Error('Failed to create question');
        }
      }
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const setCorrect = (idx) => {
    setOptions(options.map((opt, i) => ({ ...opt, is_correct: i === idx })));
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 flex justify-center font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-3xl w-full">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate(`/teacher/exam/${examId}`, { replace: true })} 
              className={`p-3 rounded-2xl shadow-sm transition-all active:scale-95 border ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-100 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{isEditMode ? 'Edit Question' : 'Question Builder'}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Exam ID: #{examId}</p>
            </div>
          </div>
        </header>

        <div className={`rounded-[3rem] shadow-xl border p-10 relative overflow-hidden ${
          theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
          
          <div className={`flex gap-4 mb-10 p-1.5 rounded-2xl ${
            theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'
          }`}>
            <button 
              type="button"
              onClick={() => setQType('MCQ')}
              className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                qType === 'MCQ' 
                  ? theme === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white shadow-md text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutList size={18} /> <span>Multiple Choice</span>
            </button>
            <button 
              type="button"
              onClick={() => setQType('DESC')}
              className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                qType === 'DESC' 
                  ? theme === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white shadow-md text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText size={18} /> <span>Descriptive</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Question Prompt</label>
              <textarea 
                required
                className={`w-full p-6 border rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium resize-none min-h-[160px] ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                placeholder="Enter your question here..."
                value={qText} onChange={e => setQText(e.target.value)}
              />
            </div>

            <div className="w-36">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">Marks Assigned</label>
              <input 
                type="number" 
                className={`w-full p-4 border rounded-2xl font-black text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                value={qMarks} 
                onChange={e => setQMarks(e.target.value)} 
              />
            </div>

            {qType === 'MCQ' && (
              <div className={`space-y-4 pt-8 border-t ${
                theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div className="flex justify-between items-center mb-2 px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Options & Correct Answer</label>
                  <span className="text-[10px] font-bold text-indigo-500">Select the checkmark for the correct option</span>
                </div>
                
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-3 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                    <button 
                      type="button"
                      onClick={() => setCorrect(idx)}
                      className={`w-16 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                        opt.is_correct 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {opt.is_correct ? <Check size={28} strokeWidth={3} /> : <span className="font-black">{idx + 1}</span>}
                    </button>
                    <input 
                      type="text" required
                      className={`flex-1 p-5 border rounded-2xl outline-none focus:border-indigo-300 transition-all font-semibold ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                      }`}
                      placeholder={`Enter Option ${idx + 1}`}
                      value={opt.option_text}
                      onChange={e => {
                        const n = [...options];
                        n[idx].option_text = e.target.value;
                        setOptions(n);
                      }}
                    />
                    {options.length > 2 && (
                      <button 
                        type="button"
                        onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                        className="w-14 flex items-center justify-center rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={() => setOptions([...options, { option_text: '', is_correct: false }])}
                  className={`w-full py-5 border-2 border-dashed rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all mt-2 ${
                    theme === 'dark' 
                      ? 'border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                      : 'border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30'
                  }`}
                >
                  <Plus size={16} className="inline mr-2" /> Add Another Option
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSaving}
              className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-slate-400 ${
                theme === 'dark' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300'
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? "Saving..." : isEditMode ? "Update Question" : "Save Question to Exam"}</span>
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
          All changes are saved to the current exam session
        </p>
      </div>
    </div>
  );
};

export default QuestionBuilder;