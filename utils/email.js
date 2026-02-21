const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── BOOKING NOTIFICATION TO STUDIO ───
async function sendBookingNotification(booking) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `📅 Νέα Κράτηση — ${booking.fullName} / ${booking.artist}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f0ece4;padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 24px;">Νέα Κράτηση Ραντεβού</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;width:40%;">Όνομα</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">${booking.fullName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;">Τηλέφωνο</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">${booking.phone}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;">Email</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">${booking.email}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;">Καλλιτέχνης</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#c9a84c;">${booking.artist}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;">Υπηρεσία</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">${booking.service}</td></tr>
          <tr><td style="padding:10px 0;color:#888;vertical-align:top;">Μήνυμα</td><td style="padding:10px 0;">${booking.message || '—'}</td></tr>
        </table>
        ${booking.attachments?.length ? `<p style="margin-top:20px;color:#888;">Αρχεία: ${booking.attachments.length} αρχείο(α) επισυνάφθηκε</p>` : ''}
        <p style="margin-top:32px;color:#555;font-size:0.85rem;">Ink Temple · ${new Date().toLocaleString('el-GR')}</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

// ─── BOOKING CONFIRMATION TO CLIENT ───
async function sendBookingConfirmation(booking) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: booking.email,
    subject: `✓ Η κράτησή σου ελήφθη — Ink Temple`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f0ece4;padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 16px;">Η κράτησή σου ελήφθη!</h2>
        <p style="color:#bbb;margin-bottom:24px;">Γεια σου ${booking.fullName},</p>
        <p style="color:#bbb;margin-bottom:24px;">Λάβαμε το αίτημά σου για ραντεβού με τον/την <strong style="color:#c9a84c;">${booking.artist}</strong>. Θα επικοινωνήσουμε μαζί σου εντός 24 ωρών για να επιβεβαιώσουμε.</p>
        <div style="background:#141414;border:1px solid #1e1e1e;padding:20px;margin-bottom:24px;">
          <p style="color:#888;margin:0 0 8px;font-size:0.85rem;">ΥΠΗΡΕΣΙΑ</p>
          <p style="margin:0;">${booking.service}</p>
        </div>
        <p style="color:#555;font-size:0.85rem;">Ink Temple Studio<br>Αθήνα, Ελλάδα</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

// ─── CONTACT NOTIFICATION TO STUDIO ───
async function sendContactNotification(contact) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `✉️ Νέο Μήνυμα — ${contact.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f0ece4;padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 24px;">Νέο Μήνυμα Επικοινωνίας</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;width:40%;">Όνομα</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">${contact.name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;">Email</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">${contact.email}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;color:#888;">Τηλέφωνο</td><td style="padding:10px 0;border-bottom:1px solid #1e1e1e;">${contact.phone || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#888;vertical-align:top;">Μήνυμα</td><td style="padding:10px 0;">${contact.message}</td></tr>
        </table>
        <p style="margin-top:32px;color:#555;font-size:0.85rem;">Ink Temple · ${new Date().toLocaleString('el-GR')}</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

// ─── CONTACT AUTO-REPLY ───
async function sendContactReply(contact) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: contact.email,
    subject: `✓ Λάβαμε το μήνυμά σου — Ink Temple`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f0f;color:#f0ece4;padding:40px;">
        <h2 style="color:#c9a84c;font-size:1.4rem;margin:0 0 16px;">Ευχαριστούμε!</h2>
        <p style="color:#bbb;margin-bottom:16px;">Γεια σου ${contact.name},</p>
        <p style="color:#bbb;margin-bottom:24px;">Λάβαμε το μήνυμά σου και θα επικοινωνήσουμε μαζί σου σύντομα.</p>
        <p style="color:#555;font-size:0.85rem;">Ink Temple Studio<br>Αθήνα, Ελλάδα</p>
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