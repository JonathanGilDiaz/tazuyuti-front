import { Injectable } from '@angular/core';
import { privateKey, publicKey } from '@app/config';
import JSEncrypt from 'jsencrypt';

@Injectable({
  providedIn: 'root'
})
export class EncryptTextService {

  encrypt$ :JSEncrypt ;
  constructor() {
    this.encrypt$ = new JSEncrypt();
  }

  /**
   * 
   * @param text Param to encrypt
   * @returns encrypted param
   */
  encrypt(text : string) : string {
    this.encrypt$.setPublicKey(publicKey);
    let value = this.encrypt$.encrypt(text);
      return (!Object.is(value,false))? value.toString() : '';
  }

  decrypt(text : string) : string {
    this.encrypt$.setPrivateKey(privateKey);
		let value = this.encrypt$.decrypt(text);
    return (!Object.is(value,false))? value.toString() : '';
  }
}
