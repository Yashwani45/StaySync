/**
 * StaySync Web3Forms Mail Helper
 * Sends customer inquiries and booking requests directly to the administrator's email inbox
 * via Web3Forms API.
 */

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '8e14b125-828c-4cf8-8af2-9f4079a45340';

export async function sendWeb3FormsMail({
  subject,
  name,
  email,
  phone,
  category = 'Stay / Living Service',
  title = 'StaySync Listing',
  price,
  city = 'Indore',
  address = '',
  message = '',
  bookingId
}) {
  try {
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: subject || `🛎️ StaySync Inquiry: ${name || 'Customer'} - ${title} (${category})`,
      from_name: 'StaySync Living Platform',
      name: name || 'Interested Resident',
      email: email || 'resident@staysync.com',
      phone: phone || 'Not provided',
      category: category,
      listing_title: title,
      price: price ? (typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price) : 'Standard Rate',
      city: city,
      location: [address, city].filter(Boolean).join(', '),
      booking_reference: bookingId || `SS-${Date.now().toString().slice(-6).toUpperCase()}`,
      message: message || `Booking inquiry request submitted for ${title} (${category}).`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success) {
      console.log('[Web3Forms] Mail successfully dispatched to inbox:', result);
      return { success: true, data: result };
    } else {
      console.warn('[Web3Forms] Mail delivery response:', result);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('[Web3Forms] Network/Client error sending mail:', error);
    return { success: false, error: error.message };
  }
}
