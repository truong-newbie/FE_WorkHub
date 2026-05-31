export const JOB_LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'];
export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];

export const emptyJobForm = {
    title: '',
    description: '',
    requirement: '',
    benefit: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    negotiableSalary: false,
    level: '',
    employmentType: 'FULL_TIME',
    experienceYears: '0',
    quantity: '1',
    expiredAt: '',
    startDate: '',
    skillIds: [],
    published: false,
};

export function getJobId(job) {
    return job?.id ?? job?.jobId;
}

export function getJobSkills(job) {
    return job?.skillNames || job?.skills?.map((skill) => skill.name) || [];
}

export function getCompanyName(job) {
    return job?.companyName || job?.company?.name || 'Company information pending';
}

export function getCompanyLogo(job) {
    return job?.companyLogo || job?.company?.logo || '';
}

export function formatJobSalary(job) {
    if (job?.negotiableSalary || (!job?.salaryMin && !job?.salaryMax)) {
        return 'Negotiable salary';
    }

    const salary = [job.salaryMin, job.salaryMax].filter((value) => value !== null && value !== undefined && value !== '').join(' - ');
    return salary ? `${salary} USD` : 'Negotiable salary';
}

export function getJobStatus(job) {
    if (job?.deleted) return 'DELETED';
    if (job?.expired) return 'EXPIRED';
    return job?.published ? 'PUBLISHED' : 'DRAFT';
}

export function toJobForm(job) {
    return {
        ...emptyJobForm,
        title: job?.title || '',
        description: job?.description || '',
        requirement: job?.requirement || '',
        benefit: job?.benefit || '',
        location: job?.location || '',
        salaryMin: job?.salaryMin ?? '',
        salaryMax: job?.salaryMax ?? '',
        negotiableSalary: Boolean(job?.negotiableSalary),
        level: job?.level || '',
        employmentType: job?.employmentType || 'FULL_TIME',
        experienceYears: String(job?.experienceYears ?? 0),
        quantity: String(job?.quantity ?? 1),
        expiredAt: job?.expiredAt?.slice(0, 10) || '',
        startDate: job?.startDate?.slice(0, 10) || '',
        skillIds: job?.skills?.map((skill) => Number(skill.id)) || [],
        published: Boolean(job?.published),
    };
}

export function validateJobForm(form) {
    const errors = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!form.title.trim()) errors.title = 'Job title is required.';
    else if (form.title.trim().length > 255) errors.title = 'Job title must not exceed 255 characters.';
    if (!form.description.trim()) errors.description = 'Job description is required.';
    if (!form.location.trim()) errors.location = 'Location is required.';
    if (!form.level) errors.level = 'Choose a job level.';
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) errors.salaryMax = 'Maximum salary must be greater than or equal to minimum salary.';
    if (Number(form.experienceYears) < 0) errors.experienceYears = 'Experience must not be negative.';
    if (Number(form.quantity) < 1) errors.quantity = 'Quantity must be at least 1.';
    if (form.expiredAt && form.expiredAt <= today) errors.expiredAt = 'Deadline must be in the future.';

    return errors;
}

export function buildJobPayload(form) {
    return {
        title: form.title.trim(),
        description: form.description.trim(),
        requirement: form.requirement.trim() || null,
        benefit: form.benefit.trim() || null,
        location: form.location.trim(),
        salaryMin: form.salaryMin || null,
        salaryMax: form.salaryMax || null,
        negotiableSalary: Boolean(form.negotiableSalary),
        level: form.level,
        employmentType: form.employmentType || null,
        experienceYears: Number(form.experienceYears || 0),
        quantity: Number(form.quantity || 1),
        expiredAt: form.expiredAt || null,
        startDate: form.startDate || null,
        skillIds: form.skillIds,
        published: Boolean(form.published),
    };
}
