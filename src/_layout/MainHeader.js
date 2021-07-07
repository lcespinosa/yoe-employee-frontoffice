import {Layout, Menu, Space} from 'antd';
import React from "react";
import logo from '../_assets/Logo Largo.png';
import {Link} from "react-router-dom";
import { connect } from "react-redux";

const { Header } = Layout;

const MainHeader = (props) => (
  <Header className="header">
    <Link to='/'>
      <div className="logo">
        <img src={logo}/>
      </div>
    </Link>

    <div className='rightMenu'>
      <Menu theme="dark" mode="horizontal" selectable={false}>
        <Menu.Item key="1"><Link to='/logout'> { props.user.name } </Link></Menu.Item>
        {/*<Menu.Item key="2">nav 2</Menu.Item>*/}
        {/*<Menu.Item key="3">nav 3</Menu.Item>*/}
      </Menu>
    </div>
  </Header>
);

const mapStateToProps = state => {
  return {
    user: state.authentication.user
  }
}

export default connect(mapStateToProps)(MainHeader);