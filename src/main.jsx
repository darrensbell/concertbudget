import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ConfigProvider, App as AntApp } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import './styles/theme.css';

createRoot(document.getElementById('root')).render(
  <ConfigProvider>
    <StyleProvider hashPriority="high">
      <AntApp>
        <App />
      </AntApp>
    </StyleProvider>
  </ConfigProvider>
);
