const nodemailer = require("nodemailer");

async function sendEmailConges(employeEmail, employeNom, statut, dateDebut, dateFin) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const sujet = `Mise à jour de votre demande de congé`;
  const texte = `Bonjour ${employeNom},\n\n` +
                `Votre demande de congé du ${dateDebut} au ${dateFin} a été mise à jour.\n` +
                `Statut actuel : ${statut.toUpperCase()}\n\n` +
                `Merci de consulter votre espace RH pour plus de détails.\n\n` +
                `Cordialement,\nService RH`;

  try {
    const info = await transporter.sendMail({
      from: `"Service RH" <${process.env.EMAIL_USER}>`,
      to: employeEmail,
      subject: sujet,
      text: texte,
    });
    console.log("✅ Email envoyé :", info.response);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi :", err);
  }
}

module.exports = sendEmailConges;
