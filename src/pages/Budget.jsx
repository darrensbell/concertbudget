import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import './Budget.css';

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

  return (
    <main>
      <h2>Budget Categories</h2>
      {loading ? (
        <p className="loading-message">Loading budget categories...</p>
      ) : (
        <div className="budget-table-container">
          <table className="budget-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Summary Group</th>
                <th>Department</th>
                <th>Sub Department</th>
                <th>Line Item</th>
              </tr>
            </thead>
            <tbody>
              {budgetCategories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.summaryGroup}</td>
                  <td>{category.department}</td>
                  <td>{category.subDepartment}</td>
                  <td>{category.lineItem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Budget;
