import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import './CreateShow.css';

const CreateShow = () => {
  const navigate = useNavigate();
  const [showName, setShowName] = useState('');
  const [venue, setVenue] = useState('');
  const [numShows, setNumShows] = useState(1);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [showDates, setShowDates] = useState([
    { date: '', time: '' },
  ]);
  const [isCreated, setIsCreated] = useState(false);

  const handleDateChange = (index, field, value) => {
    const newShowDates = [...showDates];
    newShowDates[index][field] = value;
    setShowDates(newShowDates);
  };

  const addShowDate = () => {
    if (showDates.length < 3) {
      setShowDates([...showDates, { date: '', time: '' }]);
    }
  };

  const resetForm = () => {
    setShowName('');
    setVenue('');
    setNumShows(1);
    setAgentName('');
    setAgentEmail('');
    setShowDates([{ date: '', time: '' }]);
    setIsCreated(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!showName || !venue || !agentName || !agentEmail || !showDates[0].date || !showDates[0].time) {
      alert('Please fill in all mandatory fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'shows'), {
        name: showName,
        venue,
        numberOfShows: numShows,
        agentName,
        agentEmail,
        showDates,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsCreated(true);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  if (isCreated) {
    return (
      <div className="create-show-container success-message">
        <h2>Show Created Successfully!</h2>
        <p>Your new show has been added to the database.</p>
        <div className="button-group">
          <button onClick={resetForm} className="submit-btn">Create Another Show</button>
          <button onClick={() => navigate('/')} className="go-back-btn">Go to Shows List</button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-show-container">
      <div className="create-show-header">
        <h2>Create a New Show</h2>
        <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
      </div>
      <form onSubmit={handleSubmit} className="create-show-form">
        {/* ... form groups ... */}
        <div className="form-group">
          <label>Show Name *</label>
          <input type="text" value={showName} onChange={(e) => setShowName(e.target.value)} required />
        </div>

        {showDates.map((show, index) => (
          <div key={index} className="show-date-group">
            <div className="form-group">
              <label>Show Date {index + 1}{index === 0 && ' *'}</label>
              <input type="date" value={show.date} onChange={(e) => handleDateChange(index, 'date', e.target.value)} required={index === 0} />
            </div>
            <div className="form-group">
              <label>Show Time {index + 1}{index === 0 && ' *'}</label>
              <input type="time" value={show.time} onChange={(e) => handleDateChange(index, 'time', e.target.value)} required={index === 0} />
            </div>
          </div>
        ))}
        {showDates.length < 3 && <button type="button" onClick={addShowDate} className="add-show-date-btn">Add Another Show Date</button>}

        <div className="form-group">
          <label>Venue *</label>
          <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Number of Shows</label>
          <input type="number" value={numShows} onChange={(e) => setNumShows(parseInt(e.target.value, 10))} min="1" />
        </div>

        <div className="form-group">
          <label>Agent Name *</label>
          <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Agent Email *</label>
          <input type="email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} required />
        </div>

        <button type="submit" className="submit-btn">Create Show</button>
      </form>
    </div>
  );
};

export default CreateShow;
