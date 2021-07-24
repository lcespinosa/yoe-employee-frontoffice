import ContentPage from '../../ContentPage/ContentPage';
import {Button, Space, Tabs, Tag, Form, Radio, Input, Row, Col, Menu, Dropdown, Popconfirm} from "antd";
import { Datatable, CrudForm } from '../../../_components';

import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  DownOutlined,
  EditOutlined,
  OrderedListOutlined,
  CheckOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {useCallback, useRef, useState} from "react";
import {MembersSelector} from "../../../_components/MembersSelector/MembersSelector";
import axios from '../../../global_axios';
import {history} from '../../../_helpers'

const { TabPane } = Tabs;

const Projects = (props) => {

  const [state, setState] = useState({
    tab: 1,
    tableSelection: []
  });

  //References & methods
  const crudRef = useRef();
  const membersRef = useRef();
  const managersRef = useRef();
  const tablePendingRef = useRef();
  const tableCompleteRef = useRef();
  const tableCancelRef = useRef();
  const onNewProject = () => {
    crudRef.current.open(crudOpenCallback);
  }
  const crudOpenCallback = useCallback(() => {
    setTimeout(() => {
      managersRef.current.setTargetKeys([]);
      membersRef.current.setTargetKeys([]);
    }, 100);
  });
  const onCrudAfterSubmit = (values) => {
    return {
      visibility: values.opened ? 'open' : 'private',
      managers: managersRef.current.getTargetKeys(),
      members: membersRef.current.getTargetKeys(),
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
    let url = '/operation/projects';
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
      dataIndex: 'title',
      sorter: true,
      width: '20%',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
    },
    {
      title: 'Visibilidad',
      dataIndex: 'opened',
      render: opened => {
        return opened ? (<Tag color='green'>Público</Tag>) : (<Tag color='gold'>Asignado</Tag>);
      },
      width: '10%',
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
    },

  ];
  const pendingTableColumns = [...commonTableColumns,
    {
      title: 'Acciones',
      key: 'action',
      width: '10%',
      render: (_: any, record) => (
        <Space size="middle">
          <Button type='dashed' icon={<MinusSquareOutlined/>} danger>
            <Popconfirm placement="top" title='¿Está seguro de quitar este proyecto?'
                        onConfirm={() => handleRemoveClick(record)} okText="Si" cancelText="No">
              Quitar
            </Popconfirm>
          </Button>
          <Dropdown overlay={(
            <Menu onClick={e => handleActionMenuClick(e, record)}>
              <Menu.Item key="1" icon={<EditOutlined/>}>
                Modificar
              </Menu.Item>
              <Menu.Item key="2" icon={<OrderedListOutlined/>}>
                Gestionar tareas
              </Menu.Item>
              <Menu.Item key="3" icon={<CheckOutlined/>}>
                <Popconfirm placement="top" title='¿Está seguro de completar este proyecto?'
                            onConfirm={() => handleCompleteClick(record)} okText="Si" cancelText="No">
                  Completar
                </Popconfirm>
              </Menu.Item>
              <Menu.Item key="4" icon={<StopOutlined/>}>
                <Popconfirm placement="top" title='¿Está seguro de cancelar este proyecto?'
                            onConfirm={() => handleCancelClick(record)} okText="Si" cancelText="No">
                  Cancelar
                </Popconfirm>
              </Menu.Item>
            </Menu>
          )}>
            <Button>
              Más <DownOutlined/>
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  //Action Handlers
  const handleRemoveClick = (record) => {
    axios.delete(`/operation/projects/${record.id}`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }
  const handleCompleteClick = (record) => {
    axios.post(`/operation/projects/${record.id}/complete`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
        tableCompleteRef.current?.handleRefresh();
      });
  }
  const handleCancelClick = (record) => {
    axios.post(`/operation/projects/${record.id}/cancel`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
        tableCancelRef.current?.handleRefresh();
      });
  }
  const handleBulkRemoveClick = () => {
    const params = {
      params: {
        records: state.tableSelection
      }
    }
    axios.delete(`/operation/projects/bulk`, params)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }

  const handleActionMenuClick = (e, record) => {
    switch (e.key) {
      case '1': //Edit
        crudRef.current.edit(record, loadProjectMembers, loadProjectManagers);
        break;
      case '2': //Tasks
        history.push(props.match.path + `/${record.id}/tasks`);
        break;
    }
  }

  //Edit loaders
  const loadProjectMembers = (record) => {
    membersRef.current.setTargetKeys(record.members.data, record.opened);
  }
  const loadProjectManagers = (record) => {
    managersRef.current.setTargetKeys(record.managers.data);
  }

  const onChangeTab = tab => {
    console.log(tab);
  }

  const onChangeTableSelection = (selectedRows) => {
    setState({...state, tableSelection: selectedRows});
  }

  //Crud Form handler
  const onVisibilityChange = (e) => {
    membersRef.current?.setDisabled(e.target.value);
  }

  return (

    <ContentPage
      title='Proyectos'
      subTitle='Se muestra el listado de proyectos'
      operations={[
        <Button key="2" type="dashed" icon={<PlusSquareOutlined/>} onClick={onNewProject} className='add-operation-btn'>
          Nuevo
        </Button>,
        <Button key="1" type="dashed" disabled={state.tableSelection.length === 0} danger icon={<MinusSquareOutlined/>}
                className='remove-operation-btn'
        >
          <Popconfirm placement="top" title='¿Está seguro de quitar estos proyectos?'
                      onConfirm={handleBulkRemoveClick} okText="Si" cancelText="No">
              Quitar
          </Popconfirm>
        </Button>
      ]}
    >

      <CrudForm width={1000}
                title='Nuevo proyecto'
                editTitle='Modificar proyecto'
                ref={crudRef}
                onOk={onCrudOkResult}
                afterSubmit={onCrudAfterSubmit}
                action={getCrudAction}
      >
        <Form.Item label="Nombre" name='title'
                   rules={[{required: true, message: 'El nombre del proyecto es requerido'}]}>
          <Input placeholder="Escriba el nombre del proyecto"/>
        </Form.Item>
        <Form.Item label="Descripción" name='description'>
          <Input.TextArea placeholder="Escriba la descripción del proyecto"/>
        </Form.Item>
        <Form.Item label="Visibilidad" name="opened"
                   rules={[{required: true, message: 'El tipo de visibilidad del proyecto es requerido'}]}>
          <Radio.Group value={true} onChange={onVisibilityChange}>
            <Radio.Button value={true}>Abierto</Radio.Button>
            <Radio.Button value={false}>Asignado</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Row gutter={[16]}>

          <Col span={12}>
            <Form.Item label="Encargados" name='managers'>
              <MembersSelector ref={managersRef} displayName='name' ajax='/organization/users/managers'/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Empleados" name='members'>
              <MembersSelector ref={membersRef} displayName='name' ajax='/organization/users/employees'/>
            </Form.Item>
          </Col>

        </Row>
        <Form.Item label="Notas" name='notes'>
          <Input.TextArea placeholder="Escriba las notas del proyecto"/>
        </Form.Item>
      </CrudForm>

      <Tabs defaultActiveKey={state.tab} onChange={onChangeTab}>
        <TabPane tab="Pendiente" key="1">
          <Datatable ref={tablePendingRef} columns={pendingTableColumns} ajax='operation/projects?type=pending' hasSelection={true}
                     onChangeSelection={onChangeTableSelection}/>
        </TabPane>
        <TabPane tab="Completado" key="2">
          <Datatable ref={tableCompleteRef} columns={commonTableColumns} ajax='operation/projects?type=completed'/>
        </TabPane>
        <TabPane tab="Cancelado" key="3">
          <Datatable ref={tableCancelRef} columns={commonTableColumns} ajax='operation/projects?type=canceled'/>
        </TabPane>
      </Tabs>

    </ContentPage>
  )

}

export default Projects;