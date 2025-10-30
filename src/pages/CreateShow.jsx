import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Form, Input, Button, DatePicker, TimePicker, InputNumber, Space, Typography, Result } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const { Title } = Typography;

const CreateShow = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isCreated, setIsCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const processedValues = {
        ...values,
        showDates: values.showDates.map(sd => ({
          date: sd.date.format('YYYY-MM-DD'),
          time: sd.time.format('h:mm a'),
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'shows'), processedValues);
      setIsCreated(true);
      toast.success('Show created successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Failed to create show. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setIsCreated(false);
  }

  if (isCreated) {
    return (
      <Result
        status="success"
        title="Show Created Successfully!"
        subTitle="Your new show has been added to the database."
        extra={[
          <Button type="primary" key="create" onClick={resetForm}>
            Create Another Show
          </Button>,
          <Button key="shows" onClick={() => navigate('/shows')}>
            Go to Shows List
          </Button>,
        ]}
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '2rem' }}>Create a New Show</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ numberOfShows: 1, showDates: [{ date: null, time: null }] }}>
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
                  {fields.length > 1 ? (
                    <MinusCircleOutlined style={{ color: '#ff7875' }} onClick={() => remove(name)} />
                  ) : null}
                </Space>
              ))}
              {fields.length < 5 && (
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Another Show Date
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>

        <Form.Item name="venue" label="Venue" rules={[{ required: true, message: 'Please enter the venue' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="numberOfShows" label="Number of Shows">
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item name="agentName" label="Agent Name" rules={[{ required: true, message: 'Please enter the agent name' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="agentEmail" label="Agent Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid agent email' }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create Show
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateShow;
