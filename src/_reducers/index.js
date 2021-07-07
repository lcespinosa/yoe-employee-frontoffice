import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { users } from './users.reducer';
import { alert } from './alert.reducer';

function lastAction(state = null, action) {
  return action;
}

const rootReducer = combineReducers({
  authentication,
  users,
  alert,
  lastAction: lastAction,
});

export default rootReducer;