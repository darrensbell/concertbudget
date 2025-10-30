import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layout, Menu, Tag, Typography } from 'antd';
import { db } from '../services/firebase'; // Assuming firebase is initialized here
import { collection, getDocs } from 'firebase/firestore';

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
    checkConnection();
  }, []);

  return (
    <Sider width={260} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <Title level={4}>Concert</Title>
      </div>
      <Menu mode="inline" selectedKeys={[location.pathname]}>
        <Menu.Item key="/">
          <NavLink to="/">Shows</NavLink>
        </Menu.Item>
        <Menu.Item key="/create-show">
          <NavLink to="/create-show">Create Show</NavLink>
        </Menu.Item>
      </Menu>
      <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', padding: '0 1rem' }}>
        <Tag color={isConnected ? 'green' : 'red'}>
          {isConnected ? 'DB Connected' : 'DB Disconnected'}
        </Tag>
      </div>
    </Sider>
  );
};

export default Sidebar;
