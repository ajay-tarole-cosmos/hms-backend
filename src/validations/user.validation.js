const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const CreateGuest = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().trim().required().pattern(/^[+]*[0-9]{1,4}[-\s]?[0-9]{1,14}$/),
  country_code: Joi.string().trim().required(),

  fatherName: Joi.string().allow('', null),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow('', null),
  occupation: Joi.string().allow('', null),
  date_of_birth: Joi.date().iso().allow('', null),
  nationality: Joi.string().allow('', null),

  state: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  zip_code: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  comment: Joi.string().allow('', null),
  document_type: Joi.string().valid('aadhaar', 'passport', 'pan', 'license', 'other').required(),

  guest_vip: Joi.boolean().default(false),
});

const UpdateGuest = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().trim().required().pattern(/^[+]*[0-9]{1,4}[-\s]?[0-9]{1,14}$/),
  country_code: Joi.string().trim().required(),
  fatherName: Joi.string().allow('', null),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow('', null),
  occupation: Joi.string().allow('', null),
  date_of_birth: Joi.date().iso().allow('', null),
  nationality: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  zip_code: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
  comment: Joi.string().allow('', null),
  document_type: Joi.string().valid('aadhaar', 'passport', 'license').required(),

  guest_vip: Joi.boolean().default(false),
});


// const getUsers = {
//   query: Joi.object().keys({
//     name: Joi.string(),
//     role: Joi.string(),
//     sortBy: Joi.string(),
//     limit: Joi.number().integer(),
//     page: Joi.number().integer(),
//   }),
// };

// const getUser = {
//   params: Joi.object().keys({
//     id: Joi.string().custom(objectId),
//   }),
// };

// const updateUser = {
//   params: Joi.object().keys({
//     id: Joi.required().custom(objectId),
//   }),
//   body: Joi.object()
//     .keys({
//       email: Joi.string().email(),
//       password: Joi.string().custom(password),
//       name: Joi.string(),
//     })
//     .min(1),
// };

// const deleteUser = {
//   params: Joi.object().keys({
//     id: Joi.string().custom(objectId),
//   }),
// };

module.exports = {
  CreateGuest,
  // getUsers,
  // getUser,
  // updateUser,
  // deleteUser,
  UpdateGuest,
};
