import React from 'react';
import styles from './DataGrid.module.css';

const DataGrid = ({ columns, data }) => {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.gridHeader}>
        {columns.map((col) => (
          <div key={col.key} className={styles.cell} style={{ flex: col.flex || 1 }}>
            {col.title}
          </div>
        ))}
      </div>
      {data.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.gridRow}>
          {columns.map((col) => (
            <div key={col.key} className={styles.cell} style={{ flex: col.flex || 1 }}>
              {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DataGrid;
