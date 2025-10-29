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
  const [isCreating, setIsCreating] = useState(false); // State to prevent race conditions during auto-creation

  // Debounced save for efficient updates
  const debouncedSave = useCallback(
    debounce(async (id, budgetDetails) => {
      try {
        const budgetDocRef = doc(db, 'budgets', id);
        const budgetDetailsToSave = budgetDetails.map(({ id, number, quantity, type, rate, department, subDepartment, lineItem, summaryGroup }) => (
            { id, number, quantity, type, rate, department, subDepartment, lineItem, summaryGroup }
        ));
        await updateDoc(budgetDocRef, { budgetDetails: budgetDetailsToSave });
      } catch (err) {
        console.error("Error updating budget:", err);
        setError("Failed to save changes.");
      }
    }, 1500),
    []
  );

  // Step 1: Fetch the parent 'show' document. This is a prerequisite.
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

  // Step 2: Main effect to listen for and automatically create the budget.
  useEffect(() => {
    if (!show || !show.id) return; // Guard: Do not run until show data is loaded.

    const showDate = show.showDates[dateIndex].date;
    const budgetQuery = query(
      collection(db, 'budgets'),
      where('showId', '==', show.id),
      where('showDate.date', '==', showDate)
    );

    const unsubscribe = onSnapshot(budgetQuery, async (snapshot) => {
      if (snapshot.empty) {
        // **NO BUDGET EXISTS**: Auto-create it immediately.
        if (isCreating) return; // Prevent loop if creation is in progress.
        setIsCreating(true);
        setLoading(true);
        try {
          const categoriesSnapshot = await getDocs(collection(db, 'budgetCategories'));
          if (categoriesSnapshot.empty) throw new Error("Budget categories are not seeded.");

          const categoriesList = categoriesSnapshot.docs.map(doc => doc.data());
          // **THE FIX FOR SORTING**: Use localeCompare for string IDs.
          categoriesList.sort((a, b) => a.id.localeCompare(b.id));

          const initialBudget = categoriesList.map(category => ({
            id: category.id, // **THE FIX FOR ID**: Correctly map the string ID.
            summaryGroup: category.summaryGroup,
            department: category.department,
            subDepartment: category.subDepartment,
            lineItem: category.lineItem,
            number: 1, quantity: 1, type: 'Allocation', rate: 0, total: 0,
          }));

          // **AUTOMATIC CREATION**: Add the document to Firestore without user interaction.
          await addDoc(collection(db, 'budgets'), {
            showId: show.id,
            showName: show.name,
            showDate: show.showDates[dateIndex],
            budgetDetails: initialBudget,
            createdAt: new Date(),
          });
          // The listener will now pick up the newly created document and re-render.
        } catch (err) {
          console.error("FATAL: Could not auto-create budget:", err);
          setError(err.message);
          setLoading(false);
        } finally {
          setIsCreating(false);
        }
      } else {
        // **BUDGET EXISTS**: Load and display it.
        setLoading(true);
        const budgetDoc = snapshot.docs[0];
        setBudgetId(budgetDoc.id);
        const budgetData = budgetDoc.data();
        const budgetDetails = budgetData.budgetDetails || [];
        // **THE FIX FOR SORTING**: Also sort existing data to guarantee order.
        budgetDetails.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        setBudget(budgetDetails);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore snapshot listener error:", err);
      setError("An error occurred while connecting to the database.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [show, isCreating]); // Rerun if show changes.

  const handleBudgetChange = (itemId, field, value) => {
    const newBudget = budget.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
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
      // The listener will automatically handle the UI update.
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

  if (error) return <p className="error-message">Error: {error}</p>;
  if (!show || loading) return <p className="loading-message">Loading Budget...</p>;

  return (
    <div className="create-budget-container">
      <div className="header-with-buttons">
        {/* UI now correctly reflects the state without a manual create button */}
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
              <th>Department</th><th>Sub-Department</th><th>Line Item</th><th>Number</th><th>Quantity</th><th>Type</th><th>Rate (£)</th><th>Total (£)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedBudget).map(([group, items]) => (
              <Fragment key={group}>
                <tr className="group-header-row"><th colSpan="8">{group}</th></tr>
                {/* Final safety sort during render, though data is already sorted */}
                {items.sort((a, b) => (a.id || '').localeCompare(b.id || '')).map((item) => (
                  <tr key={item.id}>
                    <td>{item.department}</td>
                    <td>{item.subDepartment}</td>
                    <td>{item.lineItem}</td>
                    <td><input type="number" value={item.number} onChange={(e) => handleBudgetChange(item.id, 'number', parseInt(e.target.value, 10) || 1)} /></td>
                    <td><input type="number" value={item.quantity} onChange={(e) => handleBudgetChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} /></td>
                    <td>
                      <select value={item.type} onChange={(e) => handleBudgetChange(item.id, 'type', e.target.value)}>
                        <option>Allocation</option><option>Fee</option><option>Weekly</option><option>Daily</option><option>Buyout</option>
                      </select>
                    </td>
                    <td><input type="number" step="0.01" value={item.rate} onChange={(e) => handleBudgetChange(item.id, 'rate', parseFloat(e.target.value) || 0)} /></td>
                    <td className="total-cell">{item.total?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
                <tr className="subtotal-row"><td colSpan="7">Subtotal for {group}</td><td>{getGroupSubtotal(group).toFixed(2)}</td></tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default CreateBudget;
