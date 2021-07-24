import {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import {Form, Modal, message, Descriptions} from "antd";
import axios from '../../global_axios';

export const CrudForm = forwardRef(( props, ref ) => {

  const [form] = Form.useForm();
  const [visible, setVisible] = useState({editMode: false, visible: false, loading: false, record: {}, errors: []});

  useImperativeHandle(ref, () => ({

    open(callback) {
      setVisible({...visible, visible: true, loading: false, editMode: false});
      form.resetFields();
      if (callback) {
        callback();
      }
    },

    edit(record, ...loadFns) {
      form.resetFields()
      setVisible({...visible, visible: true, loading: false, editMode: true, record: record});
      loadExtraFunctions(record, loadFns);
    },

    getForm() {
      return form;
    }

  }));

  const loadExtraFunctions = useCallback((record, loadFns) => {
    setTimeout(() => {
      form.setFieldsValue(record);
      loadFns.map(fn => fn(record));
    }, 100);
  }, []);

  const onFinish = (values) => {
    setVisible({...visible, loading: true});
    message.loading({ content: 'Realizando operación...', key: 'message_operation' });

    const extraValues = {
      ...values,
      ...props.afterSubmit(values)
    }
    const { url, method } = props.action(visible.editMode, visible.record, extraValues);

    axios[method](url, extraValues)
      .then(({data}) => {
        setVisible({...visible, visible: false});
        message.success({ content: 'Operación realizada con éxito.', key: 'message_operation' });

        if (props.onOk) {
          props.onOk(visible.editMode, data.data);
        }
      })
      .catch(error => {
        const errors = error.response.data;
        let data = [];
        for (error in errors) {
          if (errors.hasOwnProperty(error)) {
            data.push(errors[error]);
          }
        }
        setVisible({...visible, loading: false, errors: data});
      });
  }

  const onOk = () => {
    form.submit();
  }

  const onCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    }
    setVisible({...visible, visible: false});
  }

  return (

      <Modal width={props.width}
        title={visible.editMode ? props.editTitle : props.title}
        centered
        visible={visible.visible}
        onCancel={onCancel}
        onOk={onOk}
        okButtonProps={{htmlType: 'submit', loading: visible.loading}}
      >
        <Form
          layout='vertical'
          form={form}
          onFinish={onFinish}
        >
          {props.children}

          {visible.errors.length > 0 ? (
            <Descriptions title="Mensajes de error">
              {visible.errors.map((error, index) => {
                return (<Descriptions.Item key={index}>{error}</Descriptions.Item>);
              })}
            </Descriptions>
          ) : '' }
        </Form>
      </Modal>
  )

})