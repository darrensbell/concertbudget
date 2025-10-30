
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import Shows from './pages/Shows';
import Budget from './pages/Budget';
import CreateShow from './pages/CreateShow';
import EditShow from './pages/EditShow';
import CreateBudget from './pages/CreateBudget';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Content style={{ padding: '2rem 3rem' }}>
            <Routes>
              <Route path="/" element={<Shows />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/create-show" element={<CreateShow />} />
              <Route path="/edit-show/:id" element={<EditShow />} />
              <Route path="/create-budget/:showId/:dateIndex" element={<CreateBudget />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
