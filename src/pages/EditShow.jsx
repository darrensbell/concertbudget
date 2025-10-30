import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Form, Input, Button, DatePicker, TimePicker, InputNumber, Space, Typography, Result } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const { Title } = Typography;

const EditShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    const fetchShow = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'shows', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const showData = docSnap.data();
          form.setFieldsValue({
            ...showData,
            showDates: showData.showDates.map(sd => ({
              date: dayjs(sd.date, 'YYYY-MM-DD'),
              time: dayjs(sd.time, 'h:mm a'),
            })),
          });
        } else {
          toast.error('Show not found');
          navigate('/shows');
        }
      } catch (err) {
        toast.error('Failed to fetch show data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShow();
  }, [id, form, navigate]);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'shows', id);
      const processedValues = {
        ...values,
        showDates: values.showDates.map(sd => ({
          date: sd.date.format('YYYY-MM-DD'),
          time: sd.time.format('h:mm a'),
        })),
        updatedAt: serverTimestamp(),
      };
      await updateDoc(docRef, processedValues);
      toast.success('Show updated successfully!');
      setIsUpdated(true);
    } catch (err) {
      toast.error('Error updating show: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUpdated) {
    return (
      <Result
        status="success"
        title="Show Updated Successfully!"
        extra={[
          <Button type="primary" key="shows" onClick={() => navigate('/shows')}>
            Back to Shows List
          </Button>,
        ]}
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '2rem' }}>Edit Show</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Show Name" rules={[{ required: true, message: 'Please enter the show name' }]}>
          <Input />
        </Form.Item>

        <Form.List name="showDates">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'date']}
                    rules={[{ required: true, message: 'Missing date' }]}
                  >
                    <DatePicker format="YYYY-MM-DD" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'time']}
                    rules={[{ required: true, message: 'Missing time' }]}
                  >
                    <TimePicker use12Hours format="h:mm a" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Another Show Date
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item name="venue" label="Venue" rules={[{ required: true, message: 'Please enter the venue' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="numberOfShows" label="Number of Shows">
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item name="agentName" label="Agent Name">
          <Input />
        </Form.Item>

        <Form.Item name="agentEmail" label="Agent Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Save Changes
          </Button>
          <Button onClick={() => navigate('/shows')} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditShow;
