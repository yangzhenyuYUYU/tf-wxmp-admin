import * as CryptoJS from 'crypto-js';

const KEY = 'tf_xzs_admin';

export class AESUtil {
    /**
     * ECB 模式加密
     * @param src 源文本
     */
    static encryptECB(src: string) {
        const key = CryptoJS.enc.Utf8.parse(KEY);
        const encrypted = CryptoJS.AES.encrypt(src, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    /**
     * ECB 模式解密
     * @param src 加密文本
     */
    static decryptECB(src: string) {
        const key = CryptoJS.enc.Utf8.parse(KEY);
        const decrypted = CryptoJS.AES.decrypt(src, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * CBC 模式加密
     * @param src 源文本
     */
    static encryptCBC(src: string) {
        const key = CryptoJS.enc.Utf8.parse(KEY);
        const iv = CryptoJS.enc.Utf8.parse(KEY); // 使用相同的key作为iv
        const encrypted = CryptoJS.AES.encrypt(src, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    /**
     * CBC 模式解密
     * @param src 加密文本
     */
    static decryptCBC(src: string) {
        const key = CryptoJS.enc.Utf8.parse(KEY);
        const iv = CryptoJS.enc.Utf8.parse(KEY); // 使用相同的key作为iv
        const decrypted = CryptoJS.AES.decrypt(src, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * CFB 模式加密
     * @param src 源文本
     */
    static encryptCFB(src: string) {
        const key = CryptoJS.enc.Utf8.parse(KEY);
        const iv = CryptoJS.enc.Utf8.parse(KEY);
        const encrypted = CryptoJS.AES.encrypt(src, key, {
            iv: iv,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    /**
     * CFB 模式解密
     * @param src 加密文本
     */
    static decryptCFB(src: string) {
        const key = CryptoJS.enc.Utf8.parse(KEY);
        const iv = CryptoJS.enc.Utf8.parse(KEY);
        const decrypted = CryptoJS.AES.decrypt(src, key, {
            iv: iv,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}

export default AESUtil; 