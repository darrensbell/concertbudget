import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import ShowCard from '../components/ShowCard';
import { Typography, Spin, Empty } from 'antd';

const { Title } = Typography;

function Shows() {
  const [shows, setShows] = useState([]);
  const [existingBudgets, setExistingBudgets] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowsAndBudgets = async () => {
      try {
        setLoading(true);
        const [showsSnapshot, budgetsSnapshot] = await Promise.all([
          getDocs(collection(db, 'shows')),
          getDocs(collection(db, 'budgets'))
        ]);

        const showsList = showsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const budgetKeys = new Set();
        budgetsSnapshot.forEach(doc => {
          const budget = doc.data();
          if(budget.showId && budget.showDate && budget.showDate.date) {
            const key = `${budget.showId}_${budget.showDate.date}`;
            budgetKeys.add(key);
          }
        });

        setShows(showsList);
        setExistingBudgets(budgetKeys);

      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowsAndBudgets();
  }, []);

  return (
    <div>
      <Title level={2} style={{ marginBottom: '2rem' }}>Upcoming Shows</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Spin size="large" />
        </div>
      ) : shows.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
          {shows.map(show => (
            <ShowCard key={show.id} show={show} existingBudgets={existingBudgets} />
          ))}
        </div>
      ) : (
        <Empty
          description={
            <Typography.Text type="secondary">No upcoming shows found.</Typography.Text>
          }
        />
      )}
    </div>
  );
}

export default Shows;
