//---redux--------------------------------------
import {applyMiddleware, createStore} from 'redux';
import allReducers from './reducers'; //import all reducers
import thunk from "redux-thunk";
import { composeWithDevTools } from 'redux-devtools-extension'; //for Redox dev

// STORE -> Globalized state - where to store all data
const store = createStore(
    allReducers, 
    //applyMiddleware(thunk)
    composeWithDevTools(applyMiddleware(thunk)) //for redux devtools extension for dev
  ); //store all combined reducers in one
  //--------------------------------------------

  export default store;