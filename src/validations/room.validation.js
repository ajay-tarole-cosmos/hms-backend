const Joi = require("joi");

const createRoomSchema = Joi.object({
  room_type: Joi.string().required().messages({
    "string.empty": "Room type is required",
  }),
  amenities: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()),
      Joi.string()
    )
    .optional()
    .messages({
      "any.required": "Amenities must be an array or a comma-separated string",
    }),
  capacity: Joi.number().integer().required().messages({
    "number.base": "Capacity must be a number",
    "any.required": "Capacity is required",
  }),
  bed_count: Joi.number().integer().optional().messages({
    "number.base": "Bed count must be a number",
    "any.required": "Bed count is required",
  }),
  bed_type: Joi.string().optional().messages({
    "string.empty": "Bed type is required",
  }),
  extra_bed: Joi.number().integer().optional(),
  room_size: Joi.number().integer().optional(),
  price: Joi.number().required().messages({
    "number.base": "Price must be a number",
    "any.required": "Price is required",
  }),
});

const createRoomNumberSchema = Joi.object({
  room_number: Joi.number().integer().required().messages({
    "number.base": "Room number must be a number",
    "any.required": "Room number is required",
  }),

  room_type: Joi.string().required().messages({
    "string.base": "Room type must be a string",
    "any.required": "Room type is required",
  }),

  room_status: Joi.string()
    .valid("Available", "Occupied", "Maintenance")
    .optional()
    .messages({
      "string.base": "Room status must be a string",
      "any.only": "Room status must be Available, Occupied, or Maintenance",
    }),

  floor_number: Joi.number().integer().optional().messages({
    "number.base": "Floor number must be an integer",
  }),

  standard_checkout: Joi.string().optional().messages({
    "string.base": "Standard checkout must be a string",
  }),
});

const updateRoomValidation = Joi.object({
  number_of_room: Joi.number().integer().required(),
  room_type: Joi.string().required().messages({
    "string.empty": "Room type is required",
  }),
    amenities: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
    capacity: Joi.number().integer().required().messages({
      "number.base": "Capacity must be a number",
      "any.required": "Capacity is required",
    }),  bed_count: Joi.number().integer().optional(),
  bed_type: Joi.string().optional(),
  extra_bed: Joi.number().integer().optional(),
  room_size: Joi.number().integer().optional(),
  price: Joi.number().precision(2).optional(),
});

const updateRoomNumberValidation = Joi.object({
  room_number: Joi.number().integer().optional(),
  room_status: Joi.string()
    .optional(),
  floor_number: Joi.number().integer().optional(),
  standard_checkout: Joi.string().optional(),
});

const createOfferValidation = Joi.object({
  offer_name: Joi.string().required().messages({
    "any.required": "Offer name is required",
    "string.base": "Offer name must be a string"
  }),

  room_type_id: Joi.string().required().messages({
    "any.required": "Room type Id is required",
    "string.base": "Room type Id must be a string"
  }),

  offer_type: Joi.string()
    .valid("seasonal", "weekend")
    .optional()
    .messages({
      "any.only": "Offer type must be either 'seasonal' or 'weekend'"
    }),

  valid_date_from: Joi.date().iso().required().messages({
    "any.required": "Valid from date is required",
    "date.format": "Date must be in ISO format (YYYY-MM-DD)"
  }),

  valid_date_to: Joi.date().iso().required().greater(Joi.ref("valid_date_from")).messages({
    "any.required": "Valid to date is required",
    "date.greater": "Valid to date must be after valid from date"
  }),

  discount_type: Joi.string()
    .valid("percentage", "flat")
    .optional()
    .messages({
      "any.only": "Discount type must be either 'percentage' or 'flat'"
    }),

  discount_value: Joi.number()
    .precision(2)
    .required()
    .min(0)
    .messages({
      "any.required": "Discount value is required",
      "number.base": "Discount value must be a number",
      "number.min": "Discount value must be greater than or equal to 0"
    }),
});

const updateOfferValidation = Joi.object({
  offer_name: Joi.string().optional().messages({
    "string.base": "Offer name must be a string"
  }),

  room_type: Joi.string().optional().messages({
    "string.base": "Room type must be a string"
  }),

  offer_type: Joi.string()
    .valid("seasonal", "weekend")
    .optional()
    .messages({
      "any.only": "Offer type must be either 'seasonal' or 'weekend'"
    }),

  valid_date_from: Joi.date().iso().optional().messages({
    "date.format": "Date must be in ISO format (YYYY-MM-DD)"
  }),

  valid_date_to: Joi.date().iso().optional().greater(Joi.ref("valid_date_from")).messages({
    "date.greater": "Valid to date must be after valid from date"
  }),

  discount_type: Joi.string()
    .valid("percentage", "flat")
    .optional()
    .messages({
      "any.only": "Discount type must be either 'percentage' or 'flat'"
    }),

  discount_value: Joi.number()
    .precision(2)
    .optional()
    .min(0)
    .messages({
      "number.base": "Discount value must be a number",
      "number.min": "Discount value must be greater than or equal to 0"
    }),
});

const createPackageValidation = Joi.object({
  room_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
    "array.base": "Room IDs must be an array of UUIDs"
  }),
  package_name: Joi.string().required().messages({
    "string.base": "Package name must be a string",
    "any.required": "Package name is required"
  }),
  package_description: Joi.string().optional().messages({
    "string.base": "Package description must be a string"
  }),
  package_price: Joi.number().precision(2).required().messages({
    "number.base": "Package price must be a number",
    "any.required": "Package price is required"
  })
});

const updatePackageValidation = Joi.object({
  room_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
    "array.base": "Room IDs must be an array of UUIDs"
  }),
  package_name: Joi.string().optional().messages({
    "string.base": "Package name must be a string"
  }),
  package_description: Joi.string().optional().messages({
    "string.base": "Package description must be a string"
  }),
  package_price: Joi.number().precision(2).optional().messages({
    "number.base": "Package price must be a number"
  })
});

module.exports = { createRoomSchema,createRoomNumberSchema ,updateRoomValidation,updateRoomNumberValidation,
  createOfferValidation,updateOfferValidation,createPackageValidation,updatePackageValidation
};
