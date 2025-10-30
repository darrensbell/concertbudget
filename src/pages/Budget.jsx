import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Table, Spin, Typography } from 'antd';

const { Title } = Typography;

function Budget() {
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetCategories = async () => {
      try {
        setLoading(true);
        const budgetCollection = collection(db, 'budgetCategories');
        const budgetSnapshot = await getDocs(budgetCollection);
        const budgetList = budgetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBudgetCategories(budgetList);
      } catch (error) {
        console.error("Error fetching budget categories: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetCategories();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Summary Group',
      dataIndex: 'summaryGroup',
      key: 'summaryGroup',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Sub Department',
      dataIndex: 'subDepartment',
      key: 'subDepartment',
    },
    {
      title: 'Line Item',
      dataIndex: 'lineItem',
      key: 'lineItem',
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: '2rem' }}>Budget Categories</Title>
      <Table
        dataSource={budgetCategories}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
}

export default Budget;
