import axios from 'axios';
import {message, notification} from "antd";
import {history, store} from "./_helpers";

console.log(process.env.REACT_APP_API_URL);
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

instance.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
instance.defaults.headers.post['Content-Type'] = 'application/json';

//Request/Response interceptor
instance.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer ' + localStorage.getItem('access_token');
  return config;
});

instance.interceptors.response.use((response) => {
  return response;
}, error => {

  let response = error.response;
  switch (response?.status) {
    case 401: notification.error({
      placement: 'topRight',
      message: 'Error de seguridad',
      description: 'Ha ocurrido un error con la sesión del usuario. El usuario no está autenticado, las credenciales son incorrectas o ha expirado la sesion.',
    });
    history.push('/login');
    break;
    default:
      message.error({ content: 'La operación ha fallado, inténtelo de nuevo.', key: 'message_operation' });
    break;
  }

  return Promise.reject(error);
});

export default instance;