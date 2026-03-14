import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().required(),

  CORS_ORIGINS: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),

  COOKIE_SECRET: Joi.string().required(),
  COOKIE_PATH: Joi.string().required(),
  COOKIE_SECURE: Joi.string().valid('true', 'false').default('false'),

  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),

  ACCESS_TOKEN_TTL: Joi.string().required(),
  REFRESH_TOKEN_TTL: Joi.string().required(),
});
