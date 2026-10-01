// const axios = require('axios');
// const {
//   WHATSAPP_PHONE_NUMBER_ID,
//   WHATSAPP_ACCESS_TOKEN,
//   WHATSAPP_API_VERSION,
// } = require('../config/env');

// const client = axios.create({
//   baseURL: `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}`,
//   headers: {
//     Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000,
// });

// /** Sends a plain text message. */
// const sendTextMessage = async (to, body) => {
//   const { data } = await client.post('/messages', {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'text',
//     text: { body },
//   });
//   return data;
// };

// /** Sends an image by public URL, with an optional caption. */
// const sendImageMessage = async (to, imageUrl, caption = '') => {
//   const { data } = await client.post('/messages', {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'image',
//     image: { link: imageUrl, caption },
//   });
//   return data;
// };

// /**
//  * Sends an Interactive List message. WhatsApp allows up to 10 rows per section
//  * and 100 rows total, so callers should paginate/chunk larger catalogs.
//  * products: [{ _id, itemName, bestPrice }]
//  */
// const sendProductListMessage = async (to, products, { header = 'Our Products', bodyText = 'Browse our catalog and tap an item to see details.' } = {}) => {
//   const rows = products.slice(0, 10).map((p) => ({
//     id: `product_${p._id}`,
//     title: p.itemName.slice(0, 24), // WhatsApp row title limit
//     description: `₹${p.bestPrice}`,
//   }));

//   const { data } = await client.post('/messages', {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'interactive',
//     interactive: {
//       type: 'list',
//       header: { type: 'text', text: header },
//       body: { text: bodyText },
//       footer: { text: 'Tap "View Products" to browse' },
//       action: {
//         button: 'View Products',
//         sections: [{ title: 'Available Items', rows }],
//       },
//     },
//   });
//   return data;
// };

// /** Sends up to 3 quick-reply buttons. */
// const sendReplyButtons = async (to, bodyText, buttons) => {
//   const { data } = await client.post('/messages', {
//     messaging_product: 'whatsapp',
//     to,
//     type: 'interactive',
//     interactive: {
//       type: 'button',
//       body: { text: bodyText },
//       action: {
//         buttons: buttons.slice(0, 3).map((b) => ({
//           type: 'reply',
//           reply: { id: b.id, title: b.title.slice(0, 20) },
//         })),
//       },
//     },
//   });
//   return data;
// };

// /** Marks an inbound message as read (blue ticks) — optional polish. */
// const markAsRead = async (messageId) => {
//   await client.post('/messages', {
//     messaging_product: 'whatsapp',
//     status: 'read',
//     message_id: messageId,
//   });
// };

// module.exports = {
//   sendTextMessage,
//   sendImageMessage,
//   sendProductListMessage,
//   sendReplyButtons,
//   markAsRead,
// };

const axios = require('axios');
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION;

const client = axios.create({
  baseURL: `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/** Sends a plain text message. */
const sendTextMessage = async (to, body) => {
  const { data } = await client.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  });
  return data;
};

/** Sends an image by public URL, with an optional caption. */
const sendImageMessage = async (to, imageUrl, caption = '') => {
  const { data } = await client.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: { link: imageUrl, caption },
  });
  return data;
};

/**
 * Sends a generic Interactive List message. WhatsApp allows up to 10 rows per section
 * and 100 rows total, so callers should paginate/chunk larger data sets.
 * sections: [{ title, rows: [{ id, title, description }] }]
 */
const sendListMessage = async (to, { header, bodyText, footerText, buttonText = 'View Options', sections }) => {
  const { data } = await client.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      ...(header ? { header: { type: 'text', text: header } } : {}),
      body: { text: bodyText },
      ...(footerText ? { footer: { text: footerText } } : {}),
      action: { button: buttonText, sections },
    },
  });
  return data;
};

/**
 * Sends an Interactive List message. WhatsApp allows up to 10 rows per section
 * and 100 rows total, so callers should paginate/chunk larger catalogs.
 * products: [{ _id, itemName, bestPrice }]
 */
const sendProductListMessage = async (to, products, { header = 'Our Products', bodyText = 'Browse our catalog and tap an item to see details.' } = {}) => {
  const rows = products.slice(0, 10).map((p) => ({
    id: `product_${p._id}`,
    title: p.itemName.slice(0, 24), // WhatsApp row title limit
    description: `₹${p.bestPrice}`,
  }));

  return sendListMessage(to, {
    header,
    bodyText,
    footerText: 'Tap "View Products" to browse',
    buttonText: 'View Products',
    sections: [{ title: 'Available Items', rows }],
  });
};

/** Sends up to 3 quick-reply buttons. */
const sendReplyButtons = async (to, bodyText, buttons) => {
  const { data } = await client.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  });
  return data;
};

/** Sends a pre-approved Template message (required for the first contact / 24h+ window). */
const sendTemplateMessage = async (to, { name, languageCode = 'en_US', components = [] }) => {
  const { data } = await client.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name,
      language: { code: languageCode },
      ...(components.length ? { components } : {}),
    },
  });
  return data;
};

/** Marks an inbound message as read (blue ticks) — optional polish. */
const markAsRead = async (messageId) => {
  const { data } = await client.post('/messages', {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  });
  return data;
};

module.exports = {
  sendTextMessage,
  sendImageMessage,
  sendListMessage,
  sendProductListMessage,
  sendReplyButtons,
  sendTemplateMessage,
  markAsRead,
};