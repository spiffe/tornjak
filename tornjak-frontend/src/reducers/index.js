import selectReducer from './selectReducer';
import {combineReducers} from 'redux';

const allReducers = combineReducers({
    filteredData : selectReducer
});

export default allReducers;