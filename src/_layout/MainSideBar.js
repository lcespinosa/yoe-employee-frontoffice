import {Layout, Menu} from "antd";
import React from "react";
import {
  ApartmentOutlined,
  SettingOutlined,
  DeploymentUnitOutlined
} from "@ant-design/icons";
import {Link} from "react-router-dom";

const { Sider } = Layout;
const { SubMenu } = Menu;

class MainSideBar extends React.Component {
  state = {
    collapsed: false,
  }

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  }

  render() {
    const { collapsed } = this.state;

    return (
      <Sider width={200} className="site-layout-background" collapsible collapsed={collapsed} onCollapse={this.onCollapse} theme="dark">
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          style={{ height: '100%', borderRight: 0 }}
        >
          <SubMenu key="sub1" icon={<DeploymentUnitOutlined />} title="Management">
            <Menu.Item key="1"><Link to='/front/projects'>Projects</Link></Menu.Item>
            <Menu.Item key="2"><Link to='/front/tasks'>Tasks</Link></Menu.Item>
            <Menu.Item key="3"><Link to='/front/manual_entries'>Manual entries</Link></Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<ApartmentOutlined />} title="Organization">
            <Menu.Item key="4">Shift</Menu.Item>
            <Menu.Item key="5">Groups</Menu.Item>
            <Menu.Item key="6">Employees</Menu.Item>
          </SubMenu>
          <SubMenu key="sub3" icon={<SettingOutlined />} title="Configuration">
            <Menu.Item key="7">Roles</Menu.Item>
            <Menu.Item key="8">Users</Menu.Item>
            <Menu.Item key="9">Settings</Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
    )
  }
}

export default MainSideBar;