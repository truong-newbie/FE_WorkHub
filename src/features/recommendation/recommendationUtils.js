export const WORK_MODES = ['ONSITE', 'REMOTE', 'HYBRID'];
export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'CONTRACT'];
export const CANDIDATE_LEVELS = ['STUDENT', 'INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'];

export const emptyPreference = {
    desiredJobTitle: '',
    preferredLocation: '',
    workMode: 'ONSITE',
    employmentType: 'FULL_TIME',
    candidateLevel: 'FRESHER',
    experienceYears: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    skillIds: [],
};

export function toPreferenceForm(preference) {
    return {
        ...emptyPreference,
        desiredJobTitle: preference?.desiredJobTitle || '',
        preferredLocation: preference?.preferredLocation || '',
        workMode: preference?.workMode || 'ONSITE',
        employmentType: preference?.employmentType || 'FULL_TIME',
        candidateLevel: preference?.candidateLevel || 'FRESHER',
        experienceYears: preference?.experienceYears ?? '',
        expectedSalaryMin: preference?.expectedSalaryMin ?? '',
        expectedSalaryMax: preference?.expectedSalaryMax ?? '',
        skillIds: preference?.skills?.map((skill) => Number(skill.id)) || [],
    };
}

export function validatePreference(form) {
    const errors = {};
    if (!form.desiredJobTitle.trim()) errors.desiredJobTitle = 'Desired job title is required.';
    if (!form.preferredLocation.trim()) errors.preferredLocation = 'Preferred location is required.';
    if (!form.workMode) errors.workMode = 'Choose a work mode.';
    if (!form.employmentType) errors.employmentType = 'Choose an employment type.';
    if (!form.candidateLevel) errors.candidateLevel = 'Choose your current level.';
    if (form.experienceYears !== '' && Number(form.experienceYears) < 0) errors.experienceYears = 'Experience must not be negative.';
    if (form.expectedSalaryMin !== '' && Number(form.expectedSalaryMin) < 0) errors.expectedSalaryMin = 'Minimum salary must not be negative.';
    if (form.expectedSalaryMax !== '' && Number(form.expectedSalaryMax) < 0) errors.expectedSalaryMax = 'Maximum salary must not be negative.';
    if (form.expectedSalaryMin !== '' && form.expectedSalaryMax !== '' && Number(form.expectedSalaryMax) < Number(form.expectedSalaryMin)) {
        errors.expectedSalaryMax = 'Maximum salary must be greater than or equal to minimum salary.';
    }
    if (!form.skillIds.length) errors.skillIds = 'Choose at least one skill.';
    return errors;
}

export function buildPreferencePayload(form) {
    return {
        desiredJobTitle: form.desiredJobTitle.trim(),
        preferredLocation: form.preferredLocation.trim(),
        workMode: form.workMode,
        employmentType: form.employmentType,
        candidateLevel: form.candidateLevel,
        ...(form.experienceYears !== '' ? {experienceYears: Number(form.experienceYears)} : {}),
        ...(form.expectedSalaryMin !== '' ? {expectedSalaryMin: Number(form.expectedSalaryMin)} : {}),
        ...(form.expectedSalaryMax !== '' ? {expectedSalaryMax: Number(form.expectedSalaryMax)} : {}),
        skillIds: form.skillIds,
    };
}

export function getMatchLabel(score) {
    const value = Number(score || 0);
    if (value >= 80) return 'Excellent match';
    if (value >= 60) return 'Good match';
    if (value >= 40) return 'Worth considering';
    return 'Limited match';
}
