import {Layout, Menu} from "antd";
import React from "react";
import {
  ApartmentOutlined,
  SettingOutlined,
  DeploymentUnitOutlined,
  LockOutlined
} from "@ant-design/icons";
import {Link} from "react-router-dom";
import {history} from "../_helpers";
import {alertActions} from "../_actions";

const { Sider } = Layout;
const { SubMenu } = Menu;

class MainSideBar extends React.Component {
  state = {
    collapsed: false,
    activeLink: ['1'],
    openLink: ['sub1'],
  }

  constructor(props) {
    super(props);

    this.unlisten = history.listen((location, action) => {
      // set current active
      this.updateCurrentActiveMenu(location);
    });
  }

  componentDidMount() {
    this.updateCurrentActiveMenu(history.location);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  updateCurrentActiveMenu = location => {
    let uri = location.pathname;
    const {link, menu} = this.resolveActiveMenu(uri);
    this.setState({ ...this.state, activeLink: link, openLink: menu});
  }

  resolveActiveMenu = uri => {
    if (/^\/front\/projects$/.test(uri)) {
      return {link: ['1'], menu: ['sub1']};
    }
    if (/^\/front\/projects\/(.*|all)\/tasks$/.test(uri)) {
      return {link: ['2'], menu: ['sub1']};
    }
    if (/^\/front\/projects\/(.*|all)\/tasks\/(.*|all)\/manual_entries$/.test(uri)) {
      return {link: ['3'], menu: ['sub1']};
    }
    if (/^\/front\/projects\/(.*|all)\/tasks\/(.*|all)\/entries$/.test(uri)) {
      return {link: ['4'], menu: ['sub1']};
    }
    if (/^\/front\/employees$/.test(uri)) {
      return {link: ['9'], menu: ['sub2']};
    }
    return {link: ['1'], menu: ['sub1']}; //by default
  }

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ ...this.state, collapsed });
  }

  render() {
    const { collapsed } = this.state;

    return (
      <Sider width={200} className="site-layout-background" collapsible collapsed={collapsed} onCollapse={this.onCollapse} theme="dark">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={this.state.activeLink}
          defaultOpenKeys={this.state.openLink}
          style={{ height: '100%', borderRight: 0 }}

        >
          <SubMenu key="sub1" icon={<DeploymentUnitOutlined />} title="Administración">
            <Menu.Item key="1"><Link to='/front/projects'>Proyectos</Link></Menu.Item>
            <Menu.Item key="2"><Link to='/front/projects/all/tasks'>Tareas</Link></Menu.Item>
            <Menu.Item key="3"><Link to='/front/projects/all/tasks/all/manual_entries'>Entradas manuales</Link></Menu.Item>
            <Menu.Item key="4"><Link to='/front/projects/all/tasks/all/entries'>Entradas de usuario</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<ApartmentOutlined />} title="Organization">
            <Menu.Item key="5">Turnos</Menu.Item>
            <Menu.Item key="6">Groupos</Menu.Item>
            <Menu.Item key="7">Departamentos</Menu.Item>
            <Menu.Item key="8">Encargados</Menu.Item>
            <Menu.Item key="9"><Link to='/front/employees'>Empleados</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="sub4" icon={<SettingOutlined />} title="Configuration">
            <Menu.Item key="10">Horas extra</Menu.Item>
            <Menu.Item key="11">Descansos</Menu.Item>
            <Menu.Item key="12">Settings</Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
    )
  }
}

export default MainSideBar;