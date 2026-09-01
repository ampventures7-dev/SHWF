import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  Languages,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  HeartPulse,
  Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AudioReportPlayer({
  isOpen,
  onClose,
  student,
  report,
  onToast,
}) {
  const { language, t } = useLanguage();
  const [audioLang, setAudioLang] = useState(language === 'hi' ? 'hi' : 'en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voices, setVoices] = useState([]);

  const utteranceRef = useRef(null);

  // Sync audio language with global language when modal opens
  useEffect(() => {
    if (isOpen) {
      setAudioLang(language === 'hi' ? 'hi' : 'en');
    }
  }, [isOpen, language]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices() || [];
        setVoices(availableVoices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        window.speechSynthesis.cancel();
      };
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      handleStop();
    }
  }, [isOpen]);

  const vitals = report?.vitals || { height_cm: 138.5, weight_kg: 31.0 };
  const zscores = report?.zscores || { height_for_age_z: 0.15 };
  const forecast = report?.growth_forecast;
  const audioSummary = report?.audio_summary;

  const defaultScriptEn = audioSummary?.script_en || (
    `Hello from Smart Health Welfare Foundation. Here is the health report summary for ${student?.full_name || 'your child'}. ` +
    `Height is ${vitals.height_cm} centimeters and weight is ${vitals.weight_kg} kilograms, reflecting healthy physical growth parameters. ` +
    `Over the next 6 months, expected height projection is ${forecast?.six_month_forecast?.projected_height_cm || (Number(vitals.height_cm) + 2.7).toFixed(1)} centimeters. ` +
    `For daily nutrition, ensure meals rich in proteins, lentils, seasonal vegetables, and warm milk. ` +
    `Please schedule a routine pediatric dental cleaning and vision checkup in 6 months. ` +
    `Thank you for prioritizing your child's well-being.`
  );

  const defaultScriptHi = audioSummary?.script_hi || (
    `नमस्ते। स्मार्ट हेल्थ वेलफेयर फाउंडेशन की ओर से यह ${student?.full_name || 'आपके बच्चे'} की स्वास्थ्य जांच रिपोर्ट का विवरण है। ` +
    `लंबाई ${vitals.height_cm} सेंटीमीटर और वजन ${vitals.weight_kg} किलोग्राम है, जो बच्चे के स्वस्थ और संतुलित विकास को दर्शाता है। ` +
    `आगामी 6 महीनों में बच्चे की अनुमानित लंबाई ${forecast?.six_month_forecast?.projected_height_cm || (Number(vitals.height_cm) + 2.7).toFixed(1)} सेंटीमीटर तक पहुंचने की उम्मीद है। ` +
    `दैनिक पोषण के लिए दालें, हरी सब्जियां, पनीर, उबला अंडा या अंकुरित अनाज और गर्म दूध अवश्य दें। ` +
    `कृपया 6 महीने बाद बच्चे की नियमित दंत और नेत्र जांच अवश्य करवाएं। ` +
    `बच्चे के उत्तम स्वास्थ्य और उज्ज्वल भविष्य के लिए धन्यवाद।`
  );

  const activeScript = audioLang === 'hi' ? defaultScriptHi : defaultScriptEn;
  const highlights = audioLang === 'hi'
    ? (audioSummary?.key_highlights_hi || [
        `वर्तमान लंबाई: ${vitals.height_cm} सेमी | वजन: ${vitals.weight_kg} किग्रा`,
        `6-माह अनुमानित लंबाई: ${(Number(vitals.height_cm) + 2.7).toFixed(1)} सेमी`,
        "दालें, हरी सब्जियां और दूध का दैनिक सेवन",
        "अगला नियमित स्वास्थ्य परीक्षण: 6 महीने में"
      ])
    : (audioSummary?.key_highlights_en || [
        `Current Height: ${vitals.height_cm} cm | Weight: ${vitals.weight_kg} kg`,
        `6-Month Projected Milestone: ${(Number(vitals.height_cm) + 2.7).toFixed(1)} cm`,
        "High-protein diet & green vegetables recommended",
        "Next Routine Screening: In 6 Months"
      ]);

  const handlePlay = (forcedText = null, forcedLang = null) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onToast) onToast('Speech synthesis not supported in this browser.', 'error');
      return;
    }

    const currentLang = forcedLang || audioLang;
    const textToSpeak = forcedText || (currentLang === 'hi' ? defaultScriptHi : defaultScriptEn);

    window.speechSynthesis.cancel(); // cancel existing

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Pick best matching voice
    if (currentLang === 'hi') {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find(
        v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('kalpana')
      );
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'en-IN';
      const indianEnglishVoice = voices.find(
        v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('rishi') || v.name.toLowerCase().includes('heera') || v.lang.startsWith('en')
      );
      if (indianEnglishVoice) utterance.voice = indianEnglishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      handlePlay();
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => {
      handlePlay();
    }, 150);
  };

  const handleLanguageSwitch = (newLang) => {
    setAudioLang(newLang);
    if (isPlaying || isPaused) {
      handleStop();
      setTimeout(() => {
        handlePlay(newLang === 'hi' ? defaultScriptHi : defaultScriptEn, newLang);
      }, 150);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      handleStop();
      setTimeout(() => {
        handlePlay();
      }, 150);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with gradient badge */}
        <div className="p-6 bg-gradient-to-r from-shwf-navy via-indigo-900 to-blue-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-teal-300">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-300">
                {t('dashboard.audioExplainerTitle', 'Bilingual Audio Health Explainer')}
              </span>
              <h3 className="text-xl font-black text-white">
                {student?.full_name || 'Student Health Report'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed pr-8">
            {t('dashboard.audioExplainerSubtitle', 'Doctor-approved audio breakdown of physical examination, growth milestones, and nutrition advice in Hindi & English')}
          </p>
        </div>

        {/* Audio Visualizer Waveform & Status */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Waveform Card */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-teal-50/70 rounded-2xl p-5 border border-indigo-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Pulsing Equalizer Bars */}
            <div className="flex items-center justify-center gap-1.5 h-12 mb-3">
              {[40, 75, 55, 90, 65, 80, 45, 95, 60, 70, 85, 50, 65].map((height, idx) => (
                <div
                  key={idx}
                  style={{
                    height: isPlaying ? `${height}%` : '20%',
                    transition: 'height 0.25s ease-in-out',
                    animationDelay: `${idx * 0.08}s`
                  }}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isPlaying 
                      ? 'bg-gradient-to-t from-indigo-600 via-blue-500 to-teal-400 animate-pulse' 
                      : isPaused
                      ? 'bg-amber-400'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Status Label */}
            <div className="text-xs font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-2">
              {isPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
              <span>
                {isPlaying 
                  ? t('dashboard.audioPlaying', 'Playing Voice Explainer...') 
                  : isPaused 
                  ? t('dashboard.audioPaused', 'Audio Paused') 
                  : t('dashboard.audioReady', 'Ready to Play')}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              {audioLang === 'hi' ? 'भाषा: हिंदी (Devanagari Voice)' : 'Language: Indian English'} &bull; ~40s Duration
            </div>
          </div>

          {/* Primary Controls Row */}
          <div className="flex items-center justify-center gap-3">
            {!isPlaying && !isPaused && (
              <button
                onClick={() => handlePlay()}
                className="px-6 py-3 rounded-2xl bg-shwf-navy hover:bg-shwf-blue text-white font-extrabold text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t('dashboard.audioPlay', 'Play Audio')}</span>
              </button>
            )}

            {isPlaying && (
              <button
                onClick={handlePause}
                className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>{t('dashboard.audioPause', 'Pause')}</span>
              </button>
            )}

            {isPaused && (
              <button
                onClick={handleResume}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t('dashboard.audioResume', 'Resume')}</span>
              </button>
            )}

            {(isPlaying || isPaused) && (
              <>
                <button
                  onClick={handleRestart}
                  title={t('dashboard.audioRestart', 'Restart')}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleStop}
                  title={t('dashboard.audioStop', 'Stop')}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-red-50 text-red-600 transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-red-600" />
                </button>
              </>
            )}
          </div>

          {/* Options: Language Switcher & Speed selector */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            
            {/* Language Switcher */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                {t('dashboard.audioLangToggle', 'Audio Language')}
              </span>
              <div className="grid grid-cols-2 gap-1 bg-slate-200/80 p-0.5 rounded-xl">
                <button
                  onClick={() => handleLanguageSwitch('en')}
                  className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    audioLang === 'en'
                      ? 'bg-white text-shwf-navy shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageSwitch('hi')}
                  className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    audioLang === 'hi'
                      ? 'bg-white text-shwf-navy shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Speed Selector */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                {t('dashboard.audioSpeed', 'Speed')}
              </span>
              <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-0.5 rounded-xl">
                {[0.85, 1.0, 1.2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-white text-shwf-navy shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Key Audio Highlights */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-shwf-orange" />
              {t('dashboard.audioHighlights', 'Executive Highlights')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Spoken Transcript */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>{t('dashboard.audioTranscript', 'Spoken Transcript')}</span>
              </div>
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTranscript && (
              <div className="p-4 bg-white text-xs text-slate-700 leading-relaxed border-t border-slate-200 italic">
                "{activeScript}"
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
