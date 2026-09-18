import dotenv from 'dotenv';
dotenv.config();

// Twilio Sandbox & WhatsApp Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'MOCK_TWILIO_AUTH_TOKEN';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

/**
 * Multilingual Menu Dictionary
 */
const MESSAGES = {
  hi: {
    welcome: `🇮🇳 *राष्ट्रीय कौशल विकास पोर्टल - व्हाट्सएप सेवा* 🇮🇳\n\nनमस्ते *[CANDIDATE_NAME]*! कृपया नीचे दिए गए विकल्पों में से चुनें:\n\n1️⃣ *रोजगार स्थिति एवं रिमाइंडर्स (Employment Status & Reminders)*\n2️⃣ *डिजिटल कौशल स्कोरकार्ड (Digital Scorecard Summary)*\n3️⃣ *टॉप 3 कौशल सिफारिशें (Top 3 Skill Recommendations)*\n4️⃣ *Day-30 रोजगार पुष्टि दर्ज करें (Submit Day 30 Check-in)*\n\n_उत्तर देने के लिए नंबर (1, 2, 3, या 4) भेजें।_`,
    status: `💼 *रोजगार स्थिति और 30/90/180-दिवस चेक-इन*\n\n• *वर्तमान स्थिति:* Tata Advanced Engineering में कार्यरत (Placed)\n• *सत्यापन:* नियोक्ता द्वारा सत्यापित (Verified)\n• *अगला चेक-इन:* 30-दिवस रिमाइंडर लंबित\n• *वेतन बैंड:* ₹ 22,000 - ₹ 28,000 / माह\n\n_पुष्टि करने के लिए '4' भेजें।_`,
    scorecard: `📊 *आपका डिजिटल कौशल स्कोरकार्ड (NCVT प्रमाणित)*\n\n• *G-Code CNC Programming:* 85% (Post-Training)\n• *Lathe Machine Calibration:* 70% (Post-Training)\n• *समग्र दक्षता ग्रेड:* NCVT Level 4 Certificate Approved!\n\n_पूर्ण स्कोरकार्ड पोर्टल पर उपलब्ध है।_`,
    recommendation: `💡 *शीर्ष 3 अनुशंसित कौशल (पुणे क्षेत्र में उच्च मांग)*\n\n1. *Lathe Machine Calibration:* पुणे में 88% नौकरियों में मांग, आपका स्कोर 65% है।\n2. *BMS Sensor Calibration:* पुणे में 75% नौकरियों में मांग, आपका स्कोर 55% है।\n3. *Grid Inverter Installation:* पुणे में 72% नौकरियों में मांग, आपका स्कोर 60% है।`,
    checkin_confirmed: `✅ *धन्यवाद! आपकी Day-30 रोजगार पुष्टि व्हाट्सएप द्वारा दर्ज कर ली गई है।*\n\nआपकी स्थिति: *Still Employed (Tata Advanced Engineering)*। राष्ट्रीय कौशल पोर्टल में आपका रिकॉर्ड अपडेट हो गया है।`
  },
  mr: {
    welcome: `🇮🇳 *राष्ट्रीय कौशल्य विकास पोर्टल - व्हॉट्सअॅप सेवा* 🇮🇳\n\nनमस्कार *[CANDIDATE_NAME]*! कृपया खालील पर्यायांपैकी एक निवडा:\n\n1️⃣ *नोकरी स्थिती आणि स्मरणपत्रे (Employment Status & Reminders)*\n2️⃣ *डिजिटल कौशल्य गुणपत्रिका (Digital Scorecard Summary)*\n3️⃣ *टॉप 3 कौशल्य शिफारसी (Top 3 Skill Recommendations)*\n4️⃣ *Day-30 नोकरी नोंदणी निश्चित करा (Submit Day 30 Check-in)*\n\n_उत्तर देण्यासाठी नंबर (1, 2, 3, किंवा 4) पाठवा._`,
    status: `💼 *नोकरी स्थिती आणि 30/90/180-दिवस चेक-इन*\n\n• *सध्याची स्थिती:* Tata Advanced Engineering मध्ये कार्यरत (Placed)\n• *पडताळणी:* कंपनीद्वारे प्रमाणित (Verified)\n• *पुढील चेक-इन:* 30-दिवसांचे स्मरणपत्र प्रलंबित\n• *वेतन श्रेणी:* ₹ 22,000 - ₹ 28,000 / महिना\n\n_निश्चित करण्यासाठी '4' पाठवा._`,
    scorecard: `📊 *तुमची डिजिटल कौशल्य गुणपत्रिका (NCVT प्रमाणित)*\n\n• *G-Code CNC Programming:* 85% (Post-Training)\n• *Lathe Machine Calibration:* 70% (Post-Training)\n• *एकूण श्रेणी:* NCVT Level 4 Certificate Approved!\n\n_पूर्ण गुणपत्रिका पोर्टलवर उपलब्ध आहे._`,
    recommendation: `💡 *शीर्ष 3 सुचवलेली कौशल्ये (पुणे विभागात जास्त मागणी)*\n\n1. *Lathe Machine Calibration:* पुण्यात 88% नोकऱ्यांमध्ये मागणी, तुमचे गुण 65% आहेत.\n2. *BMS Sensor Calibration:* पुण्यात 75% नोकऱ्यांमध्ये मागणी, तुमचे गुण 55% आहेत.\n3. *Grid Inverter Installation:* पुण्यात 72% नोकऱ्यांमध्ये मागणी, तुमचे गुण 60% आहेत.`,
    checkin_confirmed: `✅ *धन्यवाद! तुमची Day-30 नोकरी नोंदणी व्हॉट्सअॅपद्वारे यशस्वीरित्या पूर्ण झाली आहे.*\n\nतुमची स्थिती: *Still Employed (Tata Advanced Engineering)*. राष्ट्रीय पोर्टलवर तुमचा रेकॉर्ड अद्ययावत करण्यात आला आहे.`
  },
  en: {
    welcome: `🇮🇳 *CAREER BRIDGE - WHATSAPP BOT* 🇮🇳\n\nWelcome *[CANDIDATE_NAME]*! Please reply with an option number:\n\n1️⃣ *Employment Status & Check-In Reminders*\n2️⃣ *Digital Scorecard Summary*\n3️⃣ *Top 3 Skill Recommendations*\n4️⃣ *Submit Day-30 Employment Check-In*\n\n_Reply with 1, 2, 3, or 4._`,
    status: `💼 *Employment Status & 30/90/180-Day Check-Ins*\n\n• *Status:* Placed at Tata Advanced Engineering\n• *Verification:* Confirmed by Employer HR\n• *Next Prompt:* 30-Day Check-In Active\n• *Salary Band:* ₹ 22,000 - ₹ 28,000 / mo\n\n_Reply '4' to confirm continued placement._`,
    scorecard: `📊 *Your Digital Competency Scorecard*\n\n• *G-Code CNC Programming:* 85% (Post-Training)\n• *Lathe Machine Calibration:* 70% (Post-Training)\n• *Certification Status:* NCVT Level 4 Approved!`,
    recommendation: `💡 *Top 3 Recommended Skills (High Demand in Pune)*\n\n1. *Lathe Machine Calibration:* Appears in 88% of Pune job postings (Your score: 65%).\n2. *BMS Sensor Calibration:* Appears in 75% of Pune job postings (Your score: 55%).\n3. *Grid Inverter Installation:* Appears in 72% of Pune job postings (Your score: 60%).`,
    checkin_confirmed: `✅ *Thank you! Your Day-30 Employment Confirmation has been submitted via WhatsApp.*\n\nStatus: *Still Employed (Tata Advanced Engineering)*. Portal database updated.`
  }
};

/**
 * Chatbot Logic Handler
 */
export const processWhatsAppInput = ({ message, lang = 'hi', candidateName = 'Trainee' }) => {
  const cleanInput = (message || '').trim().toLowerCase();
  const langDict = MESSAGES[lang] || MESSAGES.hi;

  if (cleanInput === '1' || cleanInput.includes('status') || cleanInput.includes('स्थिति') || cleanInput.includes('स्थिती')) {
    return langDict.status;
  }
  if (cleanInput === '2' || cleanInput.includes('scorecard') || cleanInput.includes('स्कोरकार्ड') || cleanInput.includes('गुणपत्रिका')) {
    return langDict.scorecard;
  }
  if (cleanInput === '3' || cleanInput.includes('recommend') || cleanInput.includes('कौशल') || cleanInput.includes('कौशल्य')) {
    return langDict.recommendation;
  }
  if (cleanInput === '4' || cleanInput.includes('checkin') || cleanInput.includes('confirm')) {
    return langDict.checkin_confirmed;
  }

  // Default welcome menu with candidate's actual name
  return (langDict.welcome || '').replace('[CANDIDATE_NAME]', candidateName);
};

/**
 * Dispatch Outgoing WhatsApp Notification (Twilio Sandbox API / Mock fallback)
 */
export const sendWhatsAppNotification = async ({ toMobile, promptType = '30_day', lang = 'hi' }) => {
  const langDict = MESSAGES[lang] || MESSAGES.hi;
  const promptText = `🔔 *[REMINDER]* ${langDict.status}`;

  console.log(`[WHATSAPP DISPATCH] Sending WhatsApp ${promptType} reminder to ${toMobile} via Twilio Sandbox (${TWILIO_WHATSAPP_NUMBER})...`);

  // Mock return object for instant demo execution
  return {
    success: true,
    messageId: `WA-MSG-${Date.now()}`,
    to: toMobile,
    from: TWILIO_WHATSAPP_NUMBER,
    body: promptText,
    timestamp: new Date().toISOString()
  };
};
