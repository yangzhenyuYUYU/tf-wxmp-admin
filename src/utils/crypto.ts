import * as CryptoJS from 'crypto-js';
import {sm4} from 'sm-crypto';

/**
 * 加密工具类
 */
export class CryptoUtil {
    /**
     * AES 加密
     * @param src 源文本
     * @param keyWord 密钥
     */
    static aesEncrypt(src: string, keyWord: string) {
        const key = CryptoJS.enc.Utf8.parse(keyWord);
        const encrypted = CryptoJS.AES.encrypt(src, key, {
            iv: key,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.NoPadding,
        });
        return encrypted.toString();
    }

    /**
     * AES 解密
     * @param src 加密文本
     * @param keyWord 密钥
     */
    static aesDecrypt(src: string, keyWord: string) {
        const key = CryptoJS.enc.Utf8.parse(keyWord);
        const decrypted = CryptoJS.AES.decrypt(src, key, {
            iv: key,
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.NoPadding,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * SM4 加密
     * @param src 源文本
     * @param keyWord 密钥
     */
    static sm4Encrypt(src: string, keyWord: string) {
        return sm4.encrypt(src, keyWord);
    }

    /**
     * SM4 解密
     * @param src 加密文本
     * @param keyWord 密钥
     */
    static sm4Decrypt(src: string, keyWord: string) {
        return sm4.decrypt(src, keyWord);
    }

    /**
     * Base64 加密
     * @param src 源文本
     */
    static base64Encrypt(src: string) {
        const encodedWord = CryptoJS.enc.Utf8.parse(src);
        return CryptoJS.enc.Base64.stringify(encodedWord);
    }
}

// 导出默认实例
export default CryptoUtil;