import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css'; // Import Ant Design styles
import App from './App.jsx';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

createRoot(document.getElementById('root')).render(
  <ConfigProvider>
    <StyleProvider hashPriority="high">
      <App />
    </StyleProvider>
  </ConfigProvider>
);
