import express from 'express';
import { processWhatsAppInput, sendWhatsAppNotification } from '../services/whatsappService.js';

const router = express.Router();

/**
 * POST /api/whatsapp/webhook
 * Handles incoming WhatsApp webhook message payload
 */
router.post('/webhook', (req, res) => {
  const { Body, message, lang, candidateName } = req.body;
  const userText = Body || message || 'menu';
  const selectedLang = lang || 'hi';
  const name = candidateName || 'Trainee';

  const replyText = processWhatsAppInput({ message: userText, lang: selectedLang, candidateName: name });

  res.json({
    success: true,
    userText,
    lang: selectedLang,
    reply: replyText
  });
});

/**
 * POST /api/whatsapp/send-prompt
 * Triggers outgoing WhatsApp check-in reminder
 */
router.post('/send-prompt', async (req, res) => {
  const { mobile, promptType, lang } = req.body;
  const targetMobile = mobile || '+91 98765 43210';
  const targetLang = lang || 'hi';

  const result = await sendWhatsAppNotification({
    toMobile: targetMobile,
    promptType: promptType || '30_day',
    lang: targetLang
  });

  res.json({
    success: true,
    message: `WhatsApp check-in prompt triggered to ${targetMobile}!`,
    details: result
  });
});

export default router;
