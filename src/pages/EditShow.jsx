import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Form, Input, Button, DatePicker, TimePicker, Spin, Typography, Row, Col, Card } from 'antd';
import moment from 'moment';

const EditShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'shows', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const showData = docSnap.data();
          form.setFieldsValue({
            name: showData.name,
            venue: showData.venue,
            numberOfShows: showData.numberOfShows,
            agentName: showData.agentName,
            agentEmail: showData.agentEmail,
            showDates: showData.showDates.map(sd => ({
              date: moment(sd.date),
              time: moment(sd.time, 'HH:mm')
            }))
          });
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
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      const docRef = doc(db, 'shows', id);
      await updateDoc(docRef, {
        ...values,
        showDates: values.showDates.map(sd => ({
          date: sd.date.format('YYYY-MM-DD'),
          time: sd.time.format('HH:mm')
        })),
        updatedAt: serverTimestamp()
      });
      navigate('/');
    } catch (err) {
      console.error('Error updating show: ', err);
    }
  };

  if (loading) return <Spin tip="Loading show details..." />;
  if (error) return <Typography.Text type="danger">{error}</Typography.Text>;

  return (
    <Card>
      <Typography.Title level={2}>Edit Show</Typography.Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ showDates: [{ date: null, time: null }] }}>
        <Form.Item name="name" label="Show Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.List name="showDates">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} align="bottom">
                  <Col span={10}>
                    <Form.Item {...restField} name={[name, 'date']} label={`Show Date ${name + 1}`} rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item {...restField} name={[name, 'time']} label={`Show Time ${name + 1}`} rules={[{ required: true }]}>
                      <TimePicker style={{ width: '100%' }} format="HH:mm" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    {fields.length > 1 ? (
                      <Button type="dashed" onClick={() => remove(name)} block>
                        Remove
                      </Button>
                    ) : null}
                  </Col>
                </Row>
              ))}
              {fields.length < 3 && (
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Another Show Date
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>

        <Form.Item name="venue" label="Venue" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="numberOfShows" label="Number of Shows" rules={[{ required: true, type: 'number', min: 1 }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="agentName" label="Agent Name">
          <Input />
        </Form.Item>

        <Form.Item name="agentEmail" label="Agent Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">Save Changes</Button>
          <Button onClick={() => navigate('/')} style={{ marginLeft: 8 }}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditShow;
