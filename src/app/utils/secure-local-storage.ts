import * as CryptoJS from 'crypto-js';

const secretKey = 'f5dA$#@23rwe1CVsdf%Hjs82L'; // Una clave aleatoria y segura

(function () {
  // Guardar una referencia de los métodos originales
  const originalSetItem = Storage.prototype.setItem;
  const originalGetItem = Storage.prototype.getItem;

  // Sobrescribir el método setItem
  Storage.prototype.setItem = function (key: string, value: any): void {
    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      secretKey
    ).toString();
    originalSetItem.call(this, key, encryptedValue);
  };

  // Sobrescribir el método getItem
  Storage.prototype.getItem = function (key: string): any {
    const encryptedValue = originalGetItem.call(this, key);
    if (encryptedValue) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedValue, secretKey);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      } catch (error) {
        console.error('Error al desencriptar los datos', error);
        return null;
      }
    }
    return null;
  };
})();
