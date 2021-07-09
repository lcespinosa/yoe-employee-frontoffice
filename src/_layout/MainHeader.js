import {Layout, Menu, Space} from 'antd';
import React from "react";
import logo from '../_assets/Logo 1.png';
import {Link} from "react-router-dom";
import { connect } from "react-redux";
import {userActions} from "../_actions";

const { Header } = Layout;

const MainHeader = (props) => {

  const onLogout = () => {
    props.logOut();
  }

  return (
    <Header className="header">
      <Link to='/'>
        <div className="logo">
          <img src={logo}/>
        </div>
      </Link>

      <div className='rightMenu'>
        <Menu theme="dark" mode="horizontal" selectable={false}>
          <Menu.Item key="1" onClick={onLogout}>{ props.user.name }</Menu.Item>
          {/*<Menu.Item key="2">nav 2</Menu.Item>*/}
          {/*<Menu.Item key="3">nav 3</Menu.Item>*/}
        </Menu>
      </div>
    </Header>
  );
}

const mapStateToProps = state => {
  return {
    user: state.authentication.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logOut: () => {
      dispatch(userActions.logout());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);