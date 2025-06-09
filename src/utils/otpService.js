/**
 * Generate a 6-digit OTP
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculates the OTP expiry time (default: 10 minutes)
 * @param {number} minutes
 * @returns {Date}
 */
const getOtpExpiryTime = (minutes = 10) => {
  // return new Date(Date.now() + minutes * 60 * 1000);
 return new Date(Date.now() + minutes * 60 * 1000).toISOString();
};

const verifyOTP = (storedOtp, expiryTime, providedOtp) => {
  return new Date() <= expiryTime && storedOtp === providedOtp;
};

// /**
//  * Verify OTP (Checks if the OTP matches and hasn't expired)
//  * @param {string} storedOtp
//  * @param {Date} expiryTime
//  * @param {string} providedOtp
//  * @returns {boolean}
//  */
// const verifyOTP = (storedOtp, expiryTime, providedOtp) => {
//   if (new Date() > expiryTime) {
//     return false; 
//   }
//   return storedOtp === providedOtp;
// };
module.exports = {
  generateOTP,
  getOtpExpiryTime,
  verifyOTP,
};
