import { useCryptoPublicKeyStore } from '@/stores/crypto-public-key'
import { cryptoApiService } from './api/crypto/crypto-api'

interface HybridPayload {
  key: string
  iv: string
  body: string
}

export const cryptoService = {
  /**
   * 產生混合加密封包（Hybrid Encryption）
   *
   * 流程：
   * 1. 隨機產生 AES-GCM 256-bit 金鑰
   * 2. 以 AES-GCM 加密 request body
   * 3. 取得 RSA 公鑰，以 RSA-OAEP 加密 AES 金鑰
   *
   * @param requestBody - 要加密的請求資料
   * @returns 包含加密後 AES 金鑰（key）與加密後資料（body）的封包
   */
  async getHybridPayload<T>(requestBody: T): Promise<HybridPayload> {
    const AESKey = await this.generateKey()
    const { iv, body } = await this.encryptBody(AESKey, requestBody)
    const RSAKey = await this.getPublicKey()
    const encryptedAESKey = await this.encryptKey(RSAKey, AESKey)
    return {
      key: btoa(String.fromCharCode(...encryptedAESKey)),
      iv: btoa(String.fromCharCode(...iv)),
      body: btoa(String.fromCharCode(...body)),
    }
  },

  /**
   * 隨機產生 AES-GCM 256-bit 金鑰
   *
   * @returns 可用於加解密的 CryptoKey
   */
  async generateKey(): Promise<CryptoKey> {
    const AESKey = window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ])

    return AESKey
  },

  /**
   * 以 AES-GCM 加密任意資料
   *
   * 資料會先經過 JSON.stringify 後再以 TextEncoder 編碼為 Uint8Array。
   *
   * @param key - AES-GCM CryptoKey
   * @param data - 要加密的資料
   * @returns 加密後的 Uint8Array
   */
  async encryptBody<T>(key: CryptoKey, data: T): Promise<{ iv: Uint8Array<ArrayBuffer>; body: Uint8Array<ArrayBuffer> }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(JSON.stringify(data))
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
    return { iv, body: new Uint8Array(encrypted) }
  },

  /**
   * 以 RSA-OAEP 加密 AES 金鑰
   *
   * 先將 AES CryptoKey export 為原始 bytes（raw），再以 RSA 公鑰加密。
   *
   * @param rsaKey - RSA-OAEP 公鑰
   * @param aesKey - 要加密的 AES CryptoKey
   * @returns 加密後的 Uint8Array
   */
  async encryptKey(rsaKey: CryptoKey, aesKey: CryptoKey): Promise<Uint8Array<ArrayBuffer>> {
    const rawAESKey = await crypto.subtle.exportKey('raw', aesKey)
    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKey, rawAESKey)
    return new Uint8Array(encrypted)
  },

  /**
   * 取得 RSA-OAEP 公鑰（CryptoKey）
   *
   * 優先從 store 快取取得；若尚未快取，則向 API 拉取 PEM 格式公鑰並 import。
   * import 成功後會存入 store 供後續使用。
   *
   * @returns RSA-OAEP CryptoKey（hash: SHA-512）
   */
  async getPublicKey(): Promise<CryptoKey> {
    let publickey = useCryptoPublicKeyStore().getRSAPublickey()
    if (!publickey) {
      const publickeyString = await cryptoApiService.getPublicKey()
      // base64解碼
      const binaryDer = window.atob(publickeyString)
      // 轉為ArrayBuffer二進制字串
      const binary = this.str2ab(binaryDer)
      publickey = await window.crypto.subtle.importKey(
        'spki',
        binary,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-512', // 保持一致
        },
        true,
        ['encrypt'],
      )
      useCryptoPublicKeyStore().setRSAPublickey(publickey)
    }

    return publickey
  },

  /**
   * 將二進位字串轉為 ArrayBuffer
   *
   * @param str - base64 解碼後的二進位字串
   * @returns ArrayBuffer
   */
  str2ab(str: string) {
    const buf = new ArrayBuffer(str.length)
    const bufView = new Uint8Array(buf)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  },
}
