
import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { debounce } from 'lodash';
import './CreateBudget.css';

const CreateBudget = () => {
  const { showId, dateIndex } = useParams();
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
        // Before saving, recalculate totals to ensure data integrity
        const budgetDetailsToSave = budgetDetails.map(item => ({
          ...item,
          total: (item.rate || 0) * (item.quantity || 1) * (item.number || 1)
        }));
        await updateDoc(budgetDocRef, { budgetDetails: budgetDetailsToSave });
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
          setError(null);
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
          if (categoriesSnapshot.empty) throw new Error("Budget categories are not seeded.");

          const categoriesList = categoriesSnapshot.docs.map(doc => doc.data());
          categoriesList.sort((a, b) => a.id.localeCompare(b.id));

          const initialBudget = categoriesList.map(category => ({
            id: category.id,
            summaryGroup: category.summaryGroup,
            department: category.department,
            subDepartment: category.subDepartment,
            lineItem: category.lineItem,
            number: 1, quantity: 1, type: 'Allocation', rate: 0,
            total: 0, // Initial total is 0
          }));

          await addDoc(collection(db, 'budgets'), {
            showId: show.id,
            showName: show.name,
            showDate: show.showDates[dateIndex],
            budgetDetails: initialBudget,
            createdAt: new Date(),
          });
        } catch (err) {
          console.error("FATAL: Could not auto-create budget:", err);
          setError(err.message);
          setLoading(false);
        } finally {
          setIsCreating(false);
        }
      } else {
        setLoading(true);
        const budgetDoc = snapshot.docs[0];
        setBudgetId(budgetDoc.id);
        const budgetData = budgetDoc.data();
        const budgetDetails = (budgetData.budgetDetails || []).map(item => ({
            ...item,
            // Ensure total is calculated on load
            total: (item.rate || 0) * (item.quantity || 1) * (item.number || 1)
        }));
        budgetDetails.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        setBudget(budgetDetails);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore snapshot listener error:", err);
      setError("An error occurred while connecting to the database.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [show, isCreating, dateIndex]);

  const handleBudgetChange = (itemId, field, value) => {
    const newBudget = budget.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total for the updated item
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
    if (!budgetId || !window.confirm('Are you sure you want to delete this budget? This action is permanent.')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'budgets', budgetId));
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete the budget.");
      setLoading(false);
    }
  };
  
  const groupedBudget = useMemo(() => {
    if (!budget) return {};
    return budget.reduce((acc, item) => {
        const group = item.summaryGroup || 'Uncategorized';
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});
  }, [budget]);

  const getGroupSubtotal = (group) => groupedBudget[group]?.reduce((total, item) => total + (item.total || 0), 0) || 0;

  const grandTotal = useMemo(() => 
    budget.reduce((total, item) => total + (item.total || 0), 0), 
    [budget]
  );

  if (error) return <p className="error-message">Error: {error}</p>;
  if (!show || loading) return <p className="loading-message">Loading Budget...</p>;

  return (
    <div className="create-budget-container">
      <div className="header-with-buttons">
        <h2>{budgetId ? 'Edit Budget' : 'Create Budget'}</h2>
        {budgetId && (
            <div className="budget-actions">
                <button onClick={handleDeleteBudget} disabled={loading} className="budget-action-button delete">Delete Budget</button>
            </div>
        )}
      </div>
      <h3>{show.name} - {show.showDates[dateIndex].date}</h3>
      
      <form className="budget-form" onSubmit={(e) => e.preventDefault()}>
        <table>
          <thead>
            <tr>
                <th>Department</th>
                <th>Sub-Department</th>
                <th>Line Item</th>
                <th>Number</th>
                <th>Quantity</th>
                <th>Type</th>
                <th>Rate (£)</th>
                <th>Total (£)</th>
                <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedBudget).map(([group, items]) => (
              <Fragment key={group}>
                <tr className="group-header-row"><th colSpan="9">{group}</th></tr>
                {items.sort((a, b) => (a.id || '').localeCompare(b.id || '')).map((item) => (
                  <tr key={item.id}>
                    <td><input type="text" value={item.department} onChange={(e) => handleBudgetChange(item.id, 'department', e.target.value)} /></td>
                    <td><input type="text" value={item.subDepartment} onChange={(e) => handleBudgetChange(item.id, 'subDepartment', e.target.value)} /></td>
                    <td><input type="text" value={item.lineItem} onChange={(e) => handleBudgetChange(item.id, 'lineItem', e.target.value)} /></td>
                    <td><input type="number" value={item.number} onChange={(e) => handleBudgetChange(item.id, 'number', parseInt(e.target.value, 10) || 1)} /></td>
                    <td><input type="number" value={item.quantity} onChange={(e) => handleBudgetChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} /></td>
                    <td>
                      <select value={item.type} onChange={(e) => handleBudgetChange(item.id, 'type', e.target.value)}>
                        <option>Allocation</option><option>Fee</option><option>Weekly</option><option>Daily</option><option>Buyout</option>
                      </select>
                    </td>
                    <td><input type="number" step="0.01" value={item.rate} onChange={(e) => handleBudgetChange(item.id, 'rate', parseFloat(e.target.value) || 0)} /></td>
                    <td className="total-cell">{item.total?.toFixed(2) || '0.00'}</td>
                    <td><button type="button" className="delete-item-btn" onClick={() => handleDeleteLineItem(item.id)}>&times;</button></td>
                  </tr>
                ))}
                <tr className="subtotal-row">
                  <td colSpan="9">
                    <span className="subtotal-label">Subtotal for {group}</span>
                    <span className="subtotal-value">{getGroupSubtotal(group).toFixed(2)}</span>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="grand-total-row">
              <td colSpan="9">
                  <span className="grand-total-label">Grand Total</span>
                  <span className="grand-total-value">{grandTotal.toFixed(2)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </form>
    </div>
  );
};

export default CreateBudget;
