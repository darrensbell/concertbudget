import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import Shows from './pages/Shows';
import CreateShow from './pages/CreateShow';
import EditShow from './pages/EditShow';
import CreateBudget from './pages/CreateBudget';
import BudgetCategorySettings from './pages/BudgetCategorySettings';
import Recoupment from './pages/recoupment/Recoupment';

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
              <Route path="/create-show" element={<CreateShow />} />
              <Route path="/edit-show/:id" element={<EditShow />} />
              <Route path="/create-budget/:showId/:dateIndex" element={<CreateBudget />} />
              <Route path="/settings/budget-categories" element={<BudgetCategorySettings />} />
              <Route path="/shows/:showId/recoupment" element={<Recoupment />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
