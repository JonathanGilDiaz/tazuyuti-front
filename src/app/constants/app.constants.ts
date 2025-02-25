export const APP = {
  NAME: 'APP',
  WELCOME: 'BIENVENIDO',
};
// URLs de APIs agrupadas en un objeto
export const API_URLS = {
  ///MAIN: 'https://qb-aprendizajelenguas.oaxaca.gob.mx/api',
  //MAIN: 'https://db-siacv2.oaxaca.gob.mx/api',
  URL_SISTEMA : 'http://127.0.0.1:8080/api',
  MAIN: 'http://127.0.0.1:8080/api',
  // LOCAL: 'http://172.16.37.132:8084/api',
  // LENGUAS: 'https://qb-aprendizajelenguas.oaxaca.gob.mx/api',
};

// Mensajes comunes de la aplicación agrupados
export const MESSAGES = {
  ERROR: {
    NETWORK: 'Error de red. Por favor, intenta de nuevo más tarde.',
    NOT_FOUND: 'Recurso no encontrado.',
  },
  SUCCESS: {
    SAVE: 'Datos guardados exitosamente.',
    DELETE: 'Datos eliminados correctamente.',
  },
};

// Valores por defecto de la aplicación
export const DEFAULT_VALUES = {
  PAGE_SIZE: 10,
  ROWS_PER_PAGE_OPTIONS : [10, 20, 50],
  LANGUAGE: 'es',
  EXPIRATION_SESSION_TIME_IN_MINUTES: 480, //8(480) HORAS
};

export const DEFAULT_VALUES_fILES = {
  MAX_FILE_SIZE : 5000000,
  INVALID_FILE_SIZE_MESSAGE_SUMMARY : 'Tamaño de archivo no válido',
  INVALID_FILE_SIZE_MESSAGE_DETAIL : 'El tamaño máximo permitido es de 5MB',
  INVALID_FILE_TYPE_MESSAGE_SUMMARY : 'Tipo de archivo no válido',
  INVALID_FILE_TYPE_MESSAGE_DETAIL : 'Tipo de archivos permitidos: ',
  INVALID_FILE_LIMIT_MESSAGE_SUMMARY : 'Se ha excedido el número máximo de archivos.',
  INVALID_FILE_LIMIT_MESSAGE_DETAIL : 'El límite es de {0} como máximo.',
}

// Configuraciones de autenticación o API keys
export const AUTH_CONFIG = {
  RECAPTCHA_SITE_KEY: '6LcYneEqAAAAAN4iAQ8jG2Lpk8mGZvEzM13ZpSu2',
};

export const MODULES_URLS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  PUBLIC: {
    DEFAULT: '/dashboard',
  },
  USER: {
    INDEX: '',
    ADD: '/add',
    EDIT: '/edit/:id',
  },
};

export const ROLES_ID = {
  ADMINISTRADOR: 1,
  COMBUSTIBLE: 2,
  INVENTARIO: 3,
}
