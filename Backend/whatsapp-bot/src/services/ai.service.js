const axios = require('axios');
// const { GEMINI_API_KEY, GEMINI_MODEL } = require('../config/env');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * Answers a free-form customer question, grounded strictly in the product data
 * that was retrieved for this turn (see product.service.searchProductsByKeyword).
 * Uses Google's Gemini API (generateContent). Returns { answer, needsHandoff }.
 */
const answerCustomerQuestion = async ({ question, contextProduct, matchedProducts = [], history = [] }) => {
  const productContext = matchedProducts.length
    ? matchedProducts
        .map(
          (p) =>
            `- ${p.itemName} (code: ${p.itemCode}) | Price: ₹${p.bestPrice} (MRP ₹${p.mrp}) | Weight: ${p.weight || 'N/A'} | Stock: ${p.stock} | Why buy: ${p.benefits || 'N/A'} | Description: ${p.description || 'N/A'}`
        )
        .join('\n')
    : 'No matching products found in the catalog for this question.';

  const currentProductLine = contextProduct
    ? `The customer was last viewing: ${contextProduct.itemName} (code: ${contextProduct.itemCode}).`
    : 'The customer has not selected a specific product yet.';

  const systemPrompt = `You are a helpful WhatsApp sales assistant for an online shop.
Rules:
- Only use the product data supplied below. Never invent price, stock, specs, or policies.
- If the answer isn't in the supplied data, say you don't know and offer to connect them with a team member.
- If the question is about an order status, complaint, refund, or anything you cannot resolve from product data, respond that you'll connect them to the team, and include the exact marker [HANDOFF] at the end of your reply.
- Keep replies short and WhatsApp-friendly (a few sentences, plain text, no markdown headers).

${currentProductLine}

Relevant product data:
${productContext}`;

  // Gemini's generateContent takes a flat list of turns with role "user" | "model"
  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: question }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const { data } = await axios.post(
    url,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.4,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      timeout: 15000,
    }
  );

  const candidate = data.candidates?.[0];
  const rawAnswer =
    candidate?.content?.parts?.map((p) => p.text).join('').trim() ||
    "Sorry, I couldn't process that. Let me connect you with our team.";

  const needsHandoff = rawAnswer.includes('[HANDOFF]');
  const answer = rawAnswer.replace('[HANDOFF]', '').trim();

  return { answer, needsHandoff };
};

module.exports = { answerCustomerQuestion };
