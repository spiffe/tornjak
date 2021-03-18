import { GLOBAL_SERVER_SELECTED } from './types';


export function serverSelected(globalServerSelected) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_SELECTED,
            payload: globalServerSelected
        });
    }   
}