import store from './store';

export const getCurrentToken = () : string => {
  const { user } = store?.getState();

  
  if (user?.token) { 
    return `Bearer ${user.access_token}`
  };

  const token = document.cookie.split('; ')
      .find(cookie => cookie.includes('PRIVATE-TOKEN'))?.split('=')[1];
  
  return `Bearer ${token}`;
}

export const getAuth = (): boolean => {
  const { user } = store?.getState();

  return !!user?.auth;
}
