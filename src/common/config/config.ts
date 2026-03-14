import ms from 'ms';

export default () => ({
  app: {
    port: parseInt(process.env.PORT!, 10),
    env: process.env.NODE_ENV,
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [],
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
    maxAge: ms(process.env.REFRESH_TOKEN_TTL as ms.StringValue),
    path: process.env.COOKIE_PATH,
    secure: process.env.COOKIE_SECURE === 'true',
  },
  tokens: {
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_TTL,
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_TTL,
    },
  },
});
