import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import Shows from './pages/Shows';
import ArchivedShows from './pages/ArchivedShows';
import CreateShow from './pages/CreateShow';
import EditShow from './pages/EditShow';
import CreateBudget from './pages/CreateBudget';
import BudgetCategorySettings from './pages/BudgetCategorySettings';
import Recoupment from './pages/recoupment/Recoupment';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import BudgetHistory from './pages/BudgetHistory';
import './styles/theme.css';
import './styles/transitions.css';

const { Content } = Layout;

function App() {
  const location = useLocation();
  const nodeRef = useRef(null);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content style={{ padding: '2rem 3rem' }}>
          <Breadcrumbs />
          <TransitionGroup>
            <CSSTransition key={location.key} nodeRef={nodeRef} classNames="fade" timeout={300}>
              <div ref={nodeRef}>
                <Routes location={location}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/shows" element={<Shows />} />
                  <Route path="/archived-shows" element={<ArchivedShows />} />
                  <Route path="/create-show" element={<CreateShow />} />
                  <Route path="/edit-show/:id" element={<EditShow />} />
                  <Route path="/create-budget/:showId/:dateIndex" element={<CreateBudget />} />
                  <Route path="/settings/budget-categories" element={<BudgetCategorySettings />} />
                  <Route path="/shows/:showId/recoupment" element={<Recoupment />} />
                  <Route path="/shows/:showId/budget-history" element={<BudgetHistory />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </CSSTransition>
          </TransitionGroup>
        </Content>
      </Layout>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
    </Layout>
  );
}

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;