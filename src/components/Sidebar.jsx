import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Space } from 'antd';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { SettingOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await getDocs(collection(db, 'shows'));
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const mainMenuItems = [
    {
      key: '/',
      label: <NavLink to="/">Shows</NavLink>,
    },
    {
      key: '/create-show',
      label: <NavLink to="/create-show">Create Show</NavLink>,
    },
  ];

  const settingsMenuItems = [
    {
      key: '/settings/budget-categories',
      icon: <SettingOutlined />,
      label: <NavLink to="/settings/budget-categories">Settings</NavLink>,
    },
  ];

  return (
    <Sider width={260} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <Title level={4}>Concert</Title>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={mainMenuItems}
        style={{ flex: 1 }}
      />
      <div style={{ padding: '1rem' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={settingsMenuItems}
        />
      </div>
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', padding: '0 1rem' }}>
        <Space>
            <DatabaseOutlined style={{ color: isConnected ? '#52c41a' : '#ff4d4f' }} />
            <Typography.Text style={{ color: isConnected ? '#52c41a' : '#ff4d4f' }}>
            {isConnected ? 'DB Connected' : 'DB Disconnected'}
            </Typography.Text>
        </Space>
      </div>
    </Sider>
  );
};

export default Sidebar;
