import { useTheme } from '../App';

export default function Home() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center text-3xl font-bold transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      Home Page
    </div>
  );
}
