import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from backend.app.config import settings

logger = logging.getLogger("email")

def send_email_via_smtp(to_email: str, subject: str, html_body: str):
    """
    Sends an HTML email to the target email address using the configured SMTP settings.
    If no SMTP credentials are set, it prints the email clearly to the server logs.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info("==================================================")
        logger.info("               MOCK EMAIL DESPATCH                ")
        logger.info(f"To:      {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info("--------------------------------------------------")
        logger.info(html_body)
        logger.info("==================================================")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email

        part = MIMEText(html_body, "html")
        msg.attach(part)

        # Connect to SMTP server (supports SSL / TLS STARTTLS)
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.ehlo()
        if settings.SMTP_PORT == 587:
            server.starttls()
            server.ehlo()
        
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
        server.quit()
        logger.info(f"Email successfully sent to: {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch SMTP email to {to_email} due to error: {e}")
        # Always fallback to logging details so the verification codes can be retrieved during development
        logger.info("--------------------------------------------------")
        logger.info(f"[FALLBACK LOG] To: {to_email} | Subject: {subject}")
        logger.info(html_body)
        logger.info("--------------------------------------------------")
        return False

def send_welcome_email(to_email: str):
    subject = "Welcome to myTechNews!"
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to myTechNews!</h2>
          <p>Hi,</p>
          <p>Thank you for creating an account on <strong>myTechNews Console</strong>. You now have access to serious, daily, aggregated tech updates and LLM performance inspector matrices.</p>
          <p>If you did not request this account, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 11px; color: #64748b;">myTechNews Editorial Desk • Powered by Google AI Guidelines</p>
        </div>
      </body>
    </html>
    """
    return send_email_via_smtp(to_email, subject, html_body)

def send_verification_email(to_email: str, code: str):
    subject = f"{code} is your myTechNews verification code"
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">Verify your identity</h2>
          <p>Hi,</p>
          <p>Please use the following verification code to complete your login request on <strong>myTechNews</strong>:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #0f172a; border: 1px solid #cbd5e1;">
            {code}
          </div>
          <p>This verification code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 11px; color: #64748b;">myTechNews Security Team • Powered by Google AI Guidelines</p>
        </div>
      </body>
    </html>
    """
    return send_email_via_smtp(to_email, subject, html_body)
