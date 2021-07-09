import { Table } from 'antd';
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import axios from '../../global_axios';

export const Datatable = forwardRef((props, ref) => {

  const [loading, setLoading] = useState({loading: false});
  const [selectedRowKeys, setSelectedRowKeys] = useState({selectedRowKeys: []});
  const [tableData, setTableData] = useState({data: []});
  const [pagination, setPagination] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  useEffect(() => {
    fetch({pagination});
  }, []);

  useImperativeHandle(ref, () => ({

    handleDelete(key) {
      const dataSource = [...tableData.data];
      setTableData({ data: dataSource.filter(item => item.id !== key) });
    },

    handleAdd(row) {
      console.log(row);
      const newData = {
        key: row.id,
        ...row
      };

      const dataSource = [...tableData.data];
      setTableData({
        data: [...dataSource, newData],
      });
    },

    handleUpdate(row) {
      const dataSource = [...tableData.data];
      const index = dataSource.findIndex(x => x.id === row.id);
      dataSource[index] = {
        key: row.id,
        ...row
      }
      setTableData({data: [...dataSource]});
    },

  }));

  const onSelectChange = selectedRows => {
    setSelectedRowKeys(selectedRows);
  };

  const rowSelection = {
    ...selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleTableChange = (pagnation, filters, sorter) => {
    const params = {
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination: pagnation,
      ...filters,
    };
    fetch(params);
  };

  const fetch = (params = {}) => {
    setLoading({loading: true});
    axios.get(`/${props.ajax}`, {params: params})
      .then(({data}) => {
        console.log(data);
        setTableData({data: data.data});
        setLoading({loading: false});
        onSelectChange([]);
      });
  }

  return (

    <Table
      columns={props.columns}
      rowKey={record => record.id}
      rowSelection={rowSelection}
      dataSource={tableData.data}
      pagination={pagination.pagination}
      loading={loading.loading}
      onChange={handleTableChange}
    />

  )

})