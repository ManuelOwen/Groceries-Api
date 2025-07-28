# Email Setup Instructions

## Overview
This application uses Nodemailer to send order confirmation emails to users after successful payments.

## Required Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@olivegroceries.com
```

## Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

## Alternative Email Services

### Mailtrap (For Testing)
```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASSWORD=your-mailtrap-password
```

### SendGrid (For Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

## Email Templates

The application includes two email templates:

1. **Order Confirmation Email** (`/api/v1/email/order-confirmation`)
   - Sent after successful order creation
   - Includes order details, items, and delivery information
   - Estimated delivery time: 2 hours

2. **Payment Confirmation Email** (`/api/v1/email/payment-confirmation`)
   - Sent after successful payment processing
   - Includes payment reference and confirmation details

## Testing

To test the email functionality:

1. Ensure your environment variables are set correctly
2. Make a test order through the frontend
3. Check your email inbox for the confirmation email
4. Check the backend logs for email sending status

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Verify your email credentials
   - Ensure 2FA is enabled and app password is used (for Gmail)

2. **Connection Timeout**
   - Check your internet connection
   - Verify the SMTP host and port settings

3. **Email Not Received**
   - Check spam/junk folder
   - Verify the recipient email address
   - Check backend logs for errors

## Security Notes

- Never commit your email credentials to version control
- Use environment variables for all sensitive information
- Consider using a dedicated email service for production
- Regularly rotate your email passwords/app keys 