export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidOtp(otp) {
    return /^\d{6}$/.test(otp);
}

export function validatePasswordReset({newPassword, confirmPassword}) {
    if (!newPassword) {
        return 'New password is required';
    }

    if (newPassword.length < 6) {
        return 'New password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
        return 'Passwords do not match';
    }

    return '';
}

