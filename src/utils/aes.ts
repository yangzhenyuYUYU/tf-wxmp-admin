import CryptoJS from 'crypto-js';
import seedrandom from 'seedrandom';

export class AESUtil {
    private static key = 'tff-32243f8e-5404-42bd-b52e-16be';
    private static rng = seedrandom(AESUtil.key); // 使用密钥作为种子

    // 自定义随机数生成器
    static {
        CryptoJS.lib.WordArray.random = (nBytes: number) => {
            const words = [];
            for (let i = 0; i < nBytes; i++) {
                words.push(Math.floor(this.rng() * 0x100000000)); // 添加Math.floor确保整数
            }
            return CryptoJS.lib.WordArray.create(words, nBytes);
        };
    }

    static encrypt(data: any): string | null {
        try {
            // 生成随机初始向量
            const iv = CryptoJS.lib.WordArray.random(16);
            // 将密钥转换为 WordArray 格式
            const keyWords = CryptoJS.enc.Utf8.parse(this.key);
            
            // 加密数据
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), keyWords, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            // 将 IV 和密文组合成一个对象并转为 base64
            const result = {
                iv: CryptoJS.enc.Base64.stringify(iv),
                ciphertext: encrypted.toString()
            };

            // 使用 btoa 进行 base64 编码，与后端保持一致
            return btoa(JSON.stringify(result));
        } catch (error) {
            console.error('加密失败:', error instanceof Error ? error.message : String(error));
            return null;
        }
    }

    static decrypt(encrypted: string): any {
        try {
            // 使用 atob 进行 base64 解码
            const encryptedJson = atob(encrypted);
            const encryptedData = JSON.parse(encryptedJson);
            
            // 解析 IV 和密文
            const iv = CryptoJS.enc.Base64.parse(encryptedData.iv);
            const encryptedText = CryptoJS.enc.Base64.parse(encryptedData.ciphertext);
            const keyWords = CryptoJS.enc.Utf8.parse(this.key);

            // 解密数据
            const decrypted = CryptoJS.AES.decrypt(
                CryptoJS.lib.CipherParams.create({
                    ciphertext: encryptedText
                }),
                keyWords,
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );

            // 转换为字符串并解析 JSON
            return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            console.error('解密失败:', error instanceof Error ? error.message : String(error));
            return null;
        }
    }
}

export default AESUtil;