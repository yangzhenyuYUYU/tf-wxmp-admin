import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ConfigProvider } from 'antd';

function App() {
  const [count, setCount] = useState(0)

  return (
    <ConfigProvider
      theme={{
        token: {
          // 主色调
          colorPrimary: '#3C8772', // 墨绿色作为主色
          
          // 文字颜色
          colorText: '#2C3E50', // 深灰色文字
          colorTextSecondary: '#607D8B', // 次要文字颜色
          
          // 背景色
          colorBgContainer: '#FFFFFF', // 白色背景
          colorBgLayout: '#F5F7FA', // 浅灰背景
          
          // 边框和分割线
          colorBorder: '#E8F0EB', // 浅绿色边框
          
          // 链接颜色
          colorLink: '#3C8772',
          colorLinkHover: '#4EA08D',
          colorLinkActive: '#2A6153',
          
          // 成功、警告、错误状态色
          colorSuccess: '#52C41A',
          colorWarning: '#F5A623', // 橙色警告
          colorError: '#F5222D',
          
          // 其他自定义配置
          borderRadius: 4, // 圆角
          controlHeight: 36, // 控件高度
        },
        components: {
          Button: {
            colorPrimary: '#3C8772',
            algorithm: true, // 启用算法
          },
          Menu: {
            colorItemBg: '#FFFFFF',
            colorSubItemBg: '#FFFFFF',
            colorItemText: '#2C3E50',
            colorItemTextSelected: '#3C8772',
            colorItemBgSelected: '#E8F0EB',
          },
          Layout: {
            colorBgHeader: '#FFFFFF',
            colorBgBody: '#F5F7FA',
            colorBgTrigger: '#3C8772',
          },
        },
      }}
    >
      <div> 
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </ConfigProvider>
  )
}

export default App
