
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Typography, Spin, Empty, Button } from 'antd';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
import PageHeader from '../components/PageHeader';
import styles from './ArchivedShows.module.css';

function ArchivedShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToRestore, setShowToRestore] = useState(null);

  useEffect(() => {
    const fetchArchivedShows = async () => {
      try {
        setLoading(true);
        const showsQuery = query(collection(db, 'shows'), where('archived', '==', true));
        const showsSnapshot = await getDocs(showsQuery);
        const showsList = showsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShows(showsList);
      } catch (error) {
        console.error("Error fetching archived shows: ", error);
        toast.error("Error fetching archived shows: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedShows();
  }, []);

  const openRestoreModal = (showId) => {
    setShowToRestore(showId);
    setIsModalOpen(true);
  };

  const closeRestoreModal = () => {
    setShowToRestore(null);
    setIsModalOpen(false);
  };

  const handleRestoreShow = async () => {
    if (!showToRestore) return;

    try {
      const showRef = doc(db, 'shows', showToRestore);
      await updateDoc(showRef, { archived: false });
      setShows(shows.filter(show => show.id !== showToRestore));
      toast.success('Show restored successfully!');
    } catch (error) {
      console.error("Error restoring show: ", error);
      toast.error('Error restoring show: ' + error.message);
    } finally {
      closeRestoreModal();
    }
  };

  return (
    <div>
      <PageHeader title="Archived Shows" />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Spin size="large" />
        </div>
      ) : shows.length > 0 ? (
        <div className={styles.archivedShowList}>
          {shows.map(show => (
            <div key={show.id} className={styles.archivedShowItem}>
              <Typography.Text>{show.title}</Typography.Text>
              <Button type="primary" onClick={() => openRestoreModal(show.id)}>Restore</Button>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          description={
            <Typography.Text type="secondary">No archived shows found.</Typography.Text>
          }
        />
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        message="Are you sure you want to restore this show?"
        onConfirm={handleRestoreShow}
        onCancel={closeRestoreModal}
      />
    </div>
  );
}

export default ArchivedShows;
