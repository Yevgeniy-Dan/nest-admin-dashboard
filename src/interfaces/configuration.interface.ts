export interface IConfiguration {
  API_URL: string;
  CLIENT_ORIGIN: string;
  MONGODB_URI: string;
  JWT_ACCESS_KEY: string;
  JWT_REFRESH_KEY: string;
  AWS_REGION: string;
  AWS_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  MULTER_DEST: string;
  smtp: ISmtpConfig;
}

export interface ISmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}
