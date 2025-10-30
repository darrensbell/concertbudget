
import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { debounce } from 'lodash';
import { Input, InputNumber, Select, Button, Typography, Spin, Popconfirm, Card } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridHeader: {
    display: 'flex',
    padding: '8px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  gridRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #f0f0f0',
  },
  cell: {
    padding: '8px',
    flex: 1,
  },
  departmentCell: {
    flex: 1.5,
  },
  subDepartmentCell: {
    flex: 1.5,
  },
  lineItemCell: {
    flex: 2,
  },
  numberCell: {
    flex: 0.5,
  },
  quantityCell: {
    flex: 0.5,
  },
  typeCell: {
    flex: 1,
  },
  rateCell: {
    flex: 1,
  },
  totalCell: {
    flex: 1,
  },
  actionCell: {
    flex: 0.5,
  },
  summaryGroupHeader: {
      padding: '16px 8px',
      backgroundColor: '#f0f2f5',
      borderBottom: '1px solid #e8e8e8',
      borderTop: '2px solid #e8e8e8',
  },
  subtotalRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 8px',
    borderBottom: '2px solid #e8e8e8',
    backgroundColor: '#f9f9f9',
  },
  grandTotalRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 8px',
    marginTop: '1rem',
  },
};

const GridHeader = () => (
  <div style={styles.gridHeader}>
    <div style={{...styles.cell, ...styles.departmentCell}}><Text strong>Department</Text></div>
    <div style={{...styles.cell, ...styles.subDepartmentCell}}><Text strong>Sub-Department</Text></div>
    <div style={{...styles.cell, ...styles.lineItemCell}}><Text strong>Line Item</Text></div>
    <div style={{...styles.cell, ...styles.numberCell}}><Text strong>Number</Text></div>
    <div style={{...styles.cell, ...styles.quantityCell}}><Text strong>Quantity</Text></div>
    <div style={{...styles.cell, ...styles.typeCell}}><Text strong>Type</Text></div>
    <div style={{...styles.cell, ...styles.rateCell}}><Text strong>Rate (£)</Text></div>
    <div style={{...styles.cell, ...styles.totalCell}}><Text strong>Total (£)</Text></div>
    <div style={{...styles.cell, ...styles.actionCell}}><Text strong>Action</Text></div>
  </div>
);

const CreateBudget = () => {
  const { showId, dateIndex } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [budget, setBudget] = useState([]);
  const [budgetId, setBudgetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSave = useCallback(
    debounce(async (id, budgetDetails) => {
      try {
        const budgetDocRef = doc(db, 'budgets', id);
        await updateDoc(budgetDocRef, { budgetDetails });
      } catch (err) {
        console.error("Error updating budget:", err);
        setError("Failed to save changes.");
      }
    }, 1500),
    []
  );

  useEffect(() => {
    const showDocRef = doc(db, 'shows', showId);
    getDoc(showDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const showData = { ...docSnap.data(), id: docSnap.id };
        if (showData.showDates && showData.showDates[dateIndex]) {
          setShow(showData);
        } else {
          setError("Invalid show date index."); setLoading(false);
        }
      } else {
        setError("Show not found."); setLoading(false);
      }
    }).catch(err => {
      console.error("Error fetching show:", err);
      setError("Failed to load show data."); setLoading(false);
    });
  }, [showId, dateIndex]);

  useEffect(() => {
    if (!show || !show.id) return;

    const showDate = show.showDates[dateIndex].date;
    const budgetQuery = query(
      collection(db, 'budgets'),
      where('showId', '==', show.id),
      where('showDate.date', '==', showDate)
    );

    const unsubscribe = onSnapshot(budgetQuery, async (snapshot) => {
      if (snapshot.empty) {
        if (isCreating) return;
        setIsCreating(true);
        setLoading(true);
        try {
          const categoriesSnapshot = await getDocs(collection(db, 'budgetCategories'));
          const categoriesList = categoriesSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
          categoriesList.sort((a, b) => a.id.localeCompare(b.id));

          const initialBudgetDetails = categoriesList.map(category => ({
            ...category,
            number: 1, quantity: 1, type: 'Allocation', rate: 0,
            total: 0,
          }));

          await addDoc(collection(db, 'budgets'), {
            showId: show.id, showName: show.name, showDate: show.showDates[dateIndex],
            budgetDetails: initialBudgetDetails, createdAt: new Date(),
          });
        } catch (err) {
          console.error("FATAL: Could not auto-create budget:", err);
          setError("Failed to create budget. Are budget categories seeded?");
        } finally {
          setIsCreating(false); setLoading(false);
        }
      } else {
        setLoading(true);
        const budgetDoc = snapshot.docs[0];
        setBudgetId(budgetDoc.id);
        const budgetData = budgetDoc.data();
        const budgetDetails = (budgetData.budgetDetails || []).map(item => ({
            ...item,
            total: (item.rate || 0) * (item.quantity || 1) * (item.number || 1)
        }));
        setBudget(budgetDetails);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore snapshot listener error:", err);
      setError("An error occurred while connecting to the database.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [show, dateIndex, isCreating]);

  const handleBudgetChange = (itemId, field, value) => {
    const newBudget = budget.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.total = (updatedItem.rate || 0) * (updatedItem.quantity || 1) * (updatedItem.number || 1);
        return updatedItem;
      }
      return item;
    });
    setBudget(newBudget);
    if (budgetId) {
      debouncedSave(budgetId, newBudget);
    }
  };
  
  const handleDeleteLineItem = (itemId) => {
    const newBudget = budget.filter(item => item.id !== itemId);
    setBudget(newBudget);
    if (budgetId) {
      debouncedSave(budgetId, newBudget);
    }
  };

  const handleDeleteBudget = async () => {
    if (!budgetId) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'budgets', budgetId));
      navigate('/');
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete the budget.");
      setLoading(false);
    }
  };

  const groupedBudget = useMemo(() => {
    const summaryGroupsInOrder = [...new Set(budget.map(item => item.summaryGroup))];
    const grouped = summaryGroupsInOrder.reduce((acc, summaryGroup) => {
        if(summaryGroup) acc[summaryGroup] = { items: [], subtotal: 0 };
        return acc;
    }, {});

    budget.forEach(item => {
        const summaryGroup = item.summaryGroup || 'Uncategorized';
        if (grouped[summaryGroup]) {
            grouped[summaryGroup].items.push(item);
        }
    });

    for (const summaryGroup in grouped) {
        grouped[summaryGroup].subtotal = grouped[summaryGroup].items.reduce((sum, item) => sum + (item.total || 0), 0);
    }

    return grouped;
  }, [budget]);

  const grandTotal = useMemo(() => 
    Object.values(groupedBudget).reduce((total, group) => total + group.subtotal, 0),
    [groupedBudget]
  );

  if (error) return <p>Error: {error}</p>;
  if (!show || loading) return <div style={{ textAlign: 'center', margin: '2rem' }}><Spin size="large" /></div>;

  return (
    <Card>
      <div style={styles.header}>
        <div>
          <Title level={2}>Edit Budget</Title>
          <Title level={4}>{show.name} - {show.showDates[dateIndex].date}</Title>
        </div>
        {budgetId && (
          <Popconfirm title="Are you sure? This will delete the entire budget." onConfirm={handleDeleteBudget} okText="Yes" cancelText="No">
            <Button type="primary" danger>Delete Budget</Button>
          </Popconfirm>
        )}
      </div>
      
      <div style={styles.gridContainer}>
        <GridHeader />
        {Object.entries(groupedBudget).map(([summaryGroup, group]) => (
          <Fragment key={summaryGroup}>
            <div style={styles.summaryGroupHeader}><Title level={5}>{summaryGroup}</Title></div>
            {group.items.map((item) => (
              <div key={item.id} style={styles.gridRow}>
                <div style={{...styles.cell, ...styles.departmentCell}}><Input variant="borderless" value={item.department} onChange={e => handleBudgetChange(item.id, 'department', e.target.value)} /></div>
                <div style={{...styles.cell, ...styles.subDepartmentCell}}><Input variant="borderless" value={item.subDepartment} onChange={e => handleBudgetChange(item.id, 'subDepartment', e.target.value)} /></div>
                <div style={{...styles.cell, ...styles.lineItemCell}}><Input variant="borderless" value={item.lineItem} onChange={e => handleBudgetChange(item.id, 'lineItem', e.target.value)} /></div>
                <div style={{...styles.cell, ...styles.numberCell}}><InputNumber style={{width: '100%'}} variant="borderless" min={1} value={item.number} onChange={value => handleBudgetChange(item.id, 'number', value)} /></div>
                <div style={{...styles.cell, ...styles.quantityCell}}><InputNumber style={{width: '100%'}} variant="borderless" min={1} value={item.quantity} onChange={value => handleBudgetChange(item.id, 'quantity', value)} /></div>
                <div style={{...styles.cell, ...styles.typeCell}}>
                  <Select value={item.type} onChange={value => handleBudgetChange(item.id, 'type', value)} style={{ width: '100%' }} variant="borderless">
                    <Option value="Allocation">Allocation</Option>
                    <Option value="Fee">Fee</Option><Option value="Weekly">Weekly</Option>
                    <Option value="Daily">Daily</Option><Option value="Buyout">Buyout</Option>
                  </Select>
                </div>
                <div style={{...styles.cell, ...styles.rateCell}}><InputNumber style={{width: '100%'}} variant="borderless" min={0} step={0.01} value={item.rate} onChange={value => handleBudgetChange(item.id, 'rate', value)} formatter={value => `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/£\s?|(,*)/g, '')} /></div>
                <div style={{...styles.cell, ...styles.totalCell}}><Text>£{item.total?.toFixed(2) || '0.00'}</Text></div>
                <div style={{...styles.cell, ...styles.actionCell}}>
                  <Popconfirm title="Delete this line?" onConfirm={() => handleDeleteLineItem(item.id)}>
                    <Button type="link" danger icon={<DeleteOutlined style={{color: '#ff7875'}} />} />
                  </Popconfirm>
                </div>
              </div>
            ))}
            <div style={styles.subtotalRow}>
                <Text strong>Group Total: £{group.subtotal.toFixed(2)}</Text>
            </div>
          </Fragment>
        ))}
      </div>

      <div style={styles.grandTotalRow}>
        <Title level={4}>Grand Total: £{grandTotal.toFixed(2)}</Title>
      </div>
    </Card>
  );
};

export default CreateBudget;
