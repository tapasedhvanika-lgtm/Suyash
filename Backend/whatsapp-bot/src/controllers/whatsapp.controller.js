

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const BASE_URL = process.env.BASE_URL;
const Session = require('../models/Session');
const MessageLog = require('../models/MessageLog');
const productService = require('../services/product.service');
const whatsappService = require('../services/whatsapp.service');
const aiService = require('../services/ai.service');

// GET /api/whatsapp/webhook - Meta's one-time subscription verification
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

const GREETINGS = ['hi', 'hello', 'hey', 'menu', 'start', 'hii', 'helo'];

const QUOTATION_KEYWORDS = [
  'quotation', 'quotaion', 'quatation', 'qutation', 'quote',
  'estimate', 'best price', 'bulk price', 'wholesale price',
  'rate list', 'price list',
];

const PRODUCT_KEYWORDS = [
  'product', 'item', 'catalog', 'catalogue', 'stock', 'available',
  'do you have', 'looking for', 'specs', 'specification', 'details',
];

const isQuotationRequest = (text) => {
  const lower = text.toLowerCase();
  return QUOTATION_KEYWORDS.some((kw) => lower.includes(kw));
};

const isProductQuery = (text) => {
  const lower = text.toLowerCase();
  return PRODUCT_KEYWORDS.some((kw) => lower.includes(kw));
};

/** Converts a raw axios/Meta Graph API error into a clean ApiError with Meta's real message. */
const wrapMetaError = (err) => {
  const metaMessage = err.response?.data?.error?.message;
  const metaCode = err.response?.data?.error?.code;
  if (metaMessage) {
    return new ApiError(err.response.status || 502, `WhatsApp API error${metaCode ? ` (code ${metaCode})` : ''}: ${metaMessage}`);
  }
  if (err.code === 'ECONNABORTED') {
    return new ApiError(504, 'WhatsApp API request timed out');
  }
  return new ApiError(502, err.message || 'Failed to reach WhatsApp API');
};

const getOrCreateSession = async (phoneNumber) => {
  let session = await Session.findOne({ phoneNumber });
  if (!session) {
    session = await Session.create({ phoneNumber, state: 'GREETED' });
  }
  return session;
};

const logMessage = (phoneNumber, direction, body, messageType, raw = null) =>
  MessageLog.create({ phoneNumber, direction, body, messageType, raw });

/** Builds a full public image URL from a stored relative path. */
const toFullImageUrl = (imagePath) =>
  imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;

/** Handles the greeting: shows the active product catalog as an interactive list. */
const handleGreeting = async (phoneNumber, session) => {
  const products = await productService.getActiveProducts();

  if (products.length === 0) {
    await whatsappService.sendTextMessage(phoneNumber, "Hi! We're setting up our catalog right now, please check back soon.");
    return;
  }

  await whatsappService.sendTextMessage(phoneNumber, `Hi! 👋 Welcome to our shop. Here's what we have:`);
  await whatsappService.sendProductListMessage(phoneNumber, products);

  session.state = 'BROWSING';
  await session.save();
};

/** Handles a tap on a product row from the interactive list, OR a direct single-match lookup. */
const handleProductSelection = async (phoneNumber, session, productId) => {
  const product = await productService.getProductById(productId);

  const detailText =
    `*${product.itemName}*\n` +
    `Code: ${product.itemCode}\n` +
    `Price: ₹${product.bestPrice} (MRP ₹${product.mrp})\n` +
    (product.weight ? `Weight: ${product.weight}\n` : '') +
    (product.description ? `\n${product.description}\n` : '') +
    (product.benefits ? `\n_Why buy from us:_ ${product.benefits}\n` : '') +
    `\nStock: ${product.stock > 0 ? 'In stock' : 'Out of stock'}`;

  if (product.image) {
    await whatsappService.sendImageMessage(phoneNumber, toFullImageUrl(product.image), detailText);
  } else {
    await whatsappService.sendTextMessage(phoneNumber, detailText);
  }

  await whatsappService.sendReplyButtons(phoneNumber, 'Anything else I can help with?', [
    { id: 'view_menu', title: 'View Menu' },
    { id: 'ask_question', title: 'Ask a Question' },
  ]);

  session.lastProductId = product._id;
  session.state = 'VIEWING_PRODUCT';
  await session.save();
};

/** Handles a message asking for pricing/quotation — pulls real prices, never AI-guessed. */
const handleQuotationRequest = async (phoneNumber, session, text) => {
  const matchedProducts = await productService.searchProductsByKeyword(text, 10);
  const contextProduct = session.lastProductId
    ? await productService.getProductById(session.lastProductId).catch(() => null)
    : null;

  const productsToQuote = matchedProducts.length
    ? matchedProducts
    : contextProduct
    ? [contextProduct]
    : [];

  if (productsToQuote.length === 0) {
    await whatsappService.sendTextMessage(
      phoneNumber,
      "Sure! Which product(s) would you like a quotation for? Type the product name, or type 'menu' to browse our catalog."
    );
    session.state = 'AWAITING_QUOTE_ITEM';
    await session.save();
    return;
  }

  const lines = productsToQuote.map(
    (p) =>
      `• *${p.itemName}* (${p.itemCode}) — ₹${p.bestPrice}` +
      (p.mrp && p.mrp !== p.bestPrice ? ` _(MRP ₹${p.mrp})_` : '')
  );

  const quoteText =
    `📋 *Quotation*\n\n${lines.join('\n')}\n\n` +
    `Prices are per unit, exclusive of shipping. Let us know the quantity you need and we'll confirm the final total.`;

  await whatsappService.sendTextMessage(phoneNumber, quoteText);

  await whatsappService.sendReplyButtons(phoneNumber, 'Would you like to proceed?', [
    { id: 'confirm_order', title: 'Place Order' },
    { id: 'talk_to_team', title: 'Talk to Team' },
  ]);

  session.state = 'QUOTED';
  session.lastQuotedProducts = productsToQuote.map((p) => p._id);
  await session.save();
};

/** Handles a general product-related message with an interactive card/list. */
const handleProductQuery = async (phoneNumber, session, text) => {
  const matches = await productService.searchProductsByKeyword(text, 10);

  if (matches.length === 0) {
    await handleFreeFormQuestion(phoneNumber, session, text);
    return;
  }

  if (matches.length === 1) {
    await handleProductSelection(phoneNumber, session, matches[0]._id);
    return;
  }

  const rows = matches.slice(0, 10).map((p) => ({
    id: `product_${p._id}`,
    title: p.itemName.slice(0, 24),
    description: `₹${p.bestPrice}`,
  }));

  await whatsappService.sendListMessage(phoneNumber, {
    header: 'Matching Products',
    bodyText: `I found ${matches.length} products matching "${text}". Tap one to see details:`,
    footerText: 'Tap "View Options" to browse',
    buttonText: 'View Options',
    sections: [{ title: 'Results', rows }],
  });

  session.state = 'BROWSING';
  await session.save();
};

/** Handles a free-form text question via the AI layer, grounded in retrieved product data. */
const handleFreeFormQuestion = async (phoneNumber, session, question) => {
  const matchedProducts = await productService.searchProductsByKeyword(question);
  const contextProduct = session.lastProductId
    ? await productService.getProductById(session.lastProductId).catch(() => null)
    : null;

  const recentHistory = session.history.slice(-6).map((h) => ({ role: h.role, content: h.content }));

  const { answer, needsHandoff } = await aiService.answerCustomerQuestion({
    question,
    contextProduct,
    matchedProducts,
    history: recentHistory,
  });

  await whatsappService.sendTextMessage(phoneNumber, answer);

  if (needsHandoff) {
    session.state = 'HANDOFF';
    await whatsappService.sendTextMessage(
      phoneNumber,
      "I've flagged this for our team and someone will follow up with you shortly."
    );
  } else {
    session.state = 'AI_QNA';
  }

  session.history.push({ role: 'user', content: question });
  session.history.push({ role: 'assistant', content: answer });
  if (session.history.length > 20) session.history = session.history.slice(-20);

  await session.save();
};

/**
 * POST /api/whatsapp/webhook
 * Meta expects a fast 200 response. We acknowledge immediately, then process.
 */
const receiveWebhook = asyncHandler(async (req, res) => {
  res.sendStatus(200); // ack immediately per Meta's webhook reliability requirement

  const entry = req.body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  console.log('[DEBUG] Incoming payload message:', JSON.stringify(message));

  if (!message) {
    console.log('[DEBUG] No message field found (likely a status/read-receipt callback) — ignoring.');
    return;
  }

  const phoneNumber = message.from;

  try {
    const session = await getOrCreateSession(phoneNumber);

    if (message.type === 'interactive' && message.interactive?.list_reply) {
      const replyId = message.interactive.list_reply.id;
      await logMessage(phoneNumber, 'inbound', replyId, 'interactive_list_reply', message);

      if (replyId.startsWith('product_')) {
        const productId = replyId.replace('product_', '');
        await handleProductSelection(phoneNumber, session, productId);
      }
      return;
    }

  if (message.type === 'interactive' && message.interactive?.button_reply) {
      const buttonId = message.interactive.button_reply.id;
      await logMessage(phoneNumber, 'inbound', buttonId, 'interactive_button_reply', message);

      if (buttonId === 'view_menu') {
        await handleGreeting(phoneNumber, session);
      } else if (buttonId === 'ask_question') {
        await whatsappService.sendTextMessage(phoneNumber, 'Sure — go ahead and type your question!');
        session.state = 'AI_QNA';
        await session.save();
      } else if (buttonId === 'confirm_order') {           // ← replace from here
        console.log('[DEBUG] confirm_order tapped by', phoneNumber);
        await whatsappService.sendTextMessage(
          phoneNumber,
          "Great! Please share the quantity you'd like for each item and your delivery address, and we'll confirm availability and final pricing."
        );
        console.log('[DEBUG] confirm_order reply sent successfully');
        session.state = 'ORDERING';
        await session.save();
      } else if (buttonId === 'talk_to_team') {
        console.log('[DEBUG] talk_to_team tapped by', phoneNumber);
        await whatsappService.sendTextMessage(
          phoneNumber,
          "Got it! I've notified our team and they'll reach out shortly with a formal quotation."
        );
        console.log('[DEBUG] talk_to_team reply sent successfully');
        session.state = 'HANDOFF';
        await session.save();
      }                                                     // ← to here
      return;
    }

    if (message.type === 'text') {
      const text = (message.text?.body || '').trim();
      await logMessage(phoneNumber, 'inbound', text, 'text', message);

      const isGreeting = GREETINGS.includes(text.toLowerCase());
      if (isGreeting) {
        await handleGreeting(phoneNumber, session);
      } else if (isQuotationRequest(text)) {
        await handleQuotationRequest(phoneNumber, session, text);
      } else if (isProductQuery(text)) {
        await handleProductQuery(phoneNumber, session, text);
      } else {
        await handleFreeFormQuestion(phoneNumber, session, text);
      }
      return;
    }

    await whatsappService.sendTextMessage(
      phoneNumber,
      "Sorry, I can only handle text and menu selections right now. Type 'hi' to see our products."
    );
  } catch (err) {
    console.error('[whatsapp.controller] Error processing message:', err);
    await whatsappService
      .sendTextMessage(phoneNumber, 'Sorry, something went wrong on our end. Please try again in a moment.')
      .catch((sendErr) => {
        console.error('[whatsapp.controller] Also failed to send the error reply:', sendErr.response?.data || sendErr.message);
      });
  }
});

// --- Admin / test-only outbound endpoints (unchanged) ---

const sendText = asyncHandler(async (req, res) => {
  const { to, message } = req.body;
  try {
    const result = await whatsappService.sendTextMessage(to, message);
    await MessageLog.create({ phoneNumber: to, direction: 'outbound', body: message, messageType: 'text', raw: result });
    res.status(200).json(new ApiResponse(200, result, 'Text message sent'));
  } catch (err) {
    throw wrapMetaError(err);
  }
});

const sendImage = asyncHandler(async (req, res) => {
  const { to, caption = '' } = req.body;
  const imageUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : req.body.imageUrl;

  try {
    const result = await whatsappService.sendImageMessage(to, imageUrl, caption);
    await MessageLog.create({ phoneNumber: to, direction: 'outbound', body: caption, messageType: 'image', raw: { imageUrl, result } });
    res.status(200).json(new ApiResponse(200, result, 'Image message sent'));
  } catch (err) {
    throw wrapMetaError(err);
  }
});

const sendList = asyncHandler(async (req, res) => {
  const { to, header, bodyText, footerText, buttonText, sections } = req.body;
  try {
    const result = await whatsappService.sendListMessage(to, { header, bodyText, footerText, buttonText, sections });
    await MessageLog.create({ phoneNumber: to, direction: 'outbound', body: bodyText, messageType: 'interactive_list', raw: result });
    res.status(200).json(new ApiResponse(200, result, 'Interactive list sent'));
  } catch (err) {
    throw wrapMetaError(err);
  }
});

const sendButtons = asyncHandler(async (req, res) => {
  const { to, bodyText, buttons } = req.body;
  try {
    const result = await whatsappService.sendReplyButtons(to, bodyText, buttons);
    await MessageLog.create({ phoneNumber: to, direction: 'outbound', body: bodyText, messageType: 'interactive_buttons', raw: result });
    res.status(200).json(new ApiResponse(200, result, 'Reply buttons sent'));
  } catch (err) {
    throw wrapMetaError(err);
  }
});

const sendTemplate = asyncHandler(async (req, res) => {
  const { to, name, languageCode, components } = req.body;
  try {
    const result = await whatsappService.sendTemplateMessage(to, { name, languageCode, components });
    await MessageLog.create({ phoneNumber: to, direction: 'outbound', body: name, messageType: 'template', raw: result });
    res.status(200).json(new ApiResponse(200, result, 'Template message sent'));
  } catch (err) {
    throw wrapMetaError(err);
  }
});

const markRead = asyncHandler(async (req, res) => {
  const { messageId } = req.body;
  try {
    const result = await whatsappService.markAsRead(messageId);
    res.status(200).json(new ApiResponse(200, result, 'Message marked as read'));
  } catch (err) {
    throw wrapMetaError(err);
  }
});

module.exports = {
  verifyWebhook,
  receiveWebhook,
  sendText,
  sendImage,
  sendList,
  sendButtons,
  sendTemplate,
  markRead,
};