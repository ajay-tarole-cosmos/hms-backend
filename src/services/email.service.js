const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");

// Unified transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || config.email.smtp.host,
  port: process.env.SMTP_PORT || config.email.smtp.port || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || config.email.smtp.auth.user,
    pass: process.env.SMTP_PASS || config.email.smtp.auth.pass,
  },
});

/* istanbul ignore next */
if (config.env !== "test") {
  transporter
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn("Unable to connect to email server. Check SMTP config")
    );
}

// Generic send email
const sendEmail = async (to, subject, text) => {
  try {
    const msg = {
      from: process.env.SMTP_FROM || config.email.from,
      to,
      subject,
      text,
    };
    const info = await transporter.sendMail(msg);
    logger.info(`Email sent to: ${to}, Message ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw new Error("Email sending failed");
  }
};

// Send a templated email
const sendTemplatedEmail = async (to, subject, template, data) => {
  const text = template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || "");
  await sendEmail(to, subject, text);
};

// Send OTP Email
const sendOtpEmail = async (to, otp) => {
  const subject = "Your OTP Code";
  const template = `Dear user,\n\nYour OTP code is: {{otp}}\n\nThe OTP is valid for 10 minutes.`;
  await sendTemplatedEmail(to, subject, template, { otp });
  logger.info(`OTP sent to: ${to}`);
};

// Send reset password email
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Reset Password";
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `To reset your password, click on this link: ${resetPasswordUrl}`;
  await sendEmail(to, subject, text);
};

// Send verification email
const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";
  const verificationUrl = `http://link-to-app/verify-otp?token=${token}`;
  const text = `To verify your email, click on this link: ${verificationUrl}`;
  await sendEmail(to, subject, text);
};

// Send invoice email with attachment
const sendInvoiceEmail = async (invoice, pdfPath,email_address) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@hotel.com",
      to: email_address || invoice.guest.email,
      subject: `Invoice ${invoice.invoice_number} - Hotel Booking`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Invoice for Your Stay</h2>
          <p>Dear ${invoice.guest.first_name} ${invoice.guest.last_name},</p>
          <p>Thank you for staying with us. Please find attached your invoice.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h3>Booking Details:</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Total Amount:</strong> ₹${Number.parseFloat(invoice.total_amount).toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
            ${
              invoice.reservation
                ? `
              <p><strong>Room:</strong> ${invoice.reservation.room_number?.room_number || "N/A"}</p>
              <p><strong>Check-in:</strong> ${new Date(invoice.reservation.check_in_date_time).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(invoice.reservation.check_out_date_time).toLocaleDateString()}</p>
              `
                : ""
            }
          </div>
          <p>Contact us for any queries.</p>
          <p>Regards,<br/>Hotel Management Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoice_number}.pdf`,
          path: pdfPath,
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Invoice email sent to ${invoice.guest.email}`);
    return result;
  } catch (error) {
    logger.error("Error sending invoice email:", error);
    throw error;
  }
};

// Send payment receipt email with attachment
const sendReceiptEmail = async (payment, pdfPath) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@hotel.com",
      to: payment.invoice.guest.email,
      subject: `Payment Receipt - ${payment.reference_number || payment.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Payment Receipt</h2>
          <p>Dear ${payment.invoice.guest.first_name} ${payment.invoice.guest.last_name},</p>
          <p>Thank you for your payment. Please find your receipt attached.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h3>Payment Details:</h3>
            <p><strong>Amount Paid:</strong> ₹${Number.parseFloat(payment.amount).toFixed(2)}</p>
            <p><strong>Method:</strong> ${payment.payment_method.replace("_", " ").toUpperCase()}</p>
            <p><strong>Date:</strong> ${new Date(payment.payment_date).toLocaleDateString()}</p>
            <p><strong>Reference:</strong> ${payment.reference_number || payment.id}</p>
          </div>
          <p>Regards,<br/>Hotel Management Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `receipt-${payment.reference_number || payment.id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Receipt email sent to ${payment.invoice.guest.email}`);
    return result;
  } catch (error) {
    logger.error("Error sending receipt email:", error);
    throw error;
  }
};


const sendReservationConfirmationEmail = async (guest, reservation) => {
  console.log("email,reservation",guest, reservation)
  console.log("booking email hit")
  console.log(" guest.email", guest.email)
  const subject = "Your Room Reservation is Confirmed!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Reservation Confirmation</h2>
      <p>Dear ${guest.first_name} ${guest.last_name},</p>
      <p>Your reservation has been successfully confirmed at our hotel.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <h3>Reservation Details:</h3>
        <p><strong>Booking ID:</strong> ${reservation.booking_id}</p>
        <p><strong>Check-in:</strong> ${new Date(reservation.check_in_date_time).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(reservation.check_out_date_time).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹${Number(reservation.total_amount).toFixed(2)}</p>
      </div>
      <p>We look forward to hosting you. If you have any questions, feel free to contact us.</p>
      <p>Warm regards,<br/>Hotel Management Team</p>
    </div>
  `;

  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@hotel.com",
      to: guest.email,
      subject,
      html,
    });
    logger.info(`Reservation confirmation email sent to ${guest.email}`);
    return result;
  } catch (error) {
    logger.error("Error sending reservation confirmation email:", error);
    throw error;
  }
};

const sendRoomReassignmentMail = async (email, guestName, oldRooms, newRooms) => {
  const mailOptions = {
    from: `"Hotel Booking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Room Reassignment Notice`,
    html: `
      <h2>Room Reassignment</h2>
      <p>Dear ${guestName || "Guest"},</p>
      <p>We would like to inform you that your room(s) have been reassigned due to the following reason:</p>
      <p><strong>Reason:</strong> ${change_reason}</p>
      <p><strong>Old Room(s):</strong> ${oldRooms.join(', ')}</p>
      <p><strong>New Room(s):</strong> ${newRooms.join(', ')}</p>
      <br/>
      <p>If you have any concerns, please contact our front desk.</p>
      <p>Thank you for your understanding.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  sendEmail,
  sendTemplatedEmail,
  sendOtpEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendInvoiceEmail,
  sendReceiptEmail,
  sendReservationConfirmationEmail,
  sendRoomReassignmentMail,
};
