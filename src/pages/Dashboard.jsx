
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { List, Spin, Card, Statistic } from 'antd';
import styles from './Dashboard.module.css';
import PageHeader from '../components/PageHeader';

const Dashboard = () => {
  const [shows, setShows] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({ total: 0, spent: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showsSnapshot, budgetsSnapshot] = await Promise.all([
          getDocs(collection(db, 'shows')),
          getDocs(collection(db, 'budgets'))
        ]);

        const showsList = showsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShows(showsList);

        let totalBudget = 0;
        let totalSpent = 0;

        budgetsSnapshot.forEach(doc => {
          const budget = doc.data();
          if (budget.totalBudget) {
            totalBudget += budget.totalBudget;
          }
          if (budget.expenses) {
            const showSpent = budget.expenses.reduce((acc, expense) => acc + expense.amount, 0);
            totalSpent += showSpent;
          }
        });

        setBudgetSummary({
          total: totalBudget,
          spent: totalSpent,
          remaining: totalBudget - totalSpent
        });

      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.dashboard}>
      <PageHeader title="Dashboard" />
      
      <div className={styles.widgetsContainer}>
        <Card title="Upcoming Shows" className={styles.widget}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Spin />
            </div>
          ) : (
            <List
              dataSource={shows}
              renderItem={show => (
                <List.Item>
                  <div>{show.name}</div>
                </List.Item>
              )}
            />
          )}
        </Card>

        <Card title="Budget Overview" className={styles.widget}>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Spin />
            </div>
          ) : (
            <div className={styles.budgetSummary}>
                <Statistic title="Total Budget" value={budgetSummary.total} prefix="$" />
                <Statistic title="Total Spent" value={budgetSummary.spent} prefix="$" />
                <Statistic title="Remaining" value={budgetSummary.remaining} prefix="$" />
            </div>
            )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
