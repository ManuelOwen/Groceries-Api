import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface OrderConfirmationEmailData {
  userEmail: string;
  userName: string;
  orderNumber: string;
  orderItems: Array<{
    product_name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  estimatedDeliveryTime: string;
}

export interface PaymentConfirmationEmailData {
  userEmail: string;
  userName: string;
  orderNumber: string;
  paymentReference: string;
  totalAmount: number;
  estimatedDeliveryTime: string;
}

@Injectable()
export class NodemailerService {
  private readonly logger = new Logger(NodemailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    // For development, you can use Gmail or a service like Mailtrap
    // For production, use a proper email service like SendGrid, AWS SES, etc.
    
    const emailConfig = {
      host: this.configService.get('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get('EMAIL_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter configured successfully');
    } catch (error) {
      this.logger.error('Email transporter configuration failed:', error);
    }
  }

  async sendOrderConfirmationEmail(emailData: OrderConfirmationEmailData) {
    try {
      const itemsList = emailData.orderItems
        .map(item => `${item.product_name} - KSH ${item.price} x ${item.quantity}`)
        .join('\n');

      const mailOptions = {
        from: this.configService.get('EMAIL_FROM', 'noreply@olivegroceries.com'),
        to: emailData.userEmail,
        subject: `Order Confirmation - ${emailData.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f97316; color: white; padding: 20px; text-align: center;">
              <h1>🍊 Olive Groceries</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Order Confirmation</h2>
              
              <p>Dear ${emailData.userName},</p>
              
              <p>Thank you for your order! We have received your order and it is being processed.</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #f97316; margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> ${emailData.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Estimated Delivery:</strong> ${emailData.estimatedDeliveryTime}</p>
              </div>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #f97316; margin-top: 0;">Items Ordered</h3>
                <div style="white-space: pre-line;">${itemsList}</div>
                <hr style="margin: 15px 0;">
                <p style="font-size: 18px; font-weight: bold;">
                  <strong>Total Amount: KSH ${emailData.totalAmount}</strong>
                </p>
              </div>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #f97316; margin-top: 0;">Delivery Information</h3>
                <p><strong>Shipping Address:</strong></p>
                <p>${emailData.shippingAddress}</p>
              </div>
              
              <p>We will notify you when your order is ready for delivery. You can expect your package within ${emailData.estimatedDeliveryTime}.</p>
              
              <p>If you have any questions, please don't hesitate to contact our customer support.</p>
              
              <p>Thank you for choosing Olive Groceries!</p>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f97316; color: white;">
                <p style="margin: 0;">🍊 Fresh groceries delivered to your doorstep</p>
              </div>
            </div>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Order confirmation email sent to ${emailData.userEmail}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error('Failed to send order confirmation email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  async sendPaymentConfirmationEmail(emailData: PaymentConfirmationEmailData) {
    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_FROM', 'noreply@olivegroceries.com'),
        to: emailData.userEmail,
        subject: `Payment Confirmation - ${emailData.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f97316; color: white; padding: 20px; text-align: center;">
              <h1>🍊 Olive Groceries</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Payment Confirmation</h2>
              
              <p>Dear ${emailData.userName},</p>
              
              <p>Your payment has been successfully processed!</p>
              
              <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #f97316; margin-top: 0;">Payment Details</h3>
                <p><strong>Order Number:</strong> ${emailData.orderNumber}</p>
                <p><strong>Payment Reference:</strong> ${emailData.paymentReference}</p>
                <p><strong>Amount Paid:</strong> KSH ${emailData.totalAmount}</p>
                <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Estimated Delivery:</strong> ${emailData.estimatedDeliveryTime}</p>
              </div>
              
              <p>Your order is now confirmed and will be processed for delivery. You can expect your package within ${emailData.estimatedDeliveryTime}.</p>
              
              <p>Thank you for your payment!</p>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f97316; color: white;">
                <p style="margin: 0;">🍊 Fresh groceries delivered to your doorstep</p>
              </div>
            </div>
          </div>
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Payment confirmation email sent to ${emailData.userEmail}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      this.logger.error('Failed to send payment confirmation email:', error);
      throw new Error('Failed to send payment confirmation email');
    }
  }

  // Legacy methods for backward compatibility
  create(createNodemailerDto: any) {
    return 'This action adds a new nodemailer';
  }

  findAll() {
    return `This action returns all nodemailer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nodemailer`;
  }

  update(id: number, updateNodemailerDto: any) {
    return `This action updates a #${id} nodemailer`;
  }

  remove(id: number) {
    return `This action removes a #${id} nodemailer`;
  }
}
