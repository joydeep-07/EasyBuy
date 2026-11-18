import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[Notification Simulation -> ${to}]: Subject: "${subject}"`);
      return { success: true, simulated: true };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"EasyBuy Marketplace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html,
    });

    console.log(`[Email Sent to ${to}]: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Notification Error]: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const getOrderEmailTemplate = (order, type = 'ORDER_PLACED') => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
        <strong>${item.title}</strong><br/>
        <small style="color: #666;">SKU: ${item.sku || 'N/A'}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.subtotal.toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background-color: rgb(26, 124, 26); color: white; padding: 15px; border-radius: 6px; text-align: center;">
        <h2 style="margin: 0;">EasyBuy - ${type.replace('_', ' ')}</h2>
      </div>
      <p style="margin-top: 20px;">Dear customer,</p>
      <p>Your order <strong>#${order.orderNumber}</strong> has been updated to: <strong>${order.orderStatus}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f7f7f7;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <p style="margin: 4px 0;">Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}</p>
        <p style="margin: 4px 0;">Discount: -₹${order.discount.toLocaleString('en-IN')}</p>
        <p style="margin: 4px 0;">Delivery: ₹${order.deliveryCharge.toLocaleString('en-IN')}</p>
        <h3 style="margin: 8px 0; color: rgb(26, 124, 26);">Total: ₹${order.totalAmount.toLocaleString('en-IN')}</h3>
      </div>

      <div style="margin-top: 25px; padding: 12px; background: #ecfdf5; border-radius: 6px;">
        <p style="margin: 0; font-size: 13px; color: #065f46;">
          Delivery Address: ${order.addressSnapshot?.houseBuilding}, ${order.addressSnapshot?.street}, ${order.addressSnapshot?.city}, ${order.addressSnapshot?.pincode}
        </p>
      </div>

      <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
        Thank you for shopping with EasyBuy. Fast, fresh, verified marketplace.
      </p>
    </div>
  `;
};
