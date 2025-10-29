import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import ShowCard from '../components/ShowCard';
import '../components/ShowCard.css';
import '../App.css';

function Shows() {
  const [shows, setShows] = useState([]);
  const [existingBudgets, setExistingBudgets] = useState(new Set()); // Use a Set for efficient lookups
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowsAndBudgets = async () => {
      try {
        setLoading(true);
        // Fetch both shows and budgets in parallel for efficiency
        const [showsSnapshot, budgetsSnapshot] = await Promise.all([
          getDocs(collection(db, 'shows')), 
          getDocs(collection(db, 'budgets'))
        ]);

        const showsList = showsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Create a lookup Set of existing budgets for fast checking
        const budgetKeys = new Set();
        budgetsSnapshot.forEach(doc => {
          const budget = doc.data();
          // Create a unique key for each budget based on showId and date
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
    <main>
      <h2>Upcoming Shows</h2>
      {loading ? (
        <p className="loading-message">Loading shows and budgets...</p>
      ) : shows.length > 0 ? (
        <div className="shows-grid">
          {shows.map(show => (
            // Pass the set of existing budget keys down to each ShowCard
            <ShowCard key={show.id} show={show} existingBudgets={existingBudgets} />
          ))}
        </div>
      ) : (
        <div className="no-shows">
          <p>No upcoming shows found.</p>
        </div>
      )}
    </main>
  );
}

export default Shows;
