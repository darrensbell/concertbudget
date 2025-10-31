
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, List, Typography } from 'antd';
import { CalendarOutlined, EditOutlined, FileTextOutlined, ArrowRightOutlined, DeleteOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { format } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { toast } from 'react-toastify';
import Modal from './Modal';
import styles from './ShowCard.module.css';

const { Title, Text } = Typography;

const ShowCard = ({ show, existingBudgets, onDeleteShow }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(show.isLiked || false);
  const [likes, setLikes] = useState(show.likes || 0);

  const handleDelete = () => {
    onDeleteShow(show.id);
    setIsModalOpen(false);
  };

  const handleLike = async () => {
    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? likes + 1 : likes - 1;

    // Optimistic UI update
    setIsLiked(newLikedState);
    setLikes(newLikesCount);

    try {
      const showRef = doc(db, 'shows', show.id);
      await updateDoc(showRef, {
        likes: newLikesCount,
      });
    } catch (error) {
      // Revert UI changes if the update fails
      setIsLiked(!newLikedState);
      setLikes(likes);
      toast.error('Failed to update like status.');
    }
  };

  return (
    <>
      <Card
        className={styles.showCard}
        actions={[
          <Button type="text" icon={isLiked ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />} onClick={handleLike}>
            {likes}
          </Button>,
          <Link to={`/edit-show/${show.id}`}>
            <Button type="text" icon={<EditOutlined />}>Edit</Button>
          </Link>,
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setIsModalOpen(true)}>Delete</Button>,
          <Link to={`/shows/${show.id}/recoupment`}>
            <Button type="text" icon={<FileTextOutlined />}>Recoupment</Button>
          </Link>,
        ]}
      >
        <Card.Meta
          title={<Title level={4}>{show.name}</Title>}
          description={<Text type="secondary">{show.venue}</Text>}
        />
        <List
          itemLayout="horizontal"
          dataSource={show.showDates}
          renderItem={(showDate, index) => {
            const budgetKey = `${show.id}_${showDate.date}`;
            const budgetExists = existingBudgets.has(budgetKey);
            return (
              <List.Item
                actions={[
                  <Link to={`/create-budget/${show.id}/${index}`}>
                    <Button type={budgetExists ? "default" : "primary"}>
                      {budgetExists ? "Open Budget" : "Create Budget"}
                      <ArrowRightOutlined />
                    </Button>
                  </Link>
                ]}
              >
                <List.Item.Meta
                  avatar={<CalendarOutlined />}
                  title={<Text>{format(new Date(showDate.date), 'EEEE, dd MMMM yyyy')}</Text>}
                  description={<Text type="secondary">{showDate.time}</Text>}
                />
              </List.Item>
            )
          }}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this show? This action cannot be undone.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: '0.5rem' }}>
            Cancel
          </Button>
          <Button type="primary" danger onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ShowCard;
