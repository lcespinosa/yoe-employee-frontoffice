import {Layout} from "antd";
import MainHeader from "../../../_layout/MainHeader";
import MainSideBar from "../../../_layout/MainSideBar";
import React from "react";

const {Content} = Layout;

const Home = (props) => {
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
            Content
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Home;