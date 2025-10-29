import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Accept the existingBudgets prop passed from the parent
const ShowCard = ({ show, existingBudgets }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`show-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="show-card-header" onClick={toggleExpand}>
        <h3>{show.name}</h3>
        <p className="show-venue">{show.venue}</p>
        <span className={`expand-icon ${isExpanded ? 'open' : ''}`}>&#x25B8;</span>
      </div>

      {isExpanded && (
        <div className="show-card-body">
          <h4>Show Dates</h4>
          <ul className="show-dates-list">
            {show.showDates.map((showDate, index) => {
              // Create the same unique key for the current show date
              const budgetKey = `${show.id}_${showDate.date}`;
              // Check if this key exists in the Set of existing budgets
              const budgetExists = existingBudgets.has(budgetKey);

              return (
                <li key={index}>
                  <div>
                    <span className="show-date">{format(new Date(showDate.date), 'EEEE dd MMM yyyy')}</span>
                    <span className="show-time">{showDate.time}</span>
                  </div>
                  {/* Conditionally render the link text and style based on whether the budget exists */}
                  <Link 
                    to={`/create-budget/${show.id}/${index}`}
                    className={budgetExists ? 'open-budget-link' : 'create-budget-link'}
                  >
                    {budgetExists ? 'Open Budget' : 'Create Budget'}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Link to={`/edit-show/${show.id}`} className="edit-show-link">Edit</Link>
    </div>
  );
};

export default ShowCard;
