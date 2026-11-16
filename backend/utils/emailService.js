const nodemailer = require('nodemailer');
const https = require('https');

let transporterInstance = null;

/**
 * Web3Forms Dispatcher
 * Submits notifications and booking inquiries directly through Web3Forms API
 * with browser emulation headers so the email reliably arrives in the user's inbox.
 */
async function sendWeb3FormsNotification({
  subject,
  name,
  email,
  phone,
  category,
  itemTitle,
  price,
  location,
  message,
  bookingId,
  recipientEmail
}) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || '8e14b125-828c-4cf8-8af2-9f4079a45340';
  if (!accessKey) {
    console.warn('[EmailService] Web3Forms: Access key is missing');
    return false;
  }

  return new Promise((resolve) => {
    try {
      const payload = {
        access_key: accessKey,
        subject: subject || `StaySync Booking Inquiry: ${itemTitle || category || 'Request'}`,
        from_name: 'StaySync Living Platform',
        name: name || 'Customer',
        email: email || 'customer@staysync.com',
        phone: phone || 'Not provided',
        category: category || 'Stay / Living Service',
        listing_title: itemTitle || 'StaySync Listing',
        price: price || 'N/A',
        location: location || 'Indore',
        booking_reference: bookingId || `SS-${Date.now().toString().slice(-6)}`,
        message: message || 'Customer submitted a booking inquiry on StaySync.',
        owner_recipient: recipientEmail || 'Platform Admin'
      };

      const data = JSON.stringify(payload);
      const req = https.request('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Origin': 'http://localhost:3001',
          'Referer': 'http://localhost:3001/'
        },
        timeout: 8000
      }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[EmailService] ✅ Web3Forms email dispatched! Ref: ${payload.booking_reference} | To: Web3Forms Inbox`);
            resolve(true);
          } else {
            console.warn(`[EmailService] ⚠️ Web3Forms response status ${res.statusCode}:`, body);
            resolve(false);
          }
        });
      });

      req.on('error', (err) => {
        console.error('[EmailService] ❌ Web3Forms request error:', err.message);
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn('[EmailService] ⏱️ Web3Forms request timed out');
        resolve(false);
      });

      req.write(data);
      req.end();
    } catch (err) {
      console.error('[EmailService] Unexpected error sending Web3Forms email:', err.message);
      resolve(false);
    }
  });
}

/**
 * Initializes and retrieves the nodemailer transporter.
 * If SMTP credentials (EMAIL_USER & EMAIL_PASS) are not set in .env,
 * it safely falls back to Nodemailer Ethereal or sandbox logging.
 */
async function getTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }

  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (emailUser && emailPass) {
    // Configured with custom SMTP or Gmail
    const isGmail = emailUser.includes('@gmail.com') || process.env.EMAIL_SERVICE === 'gmail';
    transporterInstance = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user: emailUser,
              pass: emailPass
            }
          }
        : {
            host: process.env.EMAIL_HOST || 'smtp.mailgun.org',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
              user: emailUser,
              pass: emailPass
            }
          }
    );
    console.log(`[EmailService] Configured live SMTP transport via ${emailUser}`);
    return transporterInstance;
  }

  // Fallback: Generate Ethereal test account for local testing & development
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('[EmailService] Local testing mode active: Ethereal Mail sandbox initialized.');
    return transporterInstance;
  } catch (err) {
    console.warn('[EmailService] Warning: Could not initialize Ethereal transport:', err.message);
    return null;
  }
}

/**
 * Common HTML wrapper with StaySync branded responsive design
 */
function createEmailTemplate({ title, subtitle, badgeText, contentHtml, ctaText, ctaUrl, accentColor = '#f97316' }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 28px; text-align: left; }
    .brand { font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
    .brand span { color: ${accentColor}; }
    .badge { display: inline-block; background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; }
    .header-title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 12px 0 4px 0; }
    .header-sub { font-size: 13px; color: #94a3b8; margin: 0; }
    .body { padding: 28px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 12px; }
    .field-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .field-row:last-child { border-bottom: none; }
    .field-label { color: #64748b; font-weight: 600; }
    .field-val { color: #0f172a; font-weight: 700; text-align: right; }
    .message-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 14px 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #9a3412; font-style: italic; }
    .btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: ${accentColor}; color: #ffffff !important; padding: 14px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; margin-top: 20px; box-shadow: 0 4px 12px rgba(249,115,22,0.25); }
    .footer { padding: 20px 28px; background: #f1f5f9; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Stay<span>Sync</span></div>
      ${badgeText ? `<div class="badge">${badgeText}</div>` : ''}
      <h1 class="header-title">${title}</h1>
      ${subtitle ? `<p class="header-sub">${subtitle}</p>` : ''}
    </div>
    <div class="body">
      ${contentHtml}
      ${ctaText && ctaUrl ? `<a href="${ctaUrl}" class="btn">${ctaText}</a>` : ''}
    </div>
    <div class="footer">
      StaySync — Smart Living, Hostels, PGs & Daily Services Platform.<br/>
      Need assistance? Contact support@staysync.com
    </div>
  </div>
</body>
</html>
`;
}

/**
 * 1. Send Inquiry Email to Owner / Provider
 * Notifies the owner that a customer wants to book or inquire about their Hostel / PG / Room / Tiffin / Cleaning
 */
async function sendInquiryNotificationToOwner({ request, sender, receiver, item, itemType }) {
  const refCode = `#SS-${request._id.toString().slice(-6).toUpperCase()}`;

  let categoryLabel = 'Stay';
  let itemTitle = 'Accommodation';
  let priceLabel = 'Monthly Rent';
  let priceValue = 'N/A';
  let detailFields = [];

  if (itemType === 'Property') {
    categoryLabel = item.propertyType || 'Hostel / PG / Room';
    itemTitle = item.title || 'Accommodation Listing';
    priceLabel = 'Monthly Rent';
    priceValue = `₹${(item.monthlyRent || item.rentPerPerson || 0).toLocaleString('en-IN')}/mo`;
    detailFields = [
      { label: 'Category', value: `${item.propertyType || 'Stay'} (${item.hostelCategory || 'All'})` },
      { label: 'Room Type', value: item.roomType || 'Standard Room' },
      { label: 'Location', value: `${item.address || ''}, ${item.city || 'Indore'}` },
      { label: 'Deposit', value: item.securityDeposit ? `₹${item.securityDeposit.toLocaleString('en-IN')}` : 'Included' }
    ];
  } else if (itemType === 'ServiceProvider') {
    const isTiffin = item.category === 'Tiffin';
    categoryLabel = isTiffin ? 'Tiffin & Meal Service' : 'Housekeeping & Cleaning';
    itemTitle = item.businessName || 'Daily Living Service';
    priceLabel = isTiffin ? 'Monthly Meal Plan' : 'Starting Price';
    priceValue = isTiffin
      ? `₹${(item.tiffinDetails?.monthlyPrice || 3000).toLocaleString('en-IN')}/mo`
      : `₹${(item.cleaningDetails?.priceMap?.['Regular Room'] || 350).toLocaleString('en-IN')}`;
    detailFields = [
      { label: 'Service Category', value: categoryLabel },
      { label: 'Operating City', value: item.city || 'Indore' },
      { label: 'Area Covered', value: item.address || 'Local Hub' }
    ];
  }

  // 1. Send real email through Web3Forms to user's verified inbox
  try {
    await sendWeb3FormsNotification({
      subject: `🛎️ StaySync Inquiry: ${sender.name} interested in ${itemTitle} (${categoryLabel}) [${refCode}]`,
      name: sender.name,
      email: sender.email,
      phone: sender.phone || 'Not provided',
      category: categoryLabel,
      itemTitle: itemTitle,
      price: priceValue,
      location: item.address ? `${item.address}, ${item.city || 'Indore'}` : (item.city || 'Indore'),
      message: request.message || `Customer inquiry for ${itemTitle} (${categoryLabel})`,
      bookingId: refCode,
      recipientEmail: receiver?.email || 'owner@staysync.com'
    });
  } catch (w3Err) {
    console.warn('[EmailService] Web3Forms dispatch warning:', w3Err.message);
  }

  try {
    const transporter = await getTransporter();
    if (!transporter) return true;

    const fromEmail = process.env.EMAIL_FROM || '"StaySync Notifications" <notifications@staysync.com>';

    const contentHtml = `
      <div style="font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
        Hello <strong>${receiver.name}</strong>,<br/>
        You have received a new inquiry & booking interest for your <strong>${itemTitle}</strong>.
      </div>

      <div class="card">
        <div class="card-title">Customer / Seeker Details</div>
        <div class="field-row">
          <span class="field-label">Full Name</span>
          <span class="field-val">${sender.name}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Email Address</span>
          <span class="field-val"><a href="mailto:${sender.email}" style="color: #f97316; text-decoration: none;">${sender.email}</a></span>
        </div>
        <div class="field-row">
          <span class="field-label">Phone Number</span>
          <span class="field-val"><a href="tel:${sender.phone}" style="color: #f97316; text-decoration: none;">${sender.phone || 'Not provided'}</a></span>
        </div>
        ${sender.gender ? `
        <div class="field-row">
          <span class="field-label">Gender</span>
          <span class="field-val">${sender.gender}</span>
        </div>` : ''}
        ${sender.currentCity ? `
        <div class="field-row">
          <span class="field-label">Current City</span>
          <span class="field-val">${sender.currentCity}</span>
        </div>` : ''}
      </div>

      <div class="card">
        <div class="card-title">Inquired Listing / Service (${categoryLabel})</div>
        <div class="field-row">
          <span class="field-label">Listing Title</span>
          <span class="field-val">${itemTitle}</span>
        </div>
        ${detailFields.map(f => `
        <div class="field-row">
          <span class="field-label">${f.label}</span>
          <span class="field-val">${f.value}</span>
        </div>`).join('')}
        <div class="field-row">
          <span class="field-label">${priceLabel}</span>
          <span class="field-val" style="color: #16a34a; font-weight: 800;">${priceValue}</span>
        </div>
        ${request.proposedPrice ? `
        <div class="field-row">
          <span class="field-label">Offered / Proposed Price</span>
          <span class="field-val" style="color: #f97316; font-weight: 800;">₹${request.proposedPrice.toLocaleString('en-IN')}</span>
        </div>` : ''}
      </div>

      ${request.message ? `
      <div style="font-weight: 700; font-size: 12px; color: #475569; margin-bottom: 6px;">Customer Inquiry Message:</div>
      <div class="message-box">"${request.message}"</div>
      ` : ''}

      <div style="font-size: 12px; color: #64748b; margin-top: 12px;">
        Reference ID: <strong>${refCode}</strong> • Status: <strong>Pending Review</strong>
      </div>
    `;

    const html = createEmailTemplate({
      title: `New Inquiry for ${itemTitle}`,
      subtitle: `From ${sender.name} (${sender.phone || sender.email})`,
      badgeText: `New ${categoryLabel} Inquiry`,
      contentHtml,
      ctaText: 'Open StaySync Dashboard to Review',
      ctaUrl: `http://localhost:5173/dashboard?tab=requests`
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to: receiver.email,
      subject: `🛎️ New Inquiry: ${sender.name} interested in your ${itemTitle} [${refCode}]`,
      html
    });

    console.log(`[EmailService] Inquiry notification sent to Owner (${receiver.email}). MessageId: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[EmailService] 🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return true;
  } catch (err) {
    console.error('[EmailService] Failed to send owner notification email:', err.message);
    return false;
  }
}

/**
 * 2. Send Confirmation Email to Customer / Tenant
 * Confirms receipt of their inquiry and provides direct contact info for the owner/provider
 */
async function sendInquiryConfirmationToCustomer({ request, sender, receiver, item, itemType }) {
  try {
    const transporter = await getTransporter();
    if (!transporter) return false;

    const fromEmail = process.env.EMAIL_FROM || '"StaySync Confirmations" <confirmations@staysync.com>';
    const refCode = `#SS-${request._id.toString().slice(-6).toUpperCase()}`;

    let categoryLabel = itemType === 'Property' ? (item.propertyType || 'Stay') : (item.category || 'Service');
    let itemTitle = item.title || item.businessName || 'Listing';

    const contentHtml = `
      <div style="font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
        Dear <strong>${sender.name}</strong>,<br/>
        Your inquiry for <strong>${itemTitle}</strong> (${categoryLabel}) has been successfully submitted!
      </div>

      <div class="card">
        <div class="card-title">Inquiry Summary (${refCode})</div>
        <div class="field-row">
          <span class="field-label">Selected ${itemType === 'Property' ? 'Stay' : 'Service'}</span>
          <span class="field-val">${itemTitle}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Category</span>
          <span class="field-val">${categoryLabel}</span>
        </div>
        ${item.city ? `
        <div class="field-row">
          <span class="field-label">Location</span>
          <span class="field-val">${[item.address, item.city].filter(Boolean).join(', ')}</span>
        </div>` : ''}
        <div class="field-row">
          <span class="field-label">Status</span>
          <span class="field-val" style="color: #ea580c;">Pending Owner Approval</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Owner / Provider Contact</div>
        <div class="field-row">
          <span class="field-label">Contact Person</span>
          <span class="field-val">${receiver.name}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Phone</span>
          <span class="field-val"><a href="tel:${receiver.phone}" style="color: #f97316; text-decoration: none;">${receiver.phone || 'Available on request'}</a></span>
        </div>
        <div class="field-row">
          <span class="field-label">Email</span>
          <span class="field-val">${receiver.email}</span>
        </div>
      </div>

      <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 14px;">
        💡 <strong>What happens next?</strong><br/>
        The property owner / provider has received your inquiry details. They will review your request and get in touch with you directly via phone or chat to confirm availability and schedule a visit.
      </div>
    `;

    const html = createEmailTemplate({
      title: 'Inquiry Submitted Successfully',
      subtitle: `Reference ID: ${refCode}`,
      badgeText: 'Confirmation Received',
      contentHtml,
      ctaText: 'View My Inquiries & Bookings',
      ctaUrl: `http://localhost:5173/dashboard?tab=requests`,
      accentColor: '#10b981'
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to: sender.email,
      subject: `✅ Inquiry Confirmed: ${itemTitle} (${categoryLabel}) [${refCode}]`,
      html
    });

    console.log(`[EmailService] Inquiry confirmation sent to Customer (${sender.email}). MessageId: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[EmailService] 🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return true;
  } catch (err) {
    console.error('[EmailService] Failed to send customer confirmation email:', err.message);
    return false;
  }
}

/**
 * 3. Send Status Update Email (When Owner Accepts or Rejects)
 */
async function sendStatusUpdateEmailToCustomer({ request, sender, receiver, item, itemType, status, responseMessage }) {
  const refCode = `#SS-${request._id.toString().slice(-6).toUpperCase()}`;
  const isAccepted = status === 'Accepted';
  const itemTitle = item.title || item.businessName || 'Listing';

  // 1. Dispatch status update to Web3Forms
  try {
    await sendWeb3FormsNotification({
      subject: `${isAccepted ? '🎉' : 'ℹ️'} StaySync Update: Booking ${status} for ${itemTitle} [${refCode}]`,
      name: sender.name,
      email: sender.email,
      phone: sender.phone || 'Not provided',
      category: 'Booking Status Update',
      itemTitle: itemTitle,
      price: status,
      location: item.city || 'Indore',
      message: `Booking status changed to ${status}. ${responseMessage ? `Note: "${responseMessage}"` : ''}`,
      bookingId: refCode,
      recipientEmail: receiver?.email || 'owner@staysync.com'
    });
  } catch (w3Err) {
    console.warn('[EmailService] Web3Forms dispatch warning on status update:', w3Err.message);
  }

  try {
    const transporter = await getTransporter();
    if (!transporter) return true;

    const fromEmail = process.env.EMAIL_FROM || '"StaySync Updates" <updates@staysync.com>';

    const contentHtml = `
      <div style="font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
        Dear <strong>${sender.name}</strong>,<br/>
        Your booking / inquiry request for <strong>${itemTitle}</strong> has been 
        <strong style="color: ${isAccepted ? '#16a34a' : '#dc2626'}; font-size: 15px;">${status.toUpperCase()}</strong> by the owner.
      </div>

      <div class="card">
        <div class="card-title">Booking Details</div>
        <div class="field-row">
          <span class="field-label">Listing</span>
          <span class="field-val">${itemTitle}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Status</span>
          <span class="field-val" style="color: ${isAccepted ? '#16a34a' : '#dc2626'}; font-weight: 800;">${status}</span>
        </div>
        ${responseMessage ? `
        <div class="field-row">
          <span class="field-label">Owner Note</span>
          <span class="field-val">${responseMessage}</span>
        </div>` : ''}
        <div class="field-row">
          <span class="field-label">Owner Phone</span>
          <span class="field-val"><a href="tel:${receiver.phone}" style="color: #f97316;">${receiver.phone || receiver.email}</a></span>
        </div>
      </div>

      ${isAccepted ? `
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 16px; border-radius: 8px; font-size: 13px; color: #166534;">
        🎉 <strong>Congratulations!</strong> Your stay has now been approved. You can view your room agreement, payment schedule, and meals directly inside your StaySync Resident Dashboard.
      </div>` : ''}
    `;

    const html = createEmailTemplate({
      title: `Booking Request ${status}`,
      subtitle: `Reference ID: ${refCode}`,
      badgeText: `Status: ${status}`,
      contentHtml,
      ctaText: 'Open My Living Dashboard',
      ctaUrl: `http://localhost:5173/dashboard`,
      accentColor: isAccepted ? '#16a34a' : '#dc2626'
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to: sender.email,
      subject: `${isAccepted ? '🎉' : 'ℹ️'} Booking ${status}: ${itemTitle} [${refCode}]`,
      html
    });

    console.log(`[EmailService] Status update email sent to Customer (${sender.email}). MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('[EmailService] Failed to send status update email:', err.message);
    return false;
  }
}

module.exports = {
  getTransporter,
  sendWeb3FormsNotification,
  sendInquiryNotificationToOwner,
  sendInquiryConfirmationToCustomer,
  sendStatusUpdateEmailToCustomer
};
