export default () => ({
  mongoURI: process.env.MONGODB_URI,
  jwtAccessKey: process.env.JWT_ACCESS_KEY,
  jwtRefreshKey: process.env.JWT_REFRESH_KEY,
  awsRegion: process.env.AWS_REGION,
  awsBucket: process.env.AWS_BUCKET,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccesssKey: process.env.AWS_SECRET_ACCESS_KEY,
  multerDest: process.env.MULTER_DEST,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
});
