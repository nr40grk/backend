const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const STUDIO = {
  name: 'NR40 Athens',
  address: 'Κάνιγγος 27, Αθήνα 106 82',
  phone: '+30 210 380 6408',
  email: 'info@nr40athens.com',
  instagram: 'https://www.instagram.com/nr40_ath/',
  hours: 'Δευτέρα – Σάββατο: 11:00–20:00',
};

const baseStyle = `
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #0f0f0f;
  color: #f0ece4;
`;

function footer(lang = 'gr') {
  return `
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1e1e1e;">
      <p style="color:#c9a84c;font-size:1rem;font-weight:bold;margin:0 0 8px;">NR40 ATHENS</p>
      <p style="color:#888;font-size:0.82rem;margin:0 0 4px;">📍 ${STUDIO.address}</p>
      <p style="color:#888;font-size:0.82rem;margin:0 0 4px;">📞 <a href="tel:${STUDIO.phone}" style="color:#888;">${STUDIO.phone}</a></p>
      <p style="color:#888;font-size:0.82rem;margin:0 0 4px;">✉️ <a href="mailto:${STUDIO.email}" style="color:#888;">${STUDIO.email}</a></p>
      <p style="color:#888;font-size:0.82rem;margin:0 0 16px;">🕐 ${STUDIO.hours}</p>
      <a href="${STUDIO.instagram}" style="color:#c9a84c;font-size:0.82rem;">Instagram @nr40_ath</a>
      <p style="color:#444;font-size:0.75rem;margin-top:16px;">© ${new Date().getFullYear()} NR40 Athens. All rights reserved.</p>
    </div>
  `;
}

// ─── BOOKING NOTIFICATION TO STUDIO ───
async function sendBookingNotification(booking) {
  const { error } = await resend.emails.send({
    from: 'NR40 Bookings <booking@nr40athens.com>',
    to: process.env.EMAIL_TO,
    subject: `📅 Νέα Κράτηση — ${booking.fullName} / ${booking.artist}`,
    html: `
      <div style="${baseStyle}padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 8px;">Νέα Κράτηση Ραντεβού</h2>
        <p style="color:#888;font-size:0.85rem;margin:0 0 28px;">${new Date().toLocaleString('el-GR')}</p>

        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;width:40%;">Όνομα</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-weight:bold;">${booking.fullName}</td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;">Τηλέφωνο</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;"><a href="tel:${booking.phone}" style="color:#c9a84c;">${booking.phone}</a></td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;">Email</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;"><a href="mailto:${booking.email}" style="color:#c9a84c;">${booking.email}</a></td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;">Καλλιτέχνης</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#c9a84c;font-weight:bold;">${booking.artist}</td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;">Υπηρεσία</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">${booking.service}</td></tr>
          <tr><td style="padding:12px 0;color:#888;vertical-align:top;">Μήνυμα</td><td style="padding:12px 0;font-style:italic;color:#bbb;">${booking.message || '—'}</td></tr>
        </table>

        ${booking.attachments?.length ? `
          <div style="margin-top:20px;background:#141414;border:1px solid #1e1e1e;padding:16px;">
            <p style="color:#888;font-size:0.82rem;margin:0 0 8px;">ΕΠΙΣΥΝΑΠΤΟΜΕΝΑ ΑΡΧΕΙΑ (${booking.attachments.length})</p>
            ${booking.attachments.map(a => `<a href="${a.url}" style="color:#c9a84c;display:block;font-size:0.85rem;margin-bottom:4px;">↗ ${a.originalName}</a>`).join('')}
          </div>
        ` : ''}

        <div style="margin-top:28px;">
          <a href="mailto:${booking.email}" style="background:#c9a84c;color:#080808;padding:12px 24px;text-decoration:none;font-weight:bold;font-size:0.85rem;display:inline-block;">Απάντηση στον Πελάτη</a>
        </div>

        ${footer('gr')}
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

// ─── BOOKING CONFIRMATION TO CLIENT ───
async function sendBookingConfirmation(booking) {
  const { error } = await resend.emails.send({
    from: 'NR40 Athens <booking@nr40athens.com>',
    to: booking.email,
    subject: `✓ Η κράτησή σου ελήφθη — NR40 Athens`,
    html: `
      <div style="${baseStyle}padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 16px;">Η κράτησή σου ελήφθη! ✓</h2>
        <p style="color:#bbb;margin-bottom:24px;">Γεια σου <strong>${booking.fullName}</strong>,</p>
        <p style="color:#bbb;margin-bottom:24px;">Λάβαμε το αίτημά σου και θα επικοινωνήσουμε μαζί σου <strong style="color:#c9a84c;">εντός 24 ωρών</strong> για να επιβεβαιώσουμε το ραντεβού σου.</p>

        <div style="background:#141414;border:1px solid #1e1e1e;padding:24px;margin-bottom:28px;">
          <p style="color:#888;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">Στοιχεία Κράτησης</p>
          <p style="margin:0 0 8px;"><span style="color:#888;">Καλλιτέχνης:</span> <strong style="color:#c9a84c;">${booking.artist}</strong></p>
          <p style="margin:0 0 8px;"><span style="color:#888;">Υπηρεσία:</span> ${booking.service}</p>
          ${booking.message ? `<p style="margin:0;"><span style="color:#888;">Μήνυμά σου:</span> <em style="color:#bbb;">${booking.message}</em></p>` : ''}
        </div>

        <div style="background:#141414;border-left:3px solid #c9a84c;padding:20px;margin-bottom:28px;">
          <p style="color:#888;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px;">Σημαντικές Πληροφορίες</p>
          <p style="color:#bbb;font-size:0.9rem;margin:0 0 6px;">▸ Απαιτείται προκαταβολή 30% για επιβεβαίωση</p>
          <p style="color:#bbb;font-size:0.9rem;margin:0 0 6px;">▸ Ελάχιστη ηλικία: 18 ετών — φέρε έγκυρη ταυτότητα</p>
          <p style="color:#bbb;font-size:0.9rem;margin:0;">▸ Ωράριο: ${STUDIO.hours}</p>
        </div>

        <p style="color:#bbb;margin-bottom:8px;">Για οποιαδήποτε ερώτηση επικοινώνησε μαζί μας:</p>
        <p style="margin:0;"><a href="tel:${STUDIO.phone}" style="color:#c9a84c;">${STUDIO.phone}</a></p>

        ${footer('gr')}
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

// ─── CONTACT NOTIFICATION TO STUDIO ───
async function sendContactNotification(contact) {
  const { error } = await resend.emails.send({
    from: 'NR40 Contact <contact@nr40athens.com>',
    to: process.env.EMAIL_TO,
    subject: `✉️ Νέο Μήνυμα — ${contact.name}`,
    html: `
      <div style="${baseStyle}padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 8px;">Νέο Μήνυμα Επικοινωνίας</h2>
        <p style="color:#888;font-size:0.85rem;margin:0 0 28px;">${new Date().toLocaleString('el-GR')}</p>

        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;width:40%;">Όνομα</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-weight:bold;">${contact.name}</td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;">Email</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;"><a href="mailto:${contact.email}" style="color:#c9a84c;">${contact.email}</a></td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;color:#888;">Τηλέφωνο</td><td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">${contact.phone ? `<a href="tel:${contact.phone}" style="color:#c9a84c;">${contact.phone}</a>` : '—'}</td></tr>
          <tr><td style="padding:12px 0;color:#888;vertical-align:top;">Μήνυμα</td><td style="padding:12px 0;font-style:italic;color:#bbb;white-space:pre-wrap;">${contact.message}</td></tr>
        </table>

        <div style="margin-top:28px;">
          <a href="mailto:${contact.email}" style="background:#c9a84c;color:#080808;padding:12px 24px;text-decoration:none;font-weight:bold;font-size:0.85rem;display:inline-block;">Απάντηση</a>
        </div>

        ${footer('gr')}
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

// ─── CONTACT AUTO-REPLY TO CLIENT ───
async function sendContactReply(contact) {
  const { error } = await resend.emails.send({
    from: 'NR40 Athens <contact@nr40athens.com>',
    to: contact.email,
    subject: `✓ Λάβαμε το μήνυμά σου — NR40 Athens`,
    html: `
      <div style="${baseStyle}padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 16px;">Ευχαριστούμε! ✓</h2>
        <p style="color:#bbb;margin-bottom:16px;">Γεια σου <strong>${contact.name}</strong>,</p>
        <p style="color:#bbb;margin-bottom:24px;">Λάβαμε το μήνυμά σου και θα επικοινωνήσουμε μαζί σου <strong style="color:#c9a84c;">σύντομα</strong>.</p>

        <div style="background:#141414;border:1px solid #1e1e1e;padding:20px;margin-bottom:28px;">
          <p style="color:#888;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px;">Το Μήνυμά σου</p>
          <p style="color:#bbb;font-style:italic;margin:0;white-space:pre-wrap;">${contact.message}</p>
        </div>

        <p style="color:#bbb;margin-bottom:8px;">Θέλεις να κλείσεις ραντεβού;</p>
        <a href="https://nr40athens.com/booking.html" style="background:#c9a84c;color:#080808;padding:12px 24px;text-decoration:none;font-weight:bold;font-size:0.85rem;display:inline-block;margin-bottom:28px;">Κλείσε Ραντεβού</a>

        ${footer('gr')}
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

module.exports = {
  sendBookingNotification,
  sendBookingConfirmation,
  sendContactNotification,
  sendContactReply,
};