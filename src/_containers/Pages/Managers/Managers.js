import {useCallback, useRef, useState} from "react";
import {
  Button,
  Col,
  Dropdown,
  Form,
  Input,
  Menu,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography
} from "antd";
import {
  CheckOutlined,
  DownOutlined,
  EditOutlined,
  MinusSquareOutlined,
  OrderedListOutlined, PlusSquareOutlined,
  StopOutlined
} from "@ant-design/icons";
import axios from "../../../global_axios";
import ContentPage from "../../ContentPage/ContentPage";
import {CrudForm, Datatable} from "../../../_components";

const {Text} = Typography
const { Option } = Select;

const Employees = (props) => {

  const [state, setState] = useState({
    tab: 1,
    tableSelection: [],
    editMode: false
  });

  const [phoneState, setPhoneState] = useState({
    phones: []
  });

  //References & methods
  const crudRef = useRef();
  const phonesRef = useRef();
  const tablePendingRef = useRef();
  const onNewEmployee = () => {
    setState({
      ...state,
      editMode: false
    })
    crudRef.current.open(crudOpenCallback);
  }
  const crudOpenCallback = useCallback(() => {
    setTimeout(() => {
    }, 100);
  });
  const onCrudAfterSubmit = (values) => {
    return {
    };
  }
  const onCrudOkResult = (editMode, data) => {
    if (editMode) {
      tablePendingRef.current.handleUpdate(data);
    } else {
      tablePendingRef.current.handleAdd(data);
    }
  }
  const getCrudAction = (editMode, record, values) => {
    let url = '/organization/users/employees';
    let method = 'post';
    if (editMode) {
      url += `/${record.id}`;
      method = 'put';
    }
    return {
      url,
      method,
    };
  }

  //Column definition
  const commonTableColumns = [

    {
      title: 'Nombre',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
    },
    {
      title: 'Correo',
      dataIndex: 'email',
    },
    {
      title: 'Teléfonos',
      dataIndex: 'phones',
      render: phones => {
        return <Text>{phones?.join(', ')}</Text>;
      },
    },
    {
      title: 'Activo',
      dataIndex: 'active',
      render: active => {
        return active === null || active === 1 ? (<Tag color='green'>Si</Tag>) : (<Tag color='red'>No</Tag>);
      },
      width: '10%',
    },
    {
      title: 'Acciones',
      key: 'action',
      width: '10%',
      render: (_: any, record) => (
        <Space size="middle">
          <Button type='dashed' icon={<MinusSquareOutlined/>} danger>
            <Popconfirm placement="top" title='¿Está seguro de quitar este empleado?'
                        onConfirm={() => handleRemoveClick(record)} okText="Si" cancelText="No">
              Quitar
            </Popconfirm>
          </Button>
          <Button type='default' icon={<EditOutlined/>} onClick={() => handleEditClick(record)}>
            Modificar
          </Button>
        </Space>
      ),
    },
  ];

  //Action Handlers
  const handleRemoveClick = (record) => {
    axios.delete(`/organization/users/employees/${record.id}`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }
  const handleEditClick = (record) => {
    setState({
      ...state,
      editMode: true
    })
    crudRef.current.edit(record);
  }
  const handleBulkRemoveClick = () => {
    const params = {
      params: {
        records: state.tableSelection
      }
    }
    axios.delete(`/organization/users/employees/bulk`, params)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }

  const onChangeTableSelection = (selectedRows) => {
    setState({...state, tableSelection: selectedRows});
  }

  return (

    <ContentPage
      title='Empleados'
      subTitle='Se muestra el listado de empleados'
      operations={[
        <Button key="2" type="dashed" icon={<PlusSquareOutlined/>} onClick={onNewEmployee} className='add-operation-btn'>
          Nuevo
        </Button>,
        <Button key="1" type="dashed" disabled={state.tableSelection.length === 0} danger icon={<MinusSquareOutlined/>}
                className='remove-operation-btn'
        >
          <Popconfirm placement="top" title='¿Está seguro de quitar estos empleados?'
                      onConfirm={handleBulkRemoveClick} okText="Si" cancelText="No">
            Quitar
          </Popconfirm>
        </Button>
      ]}
    >

      <CrudForm title='Nuevo empleado'
                editTitle='Modificar empleado'
                ref={crudRef}
                onOk={onCrudOkResult}
                afterSubmit={onCrudAfterSubmit}
                action={getCrudAction}
      >
        <Form.Item label="Nombre" name='name'
                   rules={[{required: true, message: 'El nombre del empleado es requerido'}]}>
          <Input placeholder="Escriba el nombre del empleado"/>
        </Form.Item>

        <Form.Item label="Usuario" name='username'
                   rules={[{required: true, message: 'El nombre de usuario es requerido'}]}>
          <Input placeholder="Escriba el usuario del empleado"/>
        </Form.Item>

        <Form.Item label="Correo" name='email'>
          <Input placeholder="Escriba el correo del empleado"/>
        </Form.Item>

        <Form.Item label="Pin" name='pin'
                   rules={ state.editMode ? [
                     {len: 5, message: 'El pin del empleado solo puede tener 5 números'},
                   ] : [
                     {required: true, message: 'El pin del empleado es requerido'},
                     {len: 5, message: 'El pin del empleado solo puede tener 5 números'},
                   ]}>
          <Input placeholder="Escriba el correo del empleado"/>
        </Form.Item>

        <Form.Item label="Teléfonos" name='phones'>
          <Select defaultValue={[]} ref={phonesRef} mode="tags" style={{ width: '100%' }}
                  placeholder="Escriba los números de teléfono del empleado"/>
        </Form.Item>

      </CrudForm>

      <Datatable ref={tablePendingRef} columns={commonTableColumns} ajax='organization/users/employees' hasSelection={true}
                   onChangeSelection={onChangeTableSelection}/>

    </ContentPage>
  )
}

export default Employees