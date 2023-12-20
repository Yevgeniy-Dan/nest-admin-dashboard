import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';
import {
  IConfiguration,
  ISmtpConfig,
} from 'src/interfaces/configuration.interface';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  /**
   * Constructor for creating an instance of a class handling email configuration using nodemailer.
   *
   * @param configService - An instance of the ConfigService providing access to the application configuration.
   *                        Expects a configuration section named 'smtp' to retrieve SMTP-related settings.
   */
  constructor(private configService: ConfigService<IConfiguration>) {
    const smtpConfig = this.configService.get<ISmtpConfig>('smtp');

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    } as any);
  }

  /**
   * Asynchronously sends a password reset email to the specified recipient with a reset link.
   *
   * @param to - The email address of the recipient.
   * @param link - The password reset link to be included in the email.
   * @returns {Promise<void>} - Resolves when the email is successfully sent; otherwise, rejects with an error.
   */
  async sendPasswordResetMail(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<ISmtpConfig>('smtp').user,
      to,
      subject: `Password resetting for ${this.configService.get<string>(
        'API_URL',
      )}`,
      text: '',
      html: `
      <div>
        <h1>To reset password follow the link</h1>
        <a href="${link}">${link}</a>
      </div>
      `,
    });
  }
}
