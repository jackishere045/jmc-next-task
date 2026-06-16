const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  const all = upper + lower + digits + special;

  let pass = '';
  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += digits[Math.floor(Math.random() * digits.length)];
  pass += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 12; i++) {
    pass += all[Math.floor(Math.random() * all.length)];
  }

  return pass.split('').sort(() => Math.random() - 0.5).join('');
};

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captcha = '';
  for (let i = 0; i < 5; i++) {
    captcha += chars[Math.floor(Math.random() * chars.length)];
  }
  return captcha;
};

const hitungUsia = (tanggalLahir) => {
  const today = new Date();
  const birth = new Date(tanggalLahir);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const hitungMasaKerja = (tanggalMasuk) => {
  const today = new Date();
  const masuk = new Date(tanggalMasuk);
  let years = today.getFullYear() - masuk.getFullYear();
  const m = today.getMonth() - masuk.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < masuk.getDate())) years--;
  return years;
};

const parseUA = (uaString = '') => {
  let browser = 'Unknown';
  let platform = 'Unknown';

  if (uaString.includes('Chrome')) browser = 'Chrome';
  else if (uaString.includes('Firefox')) browser = 'Firefox';
  else if (uaString.includes('Safari')) browser = 'Safari';
  else if (uaString.includes('Edge')) browser = 'Edge';

  if (uaString.includes('Windows')) platform = 'Windows';
  else if (uaString.includes('Mac')) platform = 'MacOS';
  else if (uaString.includes('Linux')) platform = 'Linux';
  else if (uaString.includes('Android')) platform = 'Android';
  else if (uaString.includes('iPhone')) platform = 'iOS';

  return { browser, platform };
};

module.exports = { generatePassword, generateCaptcha, hitungUsia, hitungMasaKerja, parseUA };