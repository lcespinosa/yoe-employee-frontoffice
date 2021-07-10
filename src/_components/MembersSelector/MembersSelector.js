import {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import axios from '../../global_axios';
import {Transfer} from "antd";

export const MembersSelector = forwardRef((props, ref) => {

  const [state, setState] = useState({
    mockData: [],
    targetKeys: [],
    disabled: true,
  });

  useImperativeHandle(ref, () => ({

    getTargetKeys() {
      return !state.disabled ? state.targetKeys : [];
    },

    setTargetKeys(data, disabled = false) {
      let targetKeys = [];
      data.map(item => targetKeys.push(item.id) );
      getMock(targetKeys, disabled);
    },

    setDisabled(flag = true) {
      setState({...state, disabled: flag});
    }

  }));

  const getMock = (targetKeys = [], disabled = false) => {
    const mockData = [];

    axios.get(props.ajax)
      .then(({data}) => {
        data.data.map(item =>
          mockData.push({
            key: item.id,
            ...item
          })
        );
        setState({...state, mockData, targetKeys, disabled});
      });
  }

  const filterOption = (inputValue, option) => option[props.displayName].indexOf(inputValue) > -1;

  const handleChange = targetKeys  => {
    setState({...state, targetKeys });
    onChangeTargetKeys(targetKeys);
  }
  const onChangeTargetKeys = useCallback((targetKeys) => {
    setTimeout(() => {
      if (props.onChangeTargetKeys) {
        props.onChangeTargetKeys(targetKeys);
      }
    }, 100);
  }, [])

  const handleSearch = (dir, value) => {
  };

  return (
      <Transfer
        dataSource={state.mockData}
        showSearch
        filterOption={filterOption}
        targetKeys={state.targetKeys}
        onChange={handleChange}
        onSearch={handleSearch}
        render={item => item[props.displayName]}
        disabled={state.disabled}
      />
    )

});