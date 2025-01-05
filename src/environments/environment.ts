import { API_URLS, AUTH_CONFIG } from '@app/constants/app.constants';

export const environment = {
    production: false,
    recaptcha: {
        siteKey: AUTH_CONFIG.RECAPTCHA_SITE_KEY,
    },
    baseUrl : API_URLS.MAIN
};
