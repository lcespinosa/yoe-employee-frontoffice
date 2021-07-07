import React, { Component, useState, useEffect } from 'react';
import {Form, Input, Checkbox, Button, Typography} from "antd";
import {UserOutlined, LockOutlined} from "@ant-design/icons";
import './Login.css';
import {userActions} from "../../../_actions";
import { connect } from "react-redux";
import axios from '../../../global_axios'
import {authentication} from "../../../_reducers/authentication.reducer";

const {Title} = Typography;

const Login = (props) => {

  const [form] = Form.useForm();
  const [state, forceUpdate] = useState({
    signupMode: false,
  });

  // To disable submit button at the beginning.
  useEffect(() => {
    forceUpdate({...state});
    props.logOut();
  }, []);

  const onFinish = (values) => {
    props.onAuth(values);
  }

  const switchAuthModeHandler = (e) => {
    e.preventDefault();
    forceUpdate(prevState => {
      return {signupMode: !prevState.signupMode};
    });
  }

  return (
      <Form
        form={form}
        name="user_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Title level={3}>Inicio de sesión</Title>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Por favor introduzca su usuario!' }]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Usuario" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor introduzca su contraseña!' }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Contraseña"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Recordarme</Checkbox>
          </Form.Item>

          {/*<a className="login-form-forgot" href="">
            Forgot password
          </a>*/}
        </Form.Item>

        <Form.Item shouldUpdate>
          {() => (
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={props.loggingIn}
              disabled={
                !form.isFieldsTouched(['username', 'password'], true) ||
                !!form.getFieldsError().filter(({ errors }) => errors.length).length
              }
            >
              Entrar
            </Button>
          )}
        </Form.Item>

        {/*<Form.Item>*/}
        {/*{state.signupMode ? (*/}
        {/*  <React.Fragment>Volver al <a href="" onClick={switchAuthModeHandler}>Inicio de sesión!</a></React.Fragment>*/}
        {/*) : (*/}
        {/*  <React.Fragment>O si no tiene cuenta: <a href="" onClick={switchAuthModeHandler}>regístrese ahora!</a></React.Fragment>*/}
        {/*)}*/}
        {/*</Form.Item>*/}

      </Form>
  );
}

const mapStateToProps = state => {
  return {
    loggingIn: state.authentication.loggingIn,
    loggedIn: state.authentication.loggedIn,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onAuth: (signupData = {}, signupMode = false) => {
      dispatch(userActions.login(signupData.username, signupData.password));
    },
    logOut: () => {
      dispatch(userActions.logout());
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);