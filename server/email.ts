import nodemailer from 'nodemailer';

// Set up email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use other services or SMTP settings
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

// Check if email credentials are set
const hasEmailCredentials = () => {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
};

// Function to send client account creation notification
export async function sendClientAccountNotification(
  email: string, 
  name: string, 
  username: string,
  clientPortalUrl: string
) {
  // Skip email sending if credentials aren't configured
  if (!hasEmailCredentials()) {
    console.log('Email sending skipped: No email credentials configured');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Client Portal Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <h2 style="color: #4a6cf7; text-align: center;">Welcome to Your Client Portal</h2>
          <p>Hello ${name},</p>
          <p>Your client account has been created successfully! You can now track your projects, communicate with our team, and share documents through your personalized dashboard.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Account Information</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Login URL:</strong> <a href="${clientPortalUrl}">${clientPortalUrl}</a></p>
          </div>
          
          <p>Please use the username and password provided to you to log in. If you haven't received your password or have issues logging in, please contact us.</p>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${clientPortalUrl}" style="background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Dashboard</a>
          </div>
          
          <p style="margin-top: 25px;">If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:stannjoro@hotmail.com">stannjoro@hotmail.com</a> or call us at 0716830746.</p>
          
          <p>Thank you for your trust in our services!</p>
          
          <p>Best regards,<br/>Mufasa Web Development Team</p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; font-size: 12px; color: #777;">
            <p>This is an automated message from our system. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Mufasa Web Development. All rights reserved.</p>
            <p><a href="https://helpwithmufasa.me">helpwithmufasa.me</a></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}