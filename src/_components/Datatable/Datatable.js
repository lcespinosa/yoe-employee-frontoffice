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
      pageSize: 15,
    },
  });

  useEffect(() => {
    fetch(pagination);
  }, []);

  useImperativeHandle(ref, () => ({

    handleRefresh() {
      fetch(pagination);
    },

    handleAdd(row) {
      const newData = {
        key: row.id,
        ...row
      };

      const dataSource = [...tableData.data];
      setTableData({
        data: [...dataSource, newData],
      });
      let paginator = {...pagination};
      paginator.pagination.total = dataSource.length + 1;
      setPagination(paginator);
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
    props.onChangeSelection(selectedRows);
  };

  const rowSelection = {
    ...selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const params = {
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination: pagination,
      ...filters,
    };
    fetch(params);
  };

  const fetch = (params = {}) => {
    setLoading({loading: true});
    axios.get(`/${props.ajax}`, {params: params})
      .then(({data}) => {
        setTableData({data: data.data});
        setLoading({loading: false});
        setPagination({
          pagination: {
            current: data.meta.pagination.current_page,
            pageSize: data.meta.pagination.per_page,
            total: data.meta.pagination.total
          },
        });
        if (props.hasSelection) {
          onSelectChange([]);
        }
      });
  }

  return (

    <Table
      columns={props.columns}
      rowKey={record => record.id}
      rowSelection={props.hasSelection ? rowSelection : null}
      dataSource={tableData.data}
      pagination={pagination.pagination}
      loading={loading.loading}
      onChange={handleTableChange}
    />

  )

})