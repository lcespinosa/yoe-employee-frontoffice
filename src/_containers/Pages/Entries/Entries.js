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
  PlusSquareOutlined,
  StopOutlined,
} from "@ant-design/icons";
import './Entries.css';
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

const Entries = (props) => {

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

  //References & methods
  const projectRef = useRef();
  const taskRef = useRef();
  const tablePendingRef = useRef();

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
        return <Text>{moment(record.record_time, moment.DATE).format('DD-MM-YYYY')}</Text>
      },
    },
    {
      title: 'Comienzo',
      dataIndex: 'start_time',
      render: (_: any, record) => {
        return <Text>{moment(record.start_time, 'YYYY-MM-DD HH:mm').format('HH:mm')}</Text>
      },
    },
    {
      title: 'Fin',
      dataIndex: 'end_time',
      render: (_: any, record) => {
        return <Text>{moment(record.end_time, 'YYYY-MM-DD HH:mm').format('HH:mm')}</Text>
      },
    },
    {
      title: 'Total de horas',
      dataIndex: 'total_time',
      width: '12%',
      render: (_: any, record) => {
        return <Text>{Math.floor(record.total_time/3600)}</Text>
      },
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
    loadProjectTasksSelect(state.projects, value);
    projectRef.current.blur();
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
  const getProjectTaskUrlParam = () => {
    const projectId = state.selectedProject?.id || props.match.params.project;
    const taskId = state.selectedProjectTask?.id || props.match.params.task;
    if (projectId === undefined || taskId === undefined) {
      return '';
    }
    return `operation/projects/${projectId}/tasks/${taskId}/entries?entries_only=true`;
  }

  return (

    <ContentPage
      title='Entradas de usuario'
      subTitle='Se muestra el listado de todas las entradas de empleados'
      operations={[
        <Button key="1" type="dashed" disabled={uiState.tableSelection.length === 0} danger icon={<MinusSquareOutlined/>}
                className='remove-operation-btn'
        >
          <Popconfirm placement="top" title='¿Está seguro de quitar estas entradas?'
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

     <Datatable ref={tablePendingRef} columns={pendingTableColumns}
                 ajax={getProjectTaskUrlParam()} hasSelection={true}
                 onChangeSelection={onChangeTableSelection}/>

    </ContentPage>
  )

}

export default Entries;