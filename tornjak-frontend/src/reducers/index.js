import serverReducer from './serverReducer';
import agentsReducer from './agentsReducer';
import entriesReducer from './entriesReducer';
import {combineReducers} from 'redux';

const allReducers = combineReducers({
    server : serverReducer,
    agents : agentsReducer,
    entries : entriesReducer,
});

export default allReducers;