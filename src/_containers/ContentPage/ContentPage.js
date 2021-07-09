import {PageHeader} from "antd";
import './ContentPage.css';

const ContentPage = props => (
  <div className="page-header-wrapper">
    <PageHeader
      ghost={false}
      onBack={() => window.history.back()}
      title={props.title}
      subTitle={props.subTitle}
      extra={props.operations}
    >
      {props.descriptions}
    </PageHeader>

    {props.children}

  </div>
);

export default ContentPage;