import serversReducer from './serversReducer';
import agentsReducer from './agentsReducer';
import entriesReducer from './entriesReducer';
import tornjakReducer from './tornjakReducer';
import {combineReducers} from 'redux';

const allReducers = combineReducers({
    servers : serversReducer,
    agents : agentsReducer,
    entries : entriesReducer,
    tornjak: tornjakReducer,
});

export default allReducers;