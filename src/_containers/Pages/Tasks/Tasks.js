import ContentPage from '../../ContentPage/ContentPage';
import {
  Button,
  Space,
  Tabs,
  Tag,
  Form,
  Radio,
  Input,
  Row,
  Col,
  Menu,
  Typography,
  Dropdown,
  Popconfirm,
  Descriptions,
  Select, InputNumber
} from "antd";
import { Datatable, CrudForm } from '../../../_components';

import {useCallback, useEffect, useRef, useState} from "react";
import {MembersSelector} from "../../../_components/MembersSelector/MembersSelector";
import { history } from '../../../_helpers';
import axios from '../../../global_axios';
import {
  CheckOutlined,
  DownOutlined,
  EditOutlined,
  MinusSquareOutlined,
  OrderedListOutlined, PlusSquareOutlined,
  StopOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import './Tasks.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

const Tasks = (props) => {

  const [state, setState] = useState({
    projects: [],
    selectedProject: null,
    selectedProjectId: null,
  });
  const [uiState, setUIState] = useState({
    tab: 1,
    tableSelection: [],
  });
  const [estimationState, setEstimationState] = useState({
    calculatedEstimation: '',
  });

  //References & methods
  const projectRef = useRef();
  const crudRef = useRef();
  const membersRef = useRef();
  const managersRef = useRef();
  const tablePendingRef = useRef();
  const tableCompleteRef = useRef();
  const tableCancelRef = useRef();

  const onNewTask = () => {
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
    const project = props.match.params.project;
    let url = `/operation/projects/${project}/tasks`;
    console.log('Crud action ' + url);
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
        return opened ? (<Tag color='green'>Pública</Tag>) : (<Tag color='gold'>Asignada</Tag>);
      },
      width: '10%',
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
    },
    {
      title: 'Horas estimadas',
      dataIndex: 'estimated_hours',
      width: '12%',
    },
    {
      title: 'Total de horas',
      dataIndex: 'total_time',
      width: '12%',
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
            <Popconfirm placement="top" title='¿Está seguro de quitar esta tarea?'
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
                Gestionar entradas
              </Menu.Item>
              <Menu.Item key="3" icon={<CheckOutlined/>}>
                <Popconfirm placement="top" title='¿Está seguro de completar esta tarea?'
                            onConfirm={() => handleCompleteClick(record)} okText="Si" cancelText="No">
                  Completar
                </Popconfirm>
              </Menu.Item>
              <Menu.Item key="4" icon={<StopOutlined/>}>
                <Popconfirm placement="top" title='¿Está seguro de cancelar esta tarea?'
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
    const project = props.match.params.project;
    axios.delete(`/operation/projects/${project}/tasks/${record.id}`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }
  const handleCompleteClick = (record) => {
    const project = props.match.params.project;
    axios.post(`/operation/projects/${project}/tasks/${record.id}/complete`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
        tableCompleteRef.current?.handleRefresh();
      });
  }
  const handleCancelClick = (record) => {
    const project = props.match.params.project;
    axios.post(`/operation/projects/${project}/tasks/${record.id}/cancel`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
        tableCancelRef.current?.handleRefresh();
      });
  }
  const handleBulkRemoveClick = () => {
    const params = {
      params: {
        records: uiState.tableSelection
      }
    }
    const project = props.match.params.project;
    axios.delete(`/operation/projects/${project}/tasks/bulk`, params)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }

  const handleActionMenuClick = (e, record) => {
    switch (e.key) {
      case '1': //Edit
        crudRef.current.edit(record, loadTaskMembers, loadTaskManagers);
        break;
      case '2': //Manual Entries
        history.push(props.match.url + `/${record.id}/entries`);
        break;
    }
  }

  //Edit loaders
  const loadTaskMembers = (record) => {
    membersRef.current.setTargetKeys(record.members.data, record.opened);
  }
  const loadTaskManagers = (record) => {
    managersRef.current.setTargetKeys(record.managers.data);
  }

  const onChangeTab = tab => {
    console.log(tab);
  }

  const onChangeTableSelection = (selectedRows) => {
    setUIState({...uiState, tableSelection: selectedRows});
  }

  //Estimation calc
  const onEstimatedHoursChange = () => {
    const hours = crudRef.current.getForm().getFieldsValue().estimated_hours;
    const manCount = membersRef.current.getTargetKeys().length;
    let strTime = '';
    if (manCount > 0) {
      let carrier = Math.floor(hours / manCount);
      const dayHours = 8;
      const weekHours = dayHours * 5;
      const monthHours = weekHours * 4;
      let manHours = 0, manDays = 0, manWeeks = 0, manMonths = 0;
      //Convert to ...
      strTime = '= (';
      if (carrier > monthHours) { //Expresar en meses
        manMonths = Math.floor(carrier / monthHours);
        carrier %= monthHours;
        strTime += manMonths > 0 ? manMonths + ' meses, ' : '';
      }
      if (carrier > weekHours) {
        manWeeks = Math.floor(carrier / weekHours);
        carrier %= weekHours;
        strTime += manWeeks > 0 ? manWeeks + ' semanas, ' : '';
      }
      if (carrier > dayHours) {
        manDays = Math.floor(carrier / dayHours);
        carrier %= dayHours;
        strTime += manDays > 0 ? manDays + ' días, ' : '';
      }
      manHours = carrier;
      strTime += manHours > 0 ? manHours + ' horas, ' : '';

      //To string
      strTime += ')/Hombre';
    }
    setEstimationState({...estimationState, calculatedEstimation: strTime});
  }

  //Crud Form handler
  const onVisibilityChange = (e) => {
    membersRef.current?.setDisabled(e.target.value);
    updateEstimatedInfo();
  }
  const updateEstimatedInfo = useCallback(() => {
    setTimeout(() => {
      onEstimatedHoursChange();
    }, 100);
  }, []);

  //Parent project selection
  useEffect(() => {
    loadProjectsSelect();
  }, []);

  const loadProjectsSelect = useCallback(() => {
    axios.get('operation/projects?type=pending')
      .then(({data}) => {
        const projects = data.data;
        let urlProject = parseInt(props.match.params.project);
        if (isNaN(urlProject)) {
          urlProject = projects[0]?.id;
          updateCurrentPath(urlProject);
        }
        const index = getSelectedProjectIndex(urlProject, projects);
        const selectedProject = projects[index];

        setState({...state, projects: projects, selectedProjectId: urlProject, selectedProject});
        refreshTable();
      });
  }, []);
  const getSelectedProjectIndex = (id, projects = null) => {
    projects = projects || state.projects;
    return projects.findIndex((item) => item.id === id);
  }
  const onSelectProject = (value) => {
    const projectIndex = getSelectedProjectIndex(value);
    setState({
      ...state,
      selectedProject: {
        ...state.projects[projectIndex]
      },
      selectedProjectId: value
    });
    projectRef.current.blur();
    refreshTable();
    updateCurrentPath(value);
  }
  const updateCurrentPath = (value) => {
    let path = props.match.path;
    path = path.replace(':project', value);
    history.push(path);
  }

  const refreshTable = useCallback(() => {
    setTimeout(_ => {
      tablePendingRef.current?.handleRefresh();
      tableCompleteRef.current?.handleRefresh();
      tableCancelRef.current?.handleRefresh();
    }, 200)
  }, []);

  const projectVisibilityDescription = () => {
    let visibility = '';
    if (state.selectedProject !== undefined) {
      visibility = state.selectedProject?.opened ? (<Tag color='green'>Público</Tag>) : (
        <Tag color='gold'>Asignado</Tag>);
    }
    return visibility;
  }
  const getProjectUrlParam = (type) => {
    const id = state.selectedProject?.id || props.match.params.project;
    if (id === undefined || type === undefined) {
      return '';
    }
    return `operation/projects/${id}/tasks?type=${type}`;
  }

  return (

    <ContentPage
      title='Tareas'
      subTitle='Se muestra el listado de todas las tareas'
      operations={[
        <Button key="2" type="dashed" icon={<PlusSquareOutlined/>} onClick={onNewTask} className='add-operation-btn'
                disabled={state.selectedProjectId === undefined}
        >
          Nueva
        </Button>,
        <Button key="1" type="dashed" disabled={uiState.tableSelection.length === 0} danger icon={<MinusSquareOutlined/>}
                className='remove-operation-btn'
        >
          <Popconfirm placement="top" title='¿Está seguro de quitar estas tareas?'
                      onConfirm={handleBulkRemoveClick} okText="Si" cancelText="No">
            Quitar
          </Popconfirm>
        </Button>
      ]}
      descriptions={(
        <Descriptions title="Projecto">
          <Descriptions.Item key='name' label='Nombre'>
            <Select
              ref={projectRef}
              onSelect={onSelectProject}
              size='small'
              showSearch
              style={{width: 200}}
              placeholder="Buscar y seleccionar"
              optionFilterProp="children"
              value={state.selectedProjectId}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
            >
              {state.projects.map(item => <Option key={item.id} value={item.id}>{item.title}</Option>)}
            </Select>
          </Descriptions.Item>
          <Descriptions.Item key='description'
                             label='Descripción'>{state.selectedProject?.description}</Descriptions.Item>
          <Descriptions.Item key='visibility' label='Visibilidad'>{projectVisibilityDescription()}</Descriptions.Item>
          <Descriptions.Item key='notes' label='Notas'>{state.selectedProject?.notes}</Descriptions.Item>
        </Descriptions>
      )}
    >

      <CrudForm width={1000}
                title='Nueva tarea'
                editTitle='Modificar tarea'
                ref={crudRef}
                onOk={onCrudOkResult}
                afterSubmit={onCrudAfterSubmit}
                action={getCrudAction}
      >
        <Form.Item label="Nombre" name='title'
                   rules={[{required: true, message: 'El nombre de la tarea es requerido'}]}>
          <Input placeholder="Escriba el nombre de la tarea"/>
        </Form.Item>
        <Form.Item label="Descripción" name='description'>
          <Input.TextArea placeholder="Escriba la descripción de la tarea"/>
        </Form.Item>
        <Form.Item label="Visibilidad" name="opened"
                   rules={[{required: true, message: 'El tipo de visibilidad de la tarea es requerido'}]}
        >
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
            <Form.Item label="Miembros" name='members'>
              <MembersSelector ref={membersRef} displayName='name' ajax='/organization/users/employees' onChangeTargetKeys={onEstimatedHoursChange}/>
            </Form.Item>
          </Col>

        </Row>
        <Row gutter={[16]}>
          <Col span={3}>
            <Form.Item label="Horas estimadas" name='estimated_hours'>
              <InputNumber min={1} onChange={onEstimatedHoursChange}/>
            </Form.Item>
          </Col>

          <Col span={21}>
            <div  className='estimated-hours-info'>
              <Text> {estimationState.calculatedEstimation} </Text>
              <Text style={{marginLeft: '15px'}}><ExclamationCircleOutlined /> Escriba un valor estimado de horas para esta tarea </Text>
            </div>
          </Col>
        </Row>
        <Form.Item label="Notas" name='notes'>
          <Input.TextArea placeholder="Escriba las notas de la tarea"/>
        </Form.Item>
      </CrudForm>

      <Tabs defaultActiveKey={uiState.tab} onChange={onChangeTab}>
        <TabPane tab="Pendiente" key="1">
          <Datatable ref={tablePendingRef} columns={pendingTableColumns}
                     ajax={getProjectUrlParam('pending')} hasSelection={true}
                     onChangeSelection={onChangeTableSelection}/>
        </TabPane>
        <TabPane tab="Completado" key="2">
          <Datatable ref={tableCompleteRef} columns={commonTableColumns}
                     ajax={getProjectUrlParam('completed')}/>
        </TabPane>
        <TabPane tab="Cancelado" key="3">
          <Datatable ref={tableCancelRef} columns={commonTableColumns}
                     ajax={getProjectUrlParam('canceled')}/>
        </TabPane>
      </Tabs>

    </ContentPage>
  )
}

export default Tasks;