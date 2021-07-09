import {Layout} from "antd";
import MainHeader from "../../../_layout/MainHeader";
import MainSideBar from "../../../_layout/MainSideBar";
import React from "react";
import {Switch, useRouteMatch} from "react-router";
import {PrivateRoute} from "../../../_components";

import Projects from "../Projects/Projects";
import Test from "../../../_components/Test";
import {Redirect} from "react-router-dom";

const {Content} = Layout;

const Home = (props) => {

  let { path, url } = useRouteMatch();
  console.log(path);


  return (
    <Layout>
      <MainHeader />
      <Layout style={{ minHeight: '100vh' }}>
        <MainSideBar />
        <Layout style={{ padding: '0 24px 24px' }}>
          {/*<MainBreadcrumb />*/}
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >

            <Switch>
              <PrivateRoute path={path + '/projects'} component={Projects} />
              <Redirect to={path + '/projects'} />
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Home;