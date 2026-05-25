const FORGOT_PASSWORD_EMAIL_KEY = 'forgotPasswordEmail';

export function saveForgotPasswordEmail(email) {
    sessionStorage.setItem(FORGOT_PASSWORD_EMAIL_KEY, email);
}

export function getForgotPasswordEmail() {
    return sessionStorage.getItem(FORGOT_PASSWORD_EMAIL_KEY) || '';
}

export function clearForgotPasswordEmail() {
    sessionStorage.removeItem(FORGOT_PASSWORD_EMAIL_KEY);
}

