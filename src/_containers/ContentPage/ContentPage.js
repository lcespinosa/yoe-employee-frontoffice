import {PageHeader} from "antd";
import './ContentPage.css';

const ContentPage = props => (
  <div className="site-page-header-ghost-wrapper">
    <PageHeader
      ghost={false}
      onBack={() => window.history.back()}
      title={props.title}
      subTitle={props.subTitle}
      extra={props.operations}
    >
      {props.descriptions}
    </PageHeader>
  </div>
)