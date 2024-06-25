import Joi from 'joi';

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(2).max(12).required(),
  token: Joi.string().required(),
});
