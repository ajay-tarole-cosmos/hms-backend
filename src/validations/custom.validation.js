const { isUUID } = require('validator');

const objectId = (value, helpers) => {
  if (!isUUID(value)) {
    return helpers.message('"{{#label}}" must be a valid UUID');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(value)) {
    return helpers.message('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(value)) {
    return helpers.message('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(value)) {
    return helpers.message('Password must contain at least one digit');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return helpers.message('Password must contain at least one special character');
  }

  return value;
};

module.exports = {
  objectId,
  password,
};
