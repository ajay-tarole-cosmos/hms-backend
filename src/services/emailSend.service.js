const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");

const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn("Unable to connect to email server. Check SMTP config")
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, text) => {
  try {
    const msg = { from: config.email.from, to, subject, text };
    const info = await transport.sendMail(msg);
    logger.info(`Email sent to: ${to}, Message ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw new Error("Email sending failed");
  }
};

/**
 * Send a templated email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} template - email body with placeholders
 * @param {object} data - placeholder values (e.g., { otp: "123456" })
 */
const sendTemplatedEmail = async (to, subject, template, data) => {
  // Replace placeholders with actual values
  const text = template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || "");

  await sendEmail(to, subject, text);
};


/**
 * Send OTP email
 * @param {string} to - recipient email
 * @param {string} otp - the generated OTP
 * @returns {Promise}
 */
const sendOtpEmail = async (to, otp) => {
  const subject = "Your OTP Code";
  const template = `Dear user,\n\nYour OTP code is: ${otp}\n\nThe OTP is valid for 10 minutes.`;

  await sendTemplatedEmail(to, subject, template, { otp });
  logger.info(`OTP sent to: ${to}`);
};


/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Reset Password";
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `To reset your password, click on this link: ${resetPasswordUrl}`;

  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";
  const verificationEmailUrl = `http://link-to-app/verify-otp?token=${token}`;
  const text = `To verify your email, click on this link: ${verificationEmailUrl}`;

  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendOtpEmail, // Added OTP sending function
  sendResetPasswordEmail,
  sendVerificationEmail,
};

