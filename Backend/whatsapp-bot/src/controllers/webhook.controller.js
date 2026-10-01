// const asyncHandler = require('../utils/asyncHandler');
// const ApiResponse = require('../utils/apiResponse');

// // GET /webhook - For WhatsApp webhook verification
// const verifyWebhook = asyncHandler(async (req, res) => {
//   const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  
//   // Your verify token (set this in your environment variables)
//   const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || 'my_secure_verify_token';
  
//   if (mode === 'subscribe' && token === verifyToken) {
//     console.log('Webhook verified successfully!');
//     res.status(200).send(challenge);
//   } else {
//     res.status(403).json(new ApiResponse(403, null, 'Verification failed'));
//   }
// });

// // POST /webhook - For receiving webhook events
// const handleWebhook = asyncHandler(async (req, res) => {
//   console.log('Webhook received:', req.body);
  
//   // Process the webhook data here
//   // For WhatsApp, you'll handle messages here
  
//   // Always respond with 200 OK to acknowledge receipt
//   res.status(200).json(new ApiResponse(200, { received: true }, 'Webhook received successfully'));
// });

// module.exports = {
//   verifyWebhook,
//   handleWebhook
// };

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const axios = require('axios');

// GET /webhook - For WhatsApp webhook verification
const verifyWebhook = asyncHandler(async (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'softcrowd123';
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).json(new ApiResponse(403, null, 'Verification failed'));
  }
});

// POST /webhook - For receiving webhook events
const handleWebhook = asyncHandler(async (req, res) => {
  console.log('📨 Webhook received at:', new Date().toISOString());
  
  const { body } = req;
  
  // Check if it's a WhatsApp webhook
  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          const value = change.value;
          
          // Check if there are messages
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              // Get customer's mobile number (this is the key part!)
              const customerNumber = message.from;
              const customerName = message.contact?.profile?.name || 'Customer';
              
              console.log(`📱 Message from ${customerName} (${customerNumber}):`, message);
              console.log(`📝 Message type: ${message.type}`);
              
              if (message.type === 'text') {
                console.log(`💬 Text: ${message.text.body}`);
              }
              
              // Process the incoming message
              await processIncomingMessage(message, customerNumber, customerName);
            }
          }
        }
      }
    }
  }
  
  // Always respond with 200 OK
  res.status(200).json(new ApiResponse(200, { received: true }, 'Webhook received successfully'));
});

// Process incoming messages
const processIncomingMessage = async (message, customerNumber, customerName) => {
  try {
    // Handle different message types
    if (message.type === 'text') {
      const userMessage = message.text.body.trim();
      
      // Auto-reply based on message
      const reply = await getAutoReply(userMessage, customerName, customerNumber);
      await sendWhatsAppMessage(customerNumber, reply);
      
    } else if (message.type === 'interactive') {
      const buttonReply = message.interactive?.button_reply?.title || 
                         message.interactive?.list_reply?.title ||
                         'selected an option';
      await sendWhatsAppMessage(customerNumber, `You selected: ${buttonReply}`);
      
    } else if (message.type === 'image' || message.type === 'document' || message.type === 'audio') {
      await sendWhatsAppMessage(customerNumber, `Thank you for sending the ${message.type}! We'll review it.`);
      
    } else {
      await sendWhatsAppMessage(customerNumber, 'Thank you for your message! How can we help you today?');
    }
    
  } catch (error) {
    console.error('❌ Error processing message:', error);
  }
};

// Get auto-reply based on message content
const getAutoReply = async (message, customerName, customerNumber) => {
  const msg = message.toLowerCase().trim();
  
  // Store customer number in database (you can implement this)
  console.log(`💾 Customer ${customerNumber} (${customerName}) sent: ${message}`);
  
  // Welcome/Hello messages
  if (msg.match(/^(hi|hello|hey|hola|namaste|good morning|good afternoon|good evening)/)) {
    return `👋 Hello ${customerName}! Welcome to our WhatsApp store.\n\nHow can I help you today?`;
  }
  
  // Product inquiries
  if (msg.includes('product') || msg.includes('item') || msg.includes('catalog') || msg.includes('catalogue')) {
    return `🛍️ Here's our product catalog:\n\n1. iPhone 15 Pro - ₹99,999\n2. Samsung S24 - ₹89,999\n3. OnePlus 12 - ₹79,999\n4. Google Pixel 8 - ₹74,999\n\nReply with product name to know more!`;
  }
  
  // Price inquiries
  if (msg.includes('price') || msg.includes('cost') || msg.includes('rate') || msg.includes('₹') || msg.includes('rs')) {
    return `💰 Our best prices:\n\niPhone 15 Pro: ₹99,999\nSamsung S24: ₹89,999\nOnePlus 12: ₹79,999\nGoogle Pixel 8: ₹74,999\n\nAsk about any specific product!`;
  }
  
  // Order inquiries
  if (msg.includes('order') || msg.includes('buy') || msg.includes('purchase') || msg.includes('cart')) {
    return `📦 To place an order:\n1. Send product name\n2. Send quantity\n3. Confirm your address\n\nWe'll confirm availability and total price!`;
  }
  
  // Help/Support
  if (msg.includes('help') || msg.includes('support') || msg.includes('assist') || msg.includes('?') || msg.includes('how')) {
    return `🆘 I can help you with:\n\n• Browse products\n• Check prices\n• Place orders\n• Track orders\n• Get support\n\nJust type what you need!`;
  }
  
  // Store hours
  if (msg.includes('time') || msg.includes('hour') || msg.includes('open') || msg.includes('close')) {
    return `🕐 Store Hours:\n\nMonday-Friday: 9:00 AM - 9:00 PM\nSaturday: 10:00 AM - 8:00 PM\nSunday: 10:00 AM - 6:00 PM`;
  }
  
  // Default response
  return `Thanks for your message ${customerName}! 😊\n\nI'll help you with your query. Please be more specific or ask about:\n\n• Products\n• Prices\n• Orders\n• Store hours\n• Support`;
};

// Send WhatsApp message using Meta Cloud API
const sendWhatsAppMessage = async (toNumber, message) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toNumber,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };
    
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Message sent to ${toNumber}: ${message.substring(0, 30)}...`);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
};

// Send interactive buttons
const sendInteractiveButtons = async (toNumber, header, body, buttons) => {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    
    const data = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: header
        },
        body: {
          text: body
        },
        action: {
          buttons: buttons.map((btn, index) => ({
            type: 'reply',
            reply: {
              id: `btn_${index + 1}`,
              title: btn
            }
          }))
        }
      }
    };
    
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Interactive buttons sent to ${toNumber}`);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error sending interactive buttons:', error.response?.data || error.message);
    throw error;
  }
};

// Send a test message (for testing purposes)
const sendTestMessage = asyncHandler(async (req, res) => {
  const { to, message } = req.body;
  
  if (!to || !message) {
    return res.status(400).json(new ApiResponse(400, null, 'Missing to or message'));
  }
  
  const result = await sendWhatsAppMessage(to, message);
  res.status(200).json(new ApiResponse(200, result, 'Message sent successfully'));
});

// Get customer info from webhook
const getCustomerInfo = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.params;
  // You can implement database lookup here
  res.status(200).json(new ApiResponse(200, { 
    phoneNumber, 
    message: 'Customer info retrieved' 
  }, 'Success'));
});

module.exports = {
  verifyWebhook,
  handleWebhook,
  sendWhatsAppMessage,
  sendInteractiveButtons,
  sendTestMessage,
  getCustomerInfo,
  processIncomingMessage
};