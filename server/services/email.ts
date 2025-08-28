import sgMail from '@sendgrid/mail';

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API key not configured. Email notification skipped.");
      return false;
    }

    const message: any = {
      to: params.to,
      from: params.from || process.env.FROM_EMAIL || 'noreply@scriptumlearning.com',
      subject: params.subject
    };
    
    if (params.html) {
      message.html = params.html;
    } else if (params.text) {
      message.text = params.text;
    }

    await sgMail.send(message);
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}