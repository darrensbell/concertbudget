import { Link } from 'react-router-dom';
import { Card, Button, List, Typography, Popconfirm } from 'antd';
import { CalendarOutlined, EditOutlined, FileTextOutlined, ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Title, Text } = Typography;

const ShowCard = ({ show, existingBudgets, onDeleteShow }) => {
  return (
    <Card
      actions={[
        <Link to={`/edit-show/${show.id}`}>
          <Button type="text" icon={<EditOutlined />}>Edit</Button>
        </Link>,
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDeleteShow(show.id)}>Delete</Button>,
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
  );
};

export default ShowCard;
