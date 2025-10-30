import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Table, Button, Modal, Form, Input, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';

const { Title } = Typography;

const BudgetCategorySettings = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'budgetCategories'), (querySnapshot) => {
      const categoriesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      categoriesList.sort((a, b) => a.id.localeCompare(b.id));
      setCategories(categoriesList);
    }, (error) => {
      toast.error('Error fetching categories: ' + error.message);
    });

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

      if (editingCategory && editingCategory.id) {
        const docRef = doc(db, 'budgetCategories', editingCategory.id);
        await updateDoc(docRef, values);
        toast.success('Category updated successfully');
      } else {
        await addDoc(collection(db, 'budgetCategories'), values);
        toast.success('Category added successfully');
      }

      handleCancel();
    } catch (error) {
      toast.error('An error occurred: ' + error.message);
    }
  };

  const openDeleteConfirm = (id) => {
    setCategoryToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setCategoryToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
        try {
            await deleteDoc(doc(db, 'budgetCategories', categoryToDelete));
            toast.success('Category deleted successfully');
        } catch (error) {
            toast.error('Error deleting category: ' + error.message);
        } finally {
            closeDeleteConfirm();
        }
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
            <Button danger icon={<DeleteOutlined />} onClick={() => openDeleteConfirm(record.id)}>Delete</Button>
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
        rowKey="id"
        pagination={{ pageSize: 20 }}
        bordered
      />
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
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
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        message="Are you sure you want to delete this category?"
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};

export default BudgetCategorySettings;
