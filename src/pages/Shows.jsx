
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import ShowCard from '../components/ShowCard';
import { Typography, Spin, Empty } from 'antd';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const { Title } = Typography;

function Shows() {
  const [shows, setShows] = useState([]);
  const [existingBudgets, setExistingBudgets] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToArchive, setShowToArchive] = useState(null);

  useEffect(() => {
    const fetchShowsAndBudgets = async () => {
      try {
        setLoading(true);
        const [showsSnapshot, budgetsSnapshot] = await Promise.all([
          getDocs(collection(db, 'shows')),
          getDocs(collection(db, 'budgets'))
        ]);

        const showsList = showsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(show => show.archived !== true);

        const budgetKeys = new Set();
        budgetsSnapshot.forEach(doc => {
          const budget = doc.data();
          if(budget.showId && budget.showDate && budget.showDate.date) {
            const key = `${budget.showId}_${budget.showDate.date}`;
            budgetKeys.add(key);
          }
        });

        setShows(showsList);
        setExistingBudgets(budgetKeys);

      } catch (error) {
        console.error("Error fetching data: ", error);
        toast.error("Error fetching data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowsAndBudgets();
  }, []);

  const openArchiveModal = (showId) => {
    setShowToArchive(showId);
    setIsModalOpen(true);
  };

  const closeArchiveModal = () => {
    setShowToArchive(null);
    setIsModalOpen(false);
  };

  const handleArchiveShow = async () => {
    if (!showToArchive) return;

    try {
      const showRef = doc(db, 'shows', showToArchive);
      await updateDoc(showRef, { archived: true });
      setShows(shows.filter(show => show.id !== showToArchive));
      toast.success('Show archived successfully!');
    } catch (error) {
      console.error("Error archiving show: ", error);
      toast.error('Error archiving show: ' + error.message);
    } finally {
      closeArchiveModal();
    }
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: '2rem' }}>Upcoming Shows</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Spin size="large" />
        </div>
      ) : shows.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
          {shows.map(show => (
            <ShowCard key={show.id} show={show} existingBudgets={existingBudgets} onDeleteShow={() => openArchiveModal(show.id)} />
          ))}
        </div>
      ) : (
        <Empty
          description={
            <Typography.Text type="secondary">No upcoming shows found.</Typography.Text>
          }
        />
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to archive this show?"
        onConfirm={handleArchiveShow}
        onCancel={closeArchiveModal}
      />
    </div>
  );
}

export default Shows;
