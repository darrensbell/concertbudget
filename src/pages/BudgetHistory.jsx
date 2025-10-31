
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Timeline, Typography, Spin, Empty } from 'antd';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const { Text } = Typography;

function BudgetHistory() {
  const { showId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetHistory = async () => {
      try {
        setLoading(true);
        const historyQuery = query(
          collection(db, 'budgetHistory'),
          where('showId', '==', showId),
          orderBy('timestamp', 'desc')
        );
        const historySnapshot = await getDocs(historyQuery);
        const historyList = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(historyList);
      } catch (error) {
        console.error("Error fetching budget history: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetHistory();
  }, [showId]);

  return (
    <div>
      <PageHeader title="Budget History" />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Spin size="large" />
        </div>
      ) : history.length > 0 ? (
        <Timeline mode="alternate">
          {history.map(item => (
            <Timeline.Item key={item.id}>
              <Text strong>{format(item.timestamp.toDate(), 'PPP p')}</Text>
              <p>{item.change}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty
          description={
            <Typography.Text type="secondary">No budget history found for this show.</Typography.Text>
          }
        />
      )}
    </div>
  );
}

export default BudgetHistory;
