const { body } = require('express-validator');

const phoneField = body('to')
  .notEmpty()
  .withMessage('to (recipient phone number) is required')
  .matches(/^\d{10,15}$/)
  .withMessage('to must be digits only, in international format without "+" (e.g. 919876543210)');

const sendTextValidator = [
  phoneField,
  body('message').notEmpty().withMessage('message is required').isString(),
];

const sendImageValidator = [
  phoneField,
  body('imageUrl')
    .if((value, { req }) => !req.file)
    .notEmpty()
    .withMessage('imageUrl is required when no file is uploaded')
    .isURL()
    .withMessage('imageUrl must be a valid public URL'),
  body('caption').optional().isString(),
];

const sendListValidator = [
  phoneField,
  body('bodyText').notEmpty().withMessage('bodyText is required').isString(),
  body('header').optional().isString(),
  body('footerText').optional().isString(),
  body('buttonText').optional().isString(),
  body('sections')
    .isArray({ min: 1 })
    .withMessage('sections must be a non-empty array of { title, rows: [{ id, title, description }] }'),
  body('sections.*.rows').isArray({ min: 1 }).withMessage('each section needs a non-empty rows array'),
  body('sections.*.rows.*.id').notEmpty().withMessage('each row needs an id'),
  body('sections.*.rows.*.title').notEmpty().withMessage('each row needs a title'),
];

const sendButtonsValidator = [
  phoneField,
  body('bodyText').notEmpty().withMessage('bodyText is required').isString(),
  body('buttons')
    .isArray({ min: 1, max: 3 })
    .withMessage('buttons must be an array of 1-3 items ({ id, title })'),
  body('buttons.*.id').notEmpty().withMessage('each button needs an id'),
  body('buttons.*.title').notEmpty().withMessage('each button needs a title'),
];

const sendTemplateValidator = [
  phoneField,
  body('name').notEmpty().withMessage('template name is required'),
  body('languageCode').optional().isString(),
  body('components').optional().isArray(),
];

const markReadValidator = [
  body('messageId').notEmpty().withMessage('messageId is required'),
];

module.exports = {
  sendTextValidator,
  sendImageValidator,
  sendListValidator,
  sendButtonsValidator,
  sendTemplateValidator,
  markReadValidator,
};