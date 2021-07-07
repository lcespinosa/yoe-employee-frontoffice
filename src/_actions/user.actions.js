import { userConstants } from '../_constants';
import { userService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';

export const userActions = {
    login,
    logout,
    getAll
};

function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => { 
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    let response = error.response;
                    let args = [];
                    switch (response.status) {
                        case 401: args = [
                          'Error de seguridad',
                          'Ha ocurrido un error con la sesión del usuario. El usuario no está autenticado, las credenciales son incorrectas o ha expirado la sesion.'
                        ];
                        break;
                        default: args = [
                            'Error general',
                            'Ha ocurrido un error de conexión, inténtelo nuevamente.'
                        ];
                        break;
                    }
                    dispatch(failure(error));
                    dispatch(alertActions.error(...args));
                }
            );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

function getAll() {
    return dispatch => {
        dispatch(request());

        userService.getAll()
            .then(
                users => dispatch(success(users)),
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: userConstants.GETALL_REQUEST } }
    function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
    function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}