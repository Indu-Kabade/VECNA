import nodemailer from 'nodemailer';

interface SendOtpEmailParams {
  email: string;
  otp: string;
  expiresInMinutes?: number;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  provider: string;
  error?: string;
}

/**
 * Creates and caches the Nodemailer transporter based on environment variables
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      }),
      provider: `SMTP (${host})`,
    };
  }

  // Fallback for development / demo: Nodemailer ethereal test account
  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      provider: 'Ethereal Test Mailer (Development Mode)',
    };
  } catch (err) {
    console.warn('[EmailService] Could not generate test account, fallback to json transport:', err);
    return {
      transporter: nodemailer.createTransport({
        jsonTransport: true,
      }),
      provider: 'JSON Console Transport',
    };
  }
}

/**
 * Sends a real 6-digit OTP email with EcoTwin/Vecna branding
 */
export async function sendOtpEmail({
  email,
  otp,
  expiresInMinutes = 5,
}: SendOtpEmailParams): Promise<SendEmailResult> {
  try {
    const { transporter, provider } = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"EcoTwin Security" <security@ecotwin.internal>';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoTwin Security Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="520" style="max-width: 520px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 20px; background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); border-bottom: 1px solid #065f46;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #34d399;">
                      VECNA • EcoTwin
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 500;">
                      Campus Digital Twin & Facility Intelligence Platform
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #f8fafc;">
                Your Verification Code
              </h1>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Use the following 6-digit one-time passcode (OTP) to securely sign in to your EcoTwin facility session.
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #0f172a; border: 2px dashed #10b981; border-radius: 12px; padding: 24px 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #34d399; display: inline-block;">
                  ${otp}
                </span>
                <div style="margin-top: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #f59e0b;">
                  ⏱ Valid for ${expiresInMinutes} minutes only
                </div>
              </div>

              <!-- Security Information -->
              <div style="background-color: #0f172a; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; border: 1px solid #334155;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #e2e8f0;">
                  Security Guidelines:
                </p>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                  <li>This code is single-use and will immediately invalidate upon verification.</li>
                  <li>Never disclose or forward this code to anyone. EcoTwin staff will never ask for your OTP.</li>
                  <li>If you did not request this verification, your account remains secure and you may safely ignore this message.</li>
                </ul>
              </div>

              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                Recipient: <span style="color: #94a3b8; font-weight: 600;">${email}</span><br>
                Security Engine: SHA-256 Hashed • Zero Frontend Exposure
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #0f172a; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
              © ${new Date().getFullYear()} EcoTwin • Vecna Digital Twin Facility Management
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `[EcoTwin] ${otp} is your verification code`,
      text: `Your EcoTwin verification code is: ${otp}. This code is valid for ${expiresInMinutes} minutes. Do not share this code with anyone.`,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[EmailService] Sent OTP email to ${email} via ${provider}. MessageId: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[EmailService] Ethereal Web Preview: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || false,
      provider,
    };
  } catch (error) {
    console.error('[EmailService] Error sending OTP email:', error);
    return {
      success: false,
      provider: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown email sending failure',
    };
  }
}
