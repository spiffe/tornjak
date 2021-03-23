import selectReducer from './selectReducer';
import {combineReducers} from 'redux';

const allReducers = combineReducers({
    serverInfo : selectReducer
});

export default allReducers;