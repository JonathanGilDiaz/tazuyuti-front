import { Injectable } from '@angular/core';
import JSEncrypt from 'jsencrypt';

@Injectable({
  providedIn: 'root'
})
export class EncryptTextService {
  
  private encryptor: JSEncrypt;
  private publicKey: string = `
    -----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzWNdCyDKJIET8htt1HLt5KfrHQcyp+9OcOsQNoavefCkx1LL5w86jj2bHDPZW2iYee9KoO0vpYFt+ngYXUMC79vM0NE+EQ8cbSFu2Jn5CQyxu2gNXvByo623zqq333BiPBvp+TyVv9Y98AgNDW01il6MglhyxYmopuFuilkHJWfcBN6oYOKtlVAlJpMwKs8OXKbzLu19bdX6kSnJsyvk+PNfPESnEiO8aw5mqsuw8hztAss21GWKvcoORk5HXl5anjFI01HAFyE+9pgEHpzCpiuZP+FxieuzBZjqtdyJFm5TIA4aQNwJTm5cEcsFzvO/TKU0K9OYb0bCDvJeAOb0wIDAQAB
    -----END PUBLIC KEY-----
  `;

  constructor() {
    this.encryptor = new JSEncrypt();
    this.encryptor.setPublicKey(this.publicKey);
  }

  encrypt(data: string): string {
    const encrypted = this.encryptor.encrypt(data);
    if (!encrypted) {
      console.error("Error al encriptar los datos");
      return "";
    }
    return encrypted;
  }
}
