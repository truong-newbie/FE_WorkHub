import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Select from '../../../components/ui/Select.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import SkillSelector from '../../skill/components/SkillSelector.jsx';
import {buildPreferencePayload, CANDIDATE_LEVELS, EMPLOYMENT_TYPES, emptyPreference, toPreferenceForm, validatePreference, WORK_MODES} from '../recommendationUtils.js';
import {createCandidateJobPreference, getCandidateJobPreference, getCandidateOnboardingStatus, updateCandidateJobPreference} from '../services/recommendationService.js';
import styles from '../../job/components/Job.module.css';

export default function JobPreferencePage() {
    const navigate = useNavigate();
    const {showToast} = useToast();
    const [form, setForm] = useState(emptyPreference);
    const [hasPreference, setHasPreference] = useState(false);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const status = await getCandidateOnboardingStatus();
                if (status.hasJobPreference) {
                    const preference = await getCandidateJobPreference();
                    setForm(toPreferenceForm(preference));
                    setHasPreference(true);
                }
            } catch (error) {
                setErrorMessage(error.message || 'Unable to load job preference.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const updateField = (field, value) => {
        setForm((current) => ({...current, [field]: value}));
        setErrors((current) => ({...current, [field]: ''}));
    };

    const submit = async (event) => {
        event.preventDefault();
        const validationErrors = validatePreference(form);
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setIsSaving(true);
        setErrorMessage('');
        try {
            const payload = buildPreferencePayload(form);
            const preference = hasPreference
                ? await updateCandidateJobPreference(payload)
                : await createCandidateJobPreference(payload);
            setForm(toPreferenceForm(preference));
            setHasPreference(true);
            showToast({message: 'Job preference saved.', type: 'success'});
            navigate('/candidate/jobs/recommended');
        } catch (error) {
            setErrorMessage(error.message || 'Unable to save job preference.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <main className={styles.page}><LoadingState label="Loading job preference..."/></main>;

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Personalized job recommendations</p><h1>{hasPreference ? 'Update your job preference' : 'Set up your job preference'}</h1><p>Tell WorkHub what you are looking for so recommendations can prioritize relevant roles.</p></div><Link className={styles.detailLink} to="/candidate/jobs/recommended">Back to recommendations</Link></header>
        <ErrorMessage message={errorMessage}/>
        <form className={styles.jobForm} onSubmit={submit}>
            <section className={styles.formSection}><div className={styles.formSectionHeader}><h2>Target role</h2><p>Choose the role and seniority that best match your next move.</p></div><div className={styles.formGrid}>
                <Input label="Desired job title *" name="preference-title" value={form.desiredJobTitle} error={errors.desiredJobTitle} onChange={(event) => updateField('desiredJobTitle', event.target.value)} placeholder="Java Backend Developer"/>
                <Select label="Candidate level *" name="preference-level" value={form.candidateLevel} error={errors.candidateLevel} onChange={(event) => updateField('candidateLevel', event.target.value)}>{CANDIDATE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</Select>
                <Input label="Experience years" name="preference-experience" type="number" min="0" value={form.experienceYears} error={errors.experienceYears} onChange={(event) => updateField('experienceYears', event.target.value)}/>
            </div></section>
            <section className={styles.formSection}><div className={styles.formSectionHeader}><h2>Skills</h2><p>Select at least one skill used to match suitable jobs.</p></div><SkillSelector label="Preferred skills *" value={form.skillIds} onChange={(value) => updateField('skillIds', value)}/>{errors.skillIds && <p className={styles.fieldError}>{errors.skillIds}</p>}</section>
            <section className={styles.formSection}><div className={styles.formSectionHeader}><h2>Location and work style</h2><p>Recommendations use these fields to prioritize suitable working arrangements.</p></div><div className={styles.formGrid}>
                <Input label="Preferred location *" name="preference-location" value={form.preferredLocation} error={errors.preferredLocation} onChange={(event) => updateField('preferredLocation', event.target.value)} placeholder="Ha Noi"/>
                <Select label="Work mode *" name="preference-work-mode" value={form.workMode} error={errors.workMode} onChange={(event) => updateField('workMode', event.target.value)}>{WORK_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</Select>
                <Select label="Employment type *" name="preference-employment" value={form.employmentType} error={errors.employmentType} onChange={(event) => updateField('employmentType', event.target.value)}>{EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</Select>
            </div></section>
            <section className={styles.formSection}><div className={styles.formSectionHeader}><h2>Expected salary</h2><p>Optional salary range in USD.</p></div><div className={styles.formGrid}>
                <Input label="Minimum salary" name="preference-salary-min" type="number" min="0" value={form.expectedSalaryMin} error={errors.expectedSalaryMin} onChange={(event) => updateField('expectedSalaryMin', event.target.value)}/>
                <Input label="Maximum salary" name="preference-salary-max" type="number" min="0" value={form.expectedSalaryMax} error={errors.expectedSalaryMax} onChange={(event) => updateField('expectedSalaryMax', event.target.value)}/>
            </div></section>
            <div className={styles.formActions}><Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : hasPreference ? 'Update preference' : 'Save preference'}</Button></div>
        </form>
    </div></main>;
}
