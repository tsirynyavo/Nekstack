const QRCode = require('qrcode');

class MvolaService {
  // Format USSD correct
  genererCodeUSSD(numeroTelephone, montant) {
    return `#111*1*2*${numeroTelephone}*${montant}*1*Salaire#`;
  }

  // Générer QR Code
  async genererQRCode(codeUSSD) {
    try {
      const qrCodeImage = await QRCode.toDataURL(`tel:${codeUSSD}`);
      return qrCodeImage;
    } catch (error) {
      console.error('❌ Erreur génération QR Code:', error);
      throw error;
    }
  }

  // Valider le numéro
  validerNumeroMVola(numero) {
    return numero && numero.match(/^03[2-9][0-9]{7}$/);
  }
}

module.exports = new MvolaService();