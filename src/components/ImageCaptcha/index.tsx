import React, { useEffect, useRef } from 'react';
import styles from './index.module.less';

interface ImageCaptchaProps {
  width?: number;
  height?: number;
  onChange?: (code: string) => void;
}

const ImageCaptcha: React.FC<ImageCaptchaProps> = ({
  width = 120,
  height = 40,
  onChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 生成随机颜色
  const randomColor = (min: number, max: number) => {
    const r = Math.floor(Math.random() * (max - min) + min);
    const g = Math.floor(Math.random() * (max - min) + min);
    const b = Math.floor(Math.random() * (max - min) + min);
    return `rgb(${r},${g},${b})`;
  };

  // 生成验证码
  const generateCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置背景色
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, width, height);
    
    // 定义验证码内容
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    
    // 绘制4个随机字符
    for (let i = 0; i < 4; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      code += char;
      
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = randomColor(50, 160);
      ctx.textBaseline = 'middle';
      
      // 随机旋转角度
      const rotate = (Math.random() - 0.5) * 0.3;
      ctx.translate(30 * i + 15, height / 2);
      ctx.rotate(rotate);
      ctx.fillText(char, 0, 0);
      ctx.rotate(-rotate);
      ctx.translate(-(30 * i + 15), -height / 2);
    }
    
    // 绘制干扰线
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = randomColor(40, 180);
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }
    
    // 绘制干扰点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = randomColor(0, 255);
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    onChange?.(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={styles.captcha}
      onClick={() => generateCaptcha()}
    />
  );
};

export default ImageCaptcha; 