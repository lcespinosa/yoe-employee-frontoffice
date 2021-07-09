import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import axios from '../../global_axios';
import {Transfer} from "antd";

export const MembersSelector = forwardRef((props, ref) => {

  const [state, setState] = useState({
    mockData: [],
    targetKeys: [],
  });

  useImperativeHandle(ref, () => ({

    getTargetKeys() {
      return state.targetKeys;
    },

    setTargetKeys(data) {
      let targetKeys = [];
      data.map(item => targetKeys.push(item.id) );
      getMock(targetKeys);
    }

  }));

  const getMock = (targetKeys = []) => {
    const mockData = [];
    console.log(targetKeys);

    axios.get(props.ajax)
      .then(({data}) => {
        data.data.map(item =>
          mockData.push({
            key: item.id,
            ...item
          })
        );
        setState({mockData, targetKeys});
      });
  }

  const filterOption = (inputValue, option) => option[props.displayName].indexOf(inputValue) > -1;

  const handleChange = targetKeys  => {
    setState({...state, targetKeys });
  }

  const handleSearch = (dir, value) => {
    console.log('search:', dir, value);
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
    />

  );

});