import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { debounce } from 'lodash';
import { Input, InputNumber, Select, Button, Typography, Card } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  const debouncedSave = useCallback(
    debounce(async (id, budgetDetails) => {
      try {
        const budgetDocRef = doc(db, 'budgets', id);
        await updateDoc(budgetDocRef, { budgetDetails, updatedAt: serverTimestamp() });
        toast.success('Budget saved automatically!');
      } catch (err) {
        toast.error(`Error updating budget: ${err.message}`);
      }
    }, 1500),
    []
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const showDocRef = doc(db, 'shows', showId);
        const showDocSnap = await getDoc(showDocRef);

        if (!showDocSnap.exists() || !showDocSnap.data().showDates?.[dateIndex]) {
          toast.error("Show or specific show date not found.");
          navigate('/shows');
          return;
        }
        const showData = { ...showDocSnap.data(), id: showDocSnap.id };
        setShow(showData);

        const showDate = showData.showDates[dateIndex].date;
        const budgetQuery = query(
          collection(db, 'budgets'),
          where('showId', '==', showId),
          where('showDate.date', '==', showDate)
        );
        const budgetSnapshot = await getDocs(budgetQuery);

        if (budgetSnapshot.empty) {
          const categoriesSnapshot = await getDocs(collection(db, 'budgetCategories'));
          const categoriesList = categoriesSnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }))
            .sort((a, b) => a.id.localeCompare(b.id));
          
          const initialBudgetDetails = categoriesList.map(category => ({
            ...category,
            number: 1, quantity: 1, type: 'Allocation', rate: 0, total: 0
          }));

          const newBudgetRef = await addDoc(collection(db, 'budgets'), {
            showId: showId,
            showName: showData.name,
            showDate: showData.showDates[dateIndex],
            budgetDetails: initialBudgetDetails,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setBudgetId(newBudgetRef.id);
          setBudget(initialBudgetDetails);
        } else {
          const budgetDoc = budgetSnapshot.docs[0];
          setBudgetId(budgetDoc.id);
          const budgetData = budgetDoc.data();
          const budgetDetails = (budgetData.budgetDetails || []).map(item => ({
            ...item,
            total: (item.rate || 0) * (item.quantity || 1) * (item.number || 1)
          }));
          setBudget(budgetDetails);
        }
      } catch (error) {
        toast.error(`Failed to load budget data: ${error.message}`);
        navigate('/shows');
      }
    };

    loadInitialData();
  }, [showId, dateIndex, navigate]);

  useEffect(() => {
    if (!budgetId) return;

    const unsubscribe = onSnapshot(doc(db, 'budgets', budgetId), (doc) => {
      if (doc.exists()) {
        const budgetData = doc.data();
        const budgetDetails = (budgetData.budgetDetails || []).map(item => ({
            ...item,
            total: (item.rate || 0) * (item.quantity || 1) * (item.number || 1)
        }));
        setBudget(budgetDetails);
      }
    }, (error) => {
      toast.error(`Real-time connection error: ${error.message}`);
    });

    return () => unsubscribe();
  }, [budgetId]);

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

  const confirmDelete = (action) => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (modalAction.type === 'deleteBudget') {
      handleDeleteBudget();
    } else if (modalAction.type === 'deleteLineItem') {
      handleDeleteLineItem(modalAction.payload);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalAction(null);
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
    try {
      await deleteDoc(doc(db, 'budgets', budgetId));
      toast.success('Budget deleted successfully');
      navigate('/shows');
    } catch (err) {
      toast.error(`Failed to delete the budget: ${err.message}`);
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

  if (!show) return null;

  return (
    <Card>
      <div style={styles.header}>
        <div>
          <Title level={2}>Edit Budget</Title>
          <Title level={4}>{show.name} - {show.showDates[dateIndex].date}</Title>
        </div>
        {budgetId && (
            <Button type="primary" danger onClick={() => confirmDelete({ type: 'deleteBudget' })}>
                Delete Budget
            </Button>
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
                    <Button type="link" danger icon={<DeleteOutlined style={{color: '#ff7875'}} />} onClick={() => confirmDelete({ type: 'deleteLineItem', payload: item.id })} />
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

      <ConfirmationModal
        isOpen={isModalOpen}
        message={modalAction?.type === 'deleteBudget' ? "Are you sure? This will delete the entire budget." : "Delete this line?"}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </Card>
  );
};

export default CreateBudget;
