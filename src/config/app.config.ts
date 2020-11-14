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
    type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    port: parseInt(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [__dirname + '/../entities/*.{js,ts}'],
    migrations: [__dirname + '/../migrations/*.{js,ts}'],
    cli: {
      entitiesDir: __dirname + '/../entities',
      migrationsDir: __dirname + '/../migrations',
    },
    migrationsTableName: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN,
    synchronize: process.env.TYPEORM_SYNCHRONIZE,
  },
});
