import axios from 'axios';
import {notification} from "antd";

console.log(process.env.REACT_APP_API_URL);
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

instance.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
instance.defaults.headers.post['Content-Type'] = 'application/json';
/*
//Request/Response interceptor
instance.interceptors.request.use((request) => {
  return request;
});

instance.interceptors.response.use((response) => {
  return response;
}, error => {

  let response = error.response;
  switch (response.status) {
    case 401: notification.error({
      placement: 'topRight',
      message: 'Error de seguridad',
      description: 'Ha ocurrido un error con la sesión del usuario. El usuario no está autenticado, las credenciales son incorrectas o ha expirado la sesion.',
    });
    break;
    default: notification.error({
      placement: 'bottomRight',
      message: 'Error general',
      description: 'Ha ocurrido un error de conexión, inténtelo nuevamente.'
    });
    break;
  }

  return Promise.reject(error);
});*/

export default instance;