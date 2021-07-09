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

const { TabPane } = Tabs;

const Projects = (props) => {

  //References & methods
  const crudRef = useRef();
  const membersRef = useRef();
  const managersRef = useRef();
  const tablePendingRef = useRef();
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
    }
    else {
      tablePendingRef.current.handleAdd(data);
    }
  }

  //Column definition
  const tableColumns = [

    {
      title: 'Name',
      dataIndex: 'title',
      sorter: true,
      width: '20%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Visibility',
      dataIndex: 'opened',
      render: opened => { return opened ? (<Tag color='green'>Público</Tag>) : (<Tag color='gold'>Asignado</Tag>); },
      width: '10%',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      render: (_: any, record) => (
        <Space size="middle">
          <Popconfirm placement="top" title='¿Está seguro de quitar este proyecto?' onConfirm={() => handleRemoveClick(record)} okText="Si" cancelText="No">
            <Button type='dashed' icon={<MinusSquareOutlined />} danger>Quitar</Button>
          </Popconfirm>
          <Dropdown overlay={(
            <Menu onClick={e => handleActionMenuClick(e, record)}>
              <Menu.Item key="1" icon={<EditOutlined />}>
                Modificar
              </Menu.Item>
              <Menu.Item key="2" icon={<OrderedListOutlined />}>
                Gestionar tareas
              </Menu.Item>
              <Menu.Item key="3" icon={<CheckOutlined />}>
                <Popconfirm placement="top" title='¿Está seguro de completar este proyecto?' onConfirm={() => handleRemoveClick(record)} okText="Si" cancelText="No">
                    Completar
                </Popconfirm>
              </Menu.Item>
              <Menu.Item key="4" icon={<StopOutlined />}>
                <Popconfirm placement="top" title='¿Está seguro de cancelar este proyecto?' onConfirm={() => handleRemoveClick(record)} okText="Si" cancelText="No">
                    Cancelar
                </Popconfirm>
              </Menu.Item>
            </Menu>
          )}>
            <Button>
              Más <DownOutlined />
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
        tablePendingRef.current.handleDelete(record.id);
      });
  }

  const handleActionMenuClick = (e, record) => {
    switch (e.key) {
      case '1': //Edit
        crudRef.current.edit(record, loadProjectMembers, loadProjectManagers);
        break;
      case '2': //Tasks
        break;
    }
  }

  //Edit loaders
  const loadProjectMembers = (record) => {
    membersRef.current.setTargetKeys(record.members.data);
  }
  const loadProjectManagers = (record) => {
    managersRef.current.setTargetKeys(record.managers.data);
  }

  const onChangeTab = tab => {
    console.log(tab);
  }

  return (

    <ContentPage
      title='Proyectos'
      subTitle='Se muestra el listado de proyectos'
      operations={[
        <Button key="2" type="dashed" icon={<PlusSquareOutlined />} onClick={onNewProject} className='add-operation-btn'>
          Nuevo
        </Button>,
        <Button key="1" type="dashed" danger icon={<MinusSquareOutlined />} className='remove-operation-btn'>
          Quitar
        </Button>,
      ]}
    >

      <CrudForm width={1000}
        title='Nuevo proyecto'
        editTitle='Modificar proyecto'
        ref={crudRef}
        onOk={onCrudOkResult}
        afterSubmit={onCrudAfterSubmit}
      >
        <Form.Item label="Nombre" name='title' rules={[{ required: true, message: 'El nombre del proyecto es requerido' }]}>
          <Input placeholder="Escriba el nombre del proyecto" />
        </Form.Item>
        <Form.Item label="Descripción" name='description'>
          <Input.TextArea placeholder="Escriba la descripción del proyecto" />
        </Form.Item>
        <Form.Item label="Visibilidad" name="opened" rules={[{ required: true, message: 'El tipo de visibilidad del proyecto es requerido' }]}>
          <Radio.Group>
            <Radio.Button value={true}>Abierto</Radio.Button>
            <Radio.Button value={false}>Asignado</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Row gutter={[16]}>

          <Col span={12}>
            <Form.Item label="Encargados" name='managers'>
              <MembersSelector ref={managersRef} displayName='name' ajax='/organization/users' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Miembros" name='members'>
              <MembersSelector ref={membersRef} displayName='name' ajax='/organization/users' />
            </Form.Item>
          </Col>

        </Row>
        <Form.Item label="Notas" name='notes'>
          <Input.TextArea placeholder="Escriba las notas del proyecto" />
        </Form.Item>
      </CrudForm>

      <Tabs defaultActiveKey="1" onChange={onChangeTab}>
        <TabPane tab="Pendiente" key="1">
          <Datatable ref={tablePendingRef} columns={tableColumns} ajax='operation/projects' />
        </TabPane>
        <TabPane tab="Completado" key="2">
          Content of Tab Pane 2
        </TabPane>
        <TabPane tab="Cancelado" key="3">
          Content of Tab Pane 3
        </TabPane>
      </Tabs>

    </ContentPage>
  )


}

export default Projects;