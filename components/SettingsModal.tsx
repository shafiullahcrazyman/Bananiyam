
import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Smartphone, Speaker, Globe, Wifi, CheckCircle, AlertTriangle, WifiOff, CloudLightning, Database } from 'lucide-react';
import { AppSettings, VibrationIntensity } from '../types';
import { testApiConnection } from '../services/geminiService';

interface Props {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ settings, updateSettings, onClose }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const runConnectionTest = async () => {
    setTestStatus('loading');
    setTestMessage('Pinging Gemini API...');
    
    const result = await testApiConnection();
    
    if (result.success) {
      setTestStatus('success');
      setTestMessage(result.message);
    } else {
      setTestStatus('error');
      setTestMessage(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl m-4 border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">

          {/* Connection Mode Section - SIMPLIFIED DESIGN */}
           <div>
             <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">
               <Wifi size={16} /> Connection Mode
             </div>

             {/* Mode Toggle */}
             <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex mb-3">
               <button 
                 onClick={() => updateSettings({ isOfflineMode: false })}
                 className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${!settings.isOfflineMode ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
               >
                 <CloudLightning size={16} /> AI Mode
               </button>
               <button 
                 onClick={() => updateSettings({ isOfflineMode: true })}
                 className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${settings.isOfflineMode ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
               >
                 <Database size={16} /> Offline
               </button>
             </div>

             {/* Connection Details / Test Tool */}
             {!settings.isOfflineMode ? (
                <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-3 border border-primary-100 dark:border-primary-900/30 flex flex-col gap-2">
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-primary-700 dark:text-primary-300 font-medium">Gemini API Status</span>
                      <button 
                        onClick={runConnectionTest}
                        disabled={testStatus === 'loading'}
                        className="text-xs bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-600 px-3 py-1 rounded-full text-primary-600 dark:text-primary-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                      >
                        {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                      </button>
                   </div>
                   {/* Feedback Message */}
                   {(testStatus === 'success' || testStatus === 'error') && (
                      <div className={`text-xs flex items-center gap-1.5 ${testStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                         {testStatus === 'success' ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                         {testMessage}
                      </div>
                   )}
                </div>
             ) : (
                 <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                       <CheckCircle size={12} className="text-slate-400"/> Using local offline dictionary.
                    </p>
                 </div>
             )}
          </div>
          
          {/* Theme Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">
              <Sun size={16} /> Appearance
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex">
              <button 
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${settings.theme === 'light' ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <Sun size={16} /> Light
              </button>
              <button 
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${settings.theme === 'dark' ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <Moon size={16} /> Dark
              </button>
              <button 
                onClick={() => updateSettings({ theme: 'system' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${settings.theme === 'system' ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <Monitor size={16} /> System
              </button>
            </div>
          </div>

          {/* Voice Accent Section */}
          <div>
             <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">
              <Globe size={16} /> Voice Accent
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-xl flex">
              <button 
                onClick={() => updateSettings({ voiceAccent: 'US' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${settings.voiceAccent === 'US' ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                American
              </button>
              <button 
                onClick={() => updateSettings({ voiceAccent: 'GB' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${settings.voiceAccent === 'GB' ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
              >
                British
              </button>
            </div>
          </div>

          {/* Audio Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">
              <Speaker size={16} /> Sound & Haptics
            </div>
            
            <div className="space-y-6">
              {/* TTS Volume */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Voice Volume</label>
                  <span className="text-xs text-slate-400">{Math.round(settings.ttsVolume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={settings.ttsVolume}
                  onChange={(e) => updateSettings({ ttsVolume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* SFX Volume */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Sound Effects</label>
                  <span className="text-xs text-slate-400">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={settings.sfxVolume}
                  onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* Vibration */}
              <div>
                 <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"><Smartphone size={16}/> Vibration</label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['off', 'light', 'medium', 'heavy'] as VibrationIntensity[]).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => updateSettings({ vibration: intensity })}
                      className={`py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                        settings.vibration === intensity 
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600 dark:text-primary-400' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
