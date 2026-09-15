import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  Globe, 
  CheckCheck, 
  Bot, 
  Phone, 
  MoreVertical, 
  HelpCircle,
  X,
  Minimize2
} from 'lucide-react';
import { fetchWithAuth } from '../lib/api';

export const WhatsAppWidget = ({ 
  candidateName: propCandidateName,
  isOpen: controlledIsOpen,
  onClose,
  isFloatingTriggerHidden = false
}) => {
  const { user } = useAuth();
  const activeCandidateName = propCandidateName || user?.full_name || 'Trainee';

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [lang, setLang] = useState('hi'); // 'hi' | 'mr' | 'en'
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const [chatFeed, setChatFeed] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `🇮🇳 *राष्ट्रीय कौशल विकास पोर्टल - व्हाट्सएप सेवा* 🇮🇳\n\nनमस्ते *${activeCandidateName}*! कृपया नीचे दिए गए विकल्पों में से चुनें:\n\n1️⃣ *रोजगार स्थिति एवं रिमाइंडर्स*\n2️⃣ *डिजिटल कौशल स्कोरकार्ड*\n3️⃣ *टॉप 3 कौशल सिफारिशें*\n4️⃣ *Day-30 रोजगार पुष्टि दर्ज करें*\n\n_उत्तर देने के लिए नंबर (1, 2, 3, या 4) भेजें।_`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatFeed, isOpen]);

  // Update initial greeting when activeCandidateName changes
  useEffect(() => {
    setChatFeed(prev => {
      if (prev.length === 1 && prev[0].id === 1) {
        return [{
          id: 1,
          sender: 'bot',
          text: `🇮🇳 *राष्ट्रीय कौशल विकास पोर्टल - व्हाट्सएप सेवा* 🇮🇳\n\nनमस्ते *${activeCandidateName}*! कृपया नीचे दिए गए विकल्पों में से चुनें:\n\n1️⃣ *रोजगार स्थिति एवं रिमाइंडर्स*\n2️⃣ *डिजिटल कौशल स्कोरकार्ड*\n3️⃣ *टॉप 3 कौशल सिफारिशें*\n4️⃣ *Day-30 रोजगार पुष्टि दर्ज करें*\n\n_उत्तर देने के लिए नंबर (1, 2, 3, या 4) भेजें।_`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [activeCandidateName]);

  // When language changes, append updated welcome menu
  const handleLangChange = (newLang) => {
    setLang(newLang);
    triggerWebhookCall('menu', newLang);
  };

  const triggerWebhookCall = async (userMsgText, currentLang = lang) => {
    setSending(true);
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append User Message to Chat Feed
    const userMessageObj = {
      id: Date.now(),
      sender: 'user',
      text: userMsgText,
      time: userTime
    };

    setChatFeed(prev => [...prev, userMessageObj]);

    try {
      const res = await fetchWithAuth('/api/whatsapp/webhook', {
        method: 'POST',
        body: JSON.stringify({
          message: userMsgText,
          lang: currentLang,
          candidateName: activeCandidateName
        })
      });

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Append Bot Reply
      setChatFeed(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.reply,
          time: botTime
        }
      ]);
    } catch (err) {
      console.warn('WhatsApp webhook error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const msg = inputText.trim();
    setInputText('');
    triggerWebhookCall(msg);
  };

  // Quick Action Menu Buttons
  const handleQuickKey = (keyNumber) => {
    triggerWebhookCall(String(keyNumber));
  };

  if (!isOpen) {
    if (isFloatingTriggerHidden || controlledIsOpen !== undefined) {
      return null;
    }
    return (
      <button
        onClick={() => setInternalIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs transition-all hover:scale-105"
      >
        <MessageSquare className="w-6 h-6 fill-white" />
        <span className="hidden sm:inline">WhatsApp Bot (Hindi/Marathi)</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-[#efeae2] rounded-[6px] shadow-2xl border border-slate-300 overflow-hidden font-sans flex flex-col h-[520px]">
      {/* Official WhatsApp Green Header */}
      <div className="bg-[#075e54] text-white p-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white text-xs">
              GOV
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border-2 border-[#075e54] rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold tracking-tight">National Skilling WhatsApp Bot</h3>
              <CheckCheck className="w-3.5 h-3.5 text-[#25D366]" />
            </div>
            <p className="text-[10px] text-emerald-200">Twilio Sandbox • Official Verification</p>
          </div>
        </div>

        {/* Controls: Language Dropdown & Minimize */}
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="bg-black/20 text-white text-[11px] font-bold rounded px-1.5 py-0.5 border border-white/20 focus:outline-none"
          >
            <option value="hi" className="text-slate-800">हिंदी (Hindi)</option>
            <option value="mr" className="text-slate-800">मराठी (Marathi)</option>
            <option value="en" className="text-slate-800">English</option>
          </select>

          <button 
            onClick={handleClose}
            className="p-1 text-white/80 hover:text-white transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp Chat Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        {chatFeed.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                  isBot 
                    ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60' 
                    : 'bg-[#dcf8c6] text-slate-900 rounded-tr-none border border-emerald-200'
                }`}
              >
                {msg.text}
                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                  <span>{msg.time}</span>
                  {!isBot && <CheckCheck className="w-3 h-3 text-blue-500" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Option Buttons */}
      <div className="bg-[#f0f2f5] px-3 py-2 border-t border-slate-200/80 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span>Quick Menu Keys</span>
          <HelpCircle className="w-3 h-3 text-[#25D366]" />
        </div>

        <div className="grid grid-cols-4 gap-1 text-[11px]">
          <button
            onClick={() => handleQuickKey(1)}
            className="py-1 px-1 rounded bg-white hover:bg-emerald-50 border border-slate-300 text-slate-800 font-bold text-center transition-colors shadow-xs"
            title="Employment Reminders"
          >
            1️⃣ Reminders
          </button>

          <button
            onClick={() => handleQuickKey(2)}
            className="py-1 px-1 rounded bg-white hover:bg-emerald-50 border border-slate-300 text-slate-800 font-bold text-center transition-colors shadow-xs"
            title="Scorecard Summary"
          >
            2️⃣ Scorecard
          </button>

          <button
            onClick={() => handleQuickKey(3)}
            className="py-1 px-1 rounded bg-white hover:bg-emerald-50 border border-slate-300 text-slate-800 font-bold text-center transition-colors shadow-xs"
            title="Skill Recommendations"
          >
            3️⃣ Skills
          </button>

          <button
            onClick={() => handleQuickKey(4)}
            className="py-1 px-1 rounded bg-white hover:bg-emerald-50 border border-slate-300 text-slate-800 font-bold text-center transition-colors shadow-xs"
            title="Confirm Check-in"
          >
            4️⃣ Confirm
          </button>
        </div>
      </div>

      {/* Bottom Message Input Bar */}
      <form onSubmit={handleSendMessage} className="bg-[#f0f2f5] p-2 border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={lang === 'hi' ? "संदेश लिखें (1, 2, 3, या 4)..." : lang === 'mr' ? "संदेश लिहा (1, 2, 3, किंवा 4)..." : "Type reply (1, 2, 3, 4)..."}
          className="flex-1 bg-white border border-slate-300 text-xs rounded-full px-4 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#25D366]"
        />

        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="w-9 h-9 rounded-full bg-[#128c7e] hover:bg-[#075e54] text-white flex items-center justify-center shadow transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
