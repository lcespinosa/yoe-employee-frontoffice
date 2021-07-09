import { authHeader } from '../_helpers';
import axios from "../global_axios";

export const userService = {
    login,
    logout,
    getAll
};

function login(username, password) {
    const data = {
        login: username,
        password: password
    };

    return axios.post(`/security/login`, data)
        .then(handleResponse)
        .then(response => {
            const {user, access_token/*, expires_in, refresh_token*/} = response;
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('access_token', access_token);

            return {user, access_token};
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
}

function getAll() {
    /*const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);*/
}

function handleResponse(response) {
    const data = response.data;
    if (response.statusText !== 'OK') {
        if (response.status === 401) {
            // auto logout if 401 response returned from api
            logout();
            window.location.reload();
        }

        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }

    return data;
}