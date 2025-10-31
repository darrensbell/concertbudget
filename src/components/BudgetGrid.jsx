import { Fragment } from 'react';
import { Input, InputNumber, Select, Button, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

const styles = {
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridHeader: {
    display: 'flex',
    padding: '8px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  gridRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #f0f0f0',
  },
  cell: {
    padding: '8px',
    flex: 1,
  },
  departmentCell: {
    flex: 1.5,
  },
  subDepartmentCell: {
    flex: 1.5,
  },
  lineItemCell: {
    flex: 2,
  },
  numberCell: {
    flex: 0.5,
  },
  quantityCell: {
    flex: 0.5,
  },
  typeCell: {
    flex: 1,
  },
  rateCell: {
    flex: 1,
  },
  totalCell: {
    flex: 1,
  },
  actionCell: {
    flex: 0.5,
  },
  summaryGroupHeader: {
      padding: '16px 8px',
      backgroundColor: '#f0f2f5',
      borderBottom: '1px solid #e8e8e8',
      borderTop: '2px solid #e8e8e8',
  },
  subtotalRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 8px',
    borderBottom: '2px solid #e8e8e8',
    backgroundColor: '#f9f9f9',
  },
};

const GridHeader = () => (
  <div style={styles.gridHeader}>
    <div style={{...styles.cell, ...styles.departmentCell}}><Text strong>Department</Text></div>
    <div style={{...styles.cell, ...styles.subDepartmentCell}}><Text strong>Sub-Department</Text></div>
    <div style={{...styles.cell, ...styles.lineItemCell}}><Text strong>Line Item</Text></div>
    <div style={{...styles.cell, ...styles.numberCell}}><Text strong>Number</Text></div>
    <div style={{...styles.cell, ...styles.quantityCell}}><Text strong>Quantity</Text></div>
    <div style={{...styles.cell, ...styles.typeCell}}><Text strong>Type</Text></div>
    <div style={{...styles.cell, ...styles.rateCell}}><Text strong>Rate (£)</Text></div>
    <div style={{...styles.cell, ...styles.totalCell}}><Text strong>Total (£)</Text></div>
    <div style={{...styles.cell, ...styles.actionCell}}><Text strong>Action</Text></div>
  </div>
);

const BudgetGrid = ({ groupedBudget, handleBudgetChange, confirmDelete }) => (
  <div style={styles.gridContainer}>
    <GridHeader />
    {Object.entries(groupedBudget).map(([summaryGroup, group]) => (
      <Fragment key={summaryGroup}>
        <div style={styles.summaryGroupHeader}><Title level={5}>{summaryGroup}</Title></div>
        {group.items.map((item) => (
          <div key={item.id} style={styles.gridRow}>
            <div style={{...styles.cell, ...styles.departmentCell}}><Input variant="borderless" value={item.department} onChange={e => handleBudgetChange(item.id, 'department', e.target.value)} /></div>
            <div style={{...styles.cell, ...styles.subDepartmentCell}}><Input variant="borderless" value={item.subDepartment} onChange={e => handleBudgetChange(item.id, 'subDepartment', e.target.value)} /></div>
            <div style={{...styles.cell, ...styles.lineItemCell}}><Input variant="borderless" value={item.lineItem} onChange={e => handleBudgetChange(item.id, 'lineItem', e.target.value)} /></div>
            <div style={{...styles.cell, ...styles.numberCell}}><InputNumber style={{width: '100%'}} variant="borderless" min={1} value={item.number} onChange={value => handleBudgetChange(item.id, 'number', value)} /></div>
            <div style={{...styles.cell, ...styles.quantityCell}}><InputNumber style={{width: '100%'}} variant="borderless" min={1} value={item.quantity} onChange={value => handleBudgetChange(item.id, 'quantity', value)} /></div>
            <div style={{...styles.cell, ...styles.typeCell}}>
              <Select value={item.type} onChange={value => handleBudgetChange(item.id, 'type', value)} style={{ width: '100%' }} variant="borderless">
                <Option value="Allocation">Allocation</Option>
                <Option value="Fee">Fee</Option><Option value="Weekly">Weekly</Option>
                <Option value="Daily">Daily</Option><Option value="Buyout">Buyout</Option>
              </Select>
            </div>
            <div style={{...styles.cell, ...styles.rateCell}}><InputNumber style={{width: '100%'}} variant="borderless" min={0} step={0.01} value={item.rate} onChange={value => handleBudgetChange(item.id, 'rate', value)} formatter={value => `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/£\s?|(,*)/g, '')} /></div>
            <div style={{...styles.cell, ...styles.totalCell}}><Text>£{item.total?.toFixed(2) || '0.00'}</Text></div>
            <div style={{...styles.cell, ...styles.actionCell}}>
                <Button type="link" danger icon={<DeleteOutlined style={{color: '#ff7875'}} />} onClick={() => confirmDelete({ type: 'deleteLineItem', payload: item.id })} />
            </div>
          </div>
        ))}
        <div style={styles.subtotalRow}>
            <Text strong>Group Total: £{group.subtotal.toFixed(2)}</Text>
        </div>
      </Fragment>
    ))}
  </div>
);

export default BudgetGrid;