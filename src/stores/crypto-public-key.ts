import { defineStore } from 'pinia'

export const useCryptoPublicKeyStore = defineStore('cryptoPublicKey', {
  state: () => ({
    RSAPublicKey: null as CryptoKey | null,
  }),
  actions: {
    getRSAPublickey() {
      return this.RSAPublicKey
    },
    setRSAPublickey(publickey: CryptoKey) {
      this.RSAPublicKey = publickey
    },
  },
})
