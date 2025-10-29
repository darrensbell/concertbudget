import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import './EditShow.css';

const EditShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'shows', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setShow({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Show not found');
        }
      } catch (err) {
        setError('Failed to fetch show');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShow();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShow(prevShow => ({
      ...prevShow,
      [name]: value
    }));
  };

  const handleDateChange = (index, field, value) => {
    const newShowDates = [...show.showDates];
    newShowDates[index][field] = value;
    setShow(prevShow => ({
      ...prevShow,
      showDates: newShowDates
    }));
  };

  const addShowDate = () => {
    if (show.showDates.length < 3) {
      setShow(prevShow => ({
        ...prevShow,
        showDates: [...prevShow.showDates, { date: '', time: '' }]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'shows', id);
      await updateDoc(docRef, {
        ...show,
        updatedAt: serverTimestamp()
      });
      navigate('/');
    } catch (err) {
      console.error("Error updating show: ", err);
    }
  };

  if (loading) return <p className="loading-message">Loading show details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!show) return null;

  return (
    <div className="edit-show-container">
      <h2>Edit Show</h2>
      <form onSubmit={handleSubmit} className="edit-show-form">
        <div className="form-group">
          <label>Show Name</label>
          <input type="text" name="name" value={show.name} onChange={handleInputChange} />
        </div>

        {show.showDates.map((showDate, index) => (
          <div key={index} className="show-date-group">
            <div className="form-group">
              <label>Show Date {index + 1}</label>
              <input type="date" value={showDate.date} onChange={(e) => handleDateChange(index, 'date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Show Time {index + 1}</label>
              <input type="time" value={showDate.time} onChange={(e) => handleDateChange(index, 'time', e.target.value)} />
            </div>
          </div>
        ))}
        {show.showDates.length < 3 && <button type="button" onClick={addShowDate} className="add-show-date-btn">Add Another Show Date</button>}

        <div className="form-group">
          <label>Venue</label>
          <input type="text" name="venue" value={show.venue} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>Number of Shows</label>
          <input type="number" name="numberOfShows" value={show.numberOfShows} onChange={handleInputChange} min="1" />
        </div>

        <div className="form-group">
          <label>Agent Name</label>
          <input type="text" name="agentName" value={show.agentName} onChange={handleInputChange} />
        </div>

        <div className="form-group">
          <label>Agent Email</label>
          <input type="email" name="agentEmail" value={show.agentEmail} onChange={handleInputChange} />
        </div>

        <div className="button-group">
          <button type="submit" className="submit-btn">Save Changes</button>
          <button type="button" onClick={() => navigate('/')} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditShow;
