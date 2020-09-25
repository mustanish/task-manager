export const AppConfig = () => ({
  server: {
    port: parseInt(process.env.SERVER_PORT),
    jwtSecret: process.env.JWT_SECRET,
  },
  cache: {
    host: process.env.CACHE_HOST,
    port: parseInt(process.env.CACHE_PORT),
    db: parseInt(process.env.CACHE_DB),
    keyPrefix: process.env.CACHE_PRIFIX,
  },
  database: {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
  },
});
