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
  Select, InputNumber, DatePicker, TimePicker
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
import './ManualEntries.css';
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

const ManualEntries = (props) => {

  const [state, setState] = useState({
    projects: [],
    tasks: [],
    selectedProject: null,
    selectedProjectTask: null,
    selectedProjectId: null,
    selectedProjectTaskId: null,
  });
  const [uiState, setUIState] = useState({
    tab: 1,
    tableSelection: [],
  });
  const [employeesStatus, setEmployeesStatus] = useState({
    employees: [],
    selectedEmployee: null
  });

  //References & methods
  const projectRef = useRef();
  const taskRef = useRef();
  const crudRef = useRef();
  const employeeRef = useRef();
  const tablePendingRef = useRef();
  const tableCompleteRef = useRef();
  const tableCancelRef = useRef();

  const onNewEntry = () => {
    crudRef.current.open(crudOpenCallback);
  }
  const crudOpenCallback = useCallback(() => {
    setTimeout(() => {
      loadEmployees();
    }, 100);
  });
  const onCrudAfterSubmit = (values) => {
    console.log(values);
    return {
      task_id: state.selectedProjectTaskId,
      record_date: values.record_date.format('Y-MM-DD HH:mm:ss'),
      start_time: values.start_time.format('Y-MM-DD HH:mm:ss'),
      end_time: values.end_time.format('Y-MM-DD HH:mm:ss'),
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
    const task = props.match.params.task;
    let url = `/operation/projects/${project}/tasks/${task}/entries`;
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
  const loadEmployees = (selected = null) => {
    axios.get(`/organization/users/employees`)
      .then(({data}) => {
        let users = [];
        data.data.map(item => users.push({
          key: item.id,
          ...item
        }));
        if (selected !== null) {
          const index = users.findIndex(item => item.id === selected.id);
          selected = index >= 0 ? users[index] : null;
        }
        setEmployeesStatus({...employeesStatus, employees: users, selectedEmployee: selected});
      });
  }

  //Column definition
  const commonTableColumns = [

    {
      title: 'Empleado',
      dataIndex: 'user',
      sorter: true,
      width: '20%',
      render: (_: any, record) => {
        return <Text>{record.user.name}</Text>
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'date_time',
      render: (_: any, record) => {
        return <Text>{moment(record.start_time, 'YYYY-MM-DDTHH:mm:ss').format('DD-MM-YYYY')}</Text>
      },
    },
    {
      title: 'Comienzo',
      dataIndex: 'start_time',
      render: (_: any, record) => {
        return <Text>{moment(record.start_time, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')}</Text>
      },
    },
    {
      title: 'Fin',
      dataIndex: 'end_time',
      render: (_: any, record) => {
        return <Text>{moment(record.end_time, 'YYYY-MM-DDTHH:mm:ss').format('HH:mm')}</Text>
      },
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      width: '30%',
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
            <Popconfirm placement="top" title='¿Está seguro de quitar esta entrada?'
                        onConfirm={() => handleRemoveClick(record)} okText="Si" cancelText="No">
              Quitar
            </Popconfirm>
          </Button>
          <Dropdown overlay={(
            <Menu onClick={e => handleActionMenuClick(e, record)}>
              <Menu.Item key="1" icon={<EditOutlined/>}>
                Modificar
              </Menu.Item>
              <Menu.Item key="3" icon={<CheckOutlined/>}>
                <Popconfirm placement="top" title='¿Está seguro de aprobar esta entrada?'
                            onConfirm={() => handleCompleteClick(record)} okText="Si" cancelText="No">
                  Aprobar
                </Popconfirm>
              </Menu.Item>
              <Menu.Item key="4" icon={<StopOutlined/>}>
                <Popconfirm placement="top" title='¿Está seguro de rechazar esta entrada?'
                            onConfirm={() => handleCancelClick(record)} okText="Si" cancelText="No">
                  Rechazar
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
    const task = props.match.params.task;
    axios.delete(`/operation/projects/${project}/tasks/${task}/entries/${record.id}`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }
  const handleCompleteClick = (record) => {
    const project = props.match.params.project;
    const task = props.match.params.task;
    axios.post(`/operation/projects/${project}/tasks/${task}/entries/${record.id}/approve`)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
        tableCompleteRef.current?.handleRefresh();
      });
  }
  const handleCancelClick = (record) => {
    const project = props.match.params.project;
    const task = props.match.params.task;
    axios.post(`/operation/projects/${project}/tasks/${task}/entries/${record.id}/reject`)
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
    const task = props.match.params.task;
    axios.delete(`/operation/projects/${project}/tasks/${task}/entries/bulk`, params)
      .then(_ => {
        tablePendingRef.current.handleRefresh();
      });
  }

  const handleActionMenuClick = (e, record) => {
    switch (e.key) {
      case '1': //Edit
        crudRef.current.edit(record, loadEmployees);
        break;
    }
  }

  const onChangeTab = tab => {
    console.log(tab);
  }

  const onChangeTableSelection = (selectedRows) => {
    setUIState({...uiState, tableSelection: selectedRows});
  }

  //Parent project selection
  useEffect(() => {
    loadProjectsSelect();
  }, []);

  //Project Selection
  const loadProjectsSelect = useCallback(() => {
    axios.get('operation/projects?type=pending')
      .then(({data}) => {
        const projects = data.data;
        let urlProject = parseInt(props.match.params.project);
        if (isNaN(urlProject)) {
          urlProject = projects[0]?.id;
          updateCurrentPath(urlProject);
        }

        loadProjectTasksSelect(projects, urlProject);
      });
  }, []);
  const getSelectedProjectIndex = (id, projects = null) => {
    projects = projects || state.projects;
    return projects.findIndex((item) => item.id === id);
  }
  const onSelectProject = (value) => {
    const projectIndex = getSelectedProjectIndex(value);
    // setState({
    //   ...state,
    //   selectedProject: {
    //     ...state.projects[projectIndex]
    //   },
    //   selectedProjectId: value
    // });
    loadProjectTasksSelect(state.projects, value);
    projectRef.current.blur();
    // refreshTable();
    updateCurrentPath(value);
  }

  //Task Selection
  const loadProjectTasksSelect = useCallback((projects, urlProject) => {
    const index = getSelectedProjectIndex(urlProject, projects);
    const selectedProject = projects[index];

    if (urlProject !== undefined) {
      axios.get(`operation/projects/${urlProject}/tasks?type=pending`)
        .then(({data}) => {
          const tasks = data.data;
          let urlTask = parseInt(props.match.params.task);
          if (isNaN(urlTask)) {
            urlTask = tasks[0]?.id;
          }
          const taskIndex = getSelectedProjectTaskIndex(urlTask, tasks);
          let selectedTask;
          if (taskIndex === -1) {
            selectedTask = tasks[0];
            urlTask = selectedTask?.id;
          }
          else {
            selectedTask = tasks[taskIndex];
          }
          updateCurrentPath(urlProject,urlTask);

          setState({...state,
            projects: projects,
            selectedProjectId: urlProject,
            selectedProject,
            tasks: tasks,
            selectedProjectTaskId: urlTask,
            selectedProjectTask: selectedTask
          });
          refreshTable();
        });
    }
  }, []);
  const getSelectedProjectTaskIndex = (id, tasks = null) => {
    tasks = tasks || state.tasks;
    return tasks.findIndex((item) => item.id === id);
  }
  const onSelectProjectTask = (value) => {
    const taskIndex = getSelectedProjectTaskIndex(value);
    setState({
      ...state,
      selectedProjectTask: {
        ...state.tasks[taskIndex]
      },
      selectedProjectTaskId: value
    });
    taskRef.current.blur();
    refreshTable();
    updateCurrentPath(null,value);
  }
  const updateCurrentPath = (projectValue = null, taskValue = null) => {
    projectValue = projectValue || props.match.params.project;
    taskValue = taskValue || props.match.params.task;
    let path = props.match.path;
    path = path.replace(':project', projectValue);
    path = path.replace(':task', taskValue);
    history.push(path);
  }

  //Tables
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
  const taskVisibilityDescription = () => {
    let visibility = '';
    if (state.selectedProjectTask !== undefined) {
      visibility = state.selectedProjectTask?.opened ? (<Tag color='green'>Público</Tag>) : (
        <Tag color='gold'>Asignado</Tag>);
    }
    return visibility;
  }
  const getProjectTaskUrlParam = (type) => {
    const projectId = state.selectedProject?.id || props.match.params.project;
    const taskId = state.selectedProjectTask?.id || props.match.params.task;
    if (projectId === undefined || taskId === undefined || type === undefined) {
      return '';
    }
    return `operation/projects/${projectId}/tasks/${taskId}/entries?type=${type}`;
  }

  return (

    <ContentPage
      title='Entradas manuales'
      subTitle='Se muestra el listado de todas las entradas manuales de empleados'
      operations={[
        <Button key="2" type="dashed" icon={<PlusSquareOutlined/>} onClick={onNewEntry} className='add-operation-btn'
                disabled={state.selectedProjectId === undefined || state.selectedProjectTaskId === undefined}
        >
          Nueva
        </Button>,
        <Button key="1" type="dashed" disabled={uiState.tableSelection.length === 0} danger icon={<MinusSquareOutlined/>}
                className='remove-operation-btn'
        >
          <Popconfirm placement="top" title='¿Está seguro de quitar estas entradas manuales?'
                      onConfirm={handleBulkRemoveClick} okText="Si" cancelText="No">
            Quitar
          </Popconfirm>
        </Button>
      ]}
      descriptions={(<>
        <Descriptions key='project' title="Projecto">
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
        <Descriptions key='task' title="Tarea">
          <Descriptions.Item key='name' label='Nombre'>
            <Select
              ref={taskRef}
              onSelect={onSelectProjectTask}
              size='small'
              showSearch
              style={{width: 200}}
              placeholder="Buscar y seleccionar"
              optionFilterProp="children"
              value={state.selectedProjectTaskId}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
            >
              {state.tasks.map(item => <Option key={item.id} value={item.id}>{item.title}</Option>)}
            </Select>
          </Descriptions.Item>
          <Descriptions.Item key='description'
                             label='Descripción'>{state.selectedProjectTask?.description}</Descriptions.Item>
          <Descriptions.Item key='visibility' label='Visibilidad'>{taskVisibilityDescription()}</Descriptions.Item>
          <Descriptions.Item key='notes' label='Notas'>{state.selectedProjectTask?.notes}</Descriptions.Item>
        </Descriptions>
      </>)}
    >

      <CrudForm title='Nueva entrada manual'
                editTitle='Modificar entrada manual'
                ref={crudRef}
                onOk={onCrudOkResult}
                afterSubmit={onCrudAfterSubmit}
                action={getCrudAction}
      >
        <Form.Item label="Empleado" name='user_id'
                   rules={[{required: true, message: 'El nombre del empleado es requerido'}]}>
          <Select
            ref={employeeRef}
            showSearch
            // style={{width: 200}}
            placeholder="Buscar y seleccionar"
            optionFilterProp="children"
            // value={state.selectedProjectId}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
          >
            {employeesStatus.employees.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
          </Select>
        </Form.Item>
        <Row  gutter={[16]}>
          <Col span={8}>
            <Form.Item label="Fecha" name='record_date' rules={[{required: true, message: 'La fecha es requerida'}]}>
              <DatePicker />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Comienzo" name='start_time' dependencies={['end_time']} rules={[
              {required: true, message: 'La hora de inicio es requerida'},
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const endValue = getFieldValue('end_time');
                  if (!value || !endValue || endValue.isAfter(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('La hora de inicio es posterior a la hora de fin.'));
                },
              }),
            ]}>
              <TimePicker use12Hours format="h:mm a" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Fin" name='end_time' dependencies={['start_time']} rules={[
              {required: true, message: 'La hora de fin es requerida'},
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startValue = getFieldValue('start_time');
                  if (!value || !startValue || startValue.isBefore(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('La hora de fin es anterior a la hora de inicio.'));
                },
              }),
            ]}>
              <TimePicker use12Hours format="h:mm a" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Notas" name='notes'>
          <Input.TextArea placeholder="Escriba las notas de la tarea"/>
        </Form.Item>
      </CrudForm>

      <Tabs defaultActiveKey={uiState.tab} onChange={onChangeTab}>
        <TabPane tab="Pendiente" key="1">
          <Datatable ref={tablePendingRef} columns={pendingTableColumns}
                     ajax={getProjectTaskUrlParam('pending')} hasSelection={true}
                     onChangeSelection={onChangeTableSelection}/>
        </TabPane>
        <TabPane tab="Aprobado" key="2">
          <Datatable ref={tableCompleteRef} columns={commonTableColumns}
                     ajax={getProjectTaskUrlParam('approved')}/>
        </TabPane>
        <TabPane tab="Rechazado" key="3">
          <Datatable ref={tableCancelRef} columns={commonTableColumns}
                     ajax={getProjectTaskUrlParam('rejected')}/>
        </TabPane>
      </Tabs>

    </ContentPage>
  )

}

export default ManualEntries;