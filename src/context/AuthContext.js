import {AsyncStorage} from 'react-native'; //나중에 rnas로 바꿔주면 되겄지
import createDataContext from './createDataContext';
import trackerApi from '../api/tracker';
import {navigate} from '../navigationRef';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return {...state, errorMessage: action.payload};
    case 'signin':
      return {errorMessage:'', token:action.payload};//흠. 사인업해도 에러메시지 안사라지니까 ~
    case 'clear_error_message' :
      return{...state, errorMessage:''};
    case 'signout' :
      return {token: null, errorMessage: ''};
    default:
      return state;
  }
};

const tryLocalSignin = dispatch => async () => {
  const token = await AsyncStorage.getItem('token');
  if(token){
    dispatch({type:'signin', payload:token});
    navigate('TrackList');
  } else {
    navigate('Signup');
  }
};

const clearErrorMessage = dispatch => () => {
  dispatch({ type: 'clear_error_message' });
};

const signup = dispatch => async ({email, password }) => {
  try {
    const response = await trackerApi.post('/signup', {email, password});
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({type:'signin', payload: response.data.token});
    navigate('TrackList');
  } catch (err) {
    dispatch({type: 'add_error', payload: 'Something went wrong with sign up' })
  }
};


const signin = dispatch => async ({email, password}) => {
  try {
    const response = await trackerApi.post('/signin',{email,password});
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({type:'signin', payload:response.data.token});
    navigate('TrackList');
  } catch (err) {
    dispatch({type: 'add_error',payload: 'Something went wrong with sign in'});
  }
};

const signout = dispatch => async () => {
  await AsyncStorage.removeItem('token');
  dispatch({type:'signout'});
  navigate('loginFlow');
};

export const {Provider, Context} = createDataContext(
  authReducer,
  {signin, signout, signup, clearErrorMessage, tryLocalSignin},
  { token:null , eroorMessage: '' }//no token no login
);