import store from '../redux/store';
import { loginUser, logoutUser, getCurrentUser } from '../redux/slices/userSlice';

export const auth = {
  isAuthenticated: () => {
    const state = store.getState();
    return state.user.isAuthenticated;
  },
  
  login: async (email, password, callback) => {
    try {
      await store.dispatch(loginUser({ email, password })).unwrap();
      if (callback) callback();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  
  logout: (callback) => {
    store.dispatch(logoutUser());
    if (callback) callback();
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  getUserId: () => {
    const state = store.getState();
    return state.user.user?._id;
  },
  
  getUsername: () => {
    const state = store.getState();
    return state.user.user?.username || state.user.user?.name || 'User';
  },
  
  refreshUserData: async () => {
    try {
      await store.dispatch(getCurrentUser()).unwrap();
      return true;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  }
};