export const emptyCompanyForm = {
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    companySize: '',
    industry: '',
    taxCode: '',
};

export function validateCompany(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = 'Company name is required.';
    } else if (form.name.trim().length > 255) {
        errors.name = 'Company name must not exceed 255 characters.';
    }

    if (form.website && !/^https?:\/\/\S+$/i.test(form.website)) {
        errors.website = 'Website must start with http:// or https://.';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Enter a valid company email.';
    }

    if (form.phone && !/^[\d\s+()-]{8,20}$/.test(form.phone)) {
        errors.phone = 'Phone must contain 8 to 20 valid characters.';
    }

    return errors;
}

export function toCompanyForm(company = {}) {
    return Object.fromEntries(Object.keys(emptyCompanyForm).map((key) => [key, company[key] || '']));
}

export function buildCompanyPayload(form) {
    return Object.fromEntries(
        Object.entries(form)
            .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            .filter(([, value]) => value !== ''),
    );
}
