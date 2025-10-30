import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const BudgetCategorySettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.use_form();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'budgetCategories'), (querySnapshot) => {
      const categoriesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      categoriesList.sort((a, b) => a.id.localeCompare(b.id));
      setCategories(categoriesList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories with onSnapshot: ", error);
      message.error('Error fetching categories: ' + error.message);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const showModal = (category = null) => {
    setEditingCategory(category);
    form.setFieldsValue(category || { department: '', subDepartment: '', lineItem: '', summaryGroup: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingCategory && editingCategory.id) {
        const docRef = doc(db, 'budgetCategories', editingCategory.id);
        await updateDoc(docRef, values);
        message.success('Category updated successfully');
      } else {
        await addDoc(collection(db, 'budgetCategories'), values);
        message.success('Category added successfully');
      }

      handleCancel(); // Close modal, listener will auto-update table
    } catch (error) {
      console.error('An error occurred during the save process:', error);
      if (error.code) {
        message.error(`A database error occurred: ${error.message}`);
      } else if (error.errorFields) {
        message.error('Please ensure all fields are filled out correctly.');
      } else {
        message.error('An unexpected error occurred. See console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'budgetCategories', id));
      message.success('Category deleted successfully');
      // No need to refetch, listener will handle it
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Error deleting category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Department', dataIndex: 'department', key: 'department', sorter: (a, b) => a.department.localeCompare(b.department) },
    { title: 'Sub-Department', dataIndex: 'subDepartment', key: 'subDepartment', sorter: (a, b) => a.subDepartment.localeCompare(b.subDepartment) },
    { title: 'Line Item', dataIndex: 'lineItem', key: 'lineItem', sorter: (a, b) => a.lineItem.localeCompare(b.lineItem) },
    { title: 'Summary Group', dataIndex: 'summaryGroup', key: 'summaryGroup', sorter: (a, b) => a.summaryGroup.localeCompare(b.summaryGroup) },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Budget Category Settings</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Add Category
      </Button>
      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        bordered
      />
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" name="categoryForm">
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please enter a department' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subDepartment" label="Sub-Department" rules={[{ required: true, message: 'Please enter a sub-department' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lineItem" label="Line Item" rules={[{ required: true, message: 'Please enter a line item' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summaryGroup" label="Summary Group" rules={[{ required: true, message: 'Please enter a summary group' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BudgetCategorySettings;
