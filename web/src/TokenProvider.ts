import store from './store';

export const getCurrentToken = () : string => {
  const { user } = store?.getState();

  if(!store){
    
  }

  return user && `Bearer ${user.access_token}`;
}

export const getAuth = (): boolean => {
  const { user } = store?.getState();

  if(!store){

  }

  return !!user?.auth;
}
