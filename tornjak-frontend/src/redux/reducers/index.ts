import serversReducer from './serversReducer';
import clustersReducer from './clustersReducer';
import agentsReducer from './agentsReducer';
import entriesReducer from './entriesReducer';
import tornjakReducer from './tornjakReducer';
import {combineReducers} from 'redux';
import authReducer from './authReducer';

const allReducers = combineReducers({
    servers : serversReducer,
    clusters : clustersReducer,
    agents : agentsReducer,
    entries : entriesReducer,
    tornjak: tornjakReducer,
    auth: authReducer,
});

export type RootState = ReturnType<typeof allReducers>;

export default allReducers;