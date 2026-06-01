import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getCurrentCompany} from '../../company/services/companyService.js';
import JobForm from '../components/JobForm.jsx';
import {buildJobPayload, emptyJobForm, toJobForm, validateJobForm} from '../jobUtils.js';
import {createJob, getJobById, updateJob} from '../services/jobService.js';
import styles from '../components/Job.module.css';

export default function JobFormPage() {
    const navigate = useNavigate();
    const {id} = useParams();
    const {showToast} = useToast();
    const [form, setForm] = useState(emptyJobForm);
    const [errors, setErrors] = useState({});
    const [canManage, setCanManage] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setIsLoading(true);
        const request = id ? getJobById(id) : getCurrentCompany();
        request
            .then((data) => {
                if (id) setForm(toJobForm(data));
                setCanManage(true);
            })
            .catch((error) => setErrorMessage(error.message || 'Unable to load job.'))
            .finally(() => setIsLoading(false));
    }, [id]);

    const updateField = (field, value) => {
        setForm((current) => ({...current, [field]: value}));
        setErrors((current) => ({...current, [field]: ''}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationErrors = validateJobForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setErrorMessage('Review the highlighted fields before saving.');
            return;
        }
        setIsSaving(true);
        setErrorMessage('');
        try {
            if (id) await updateJob(id, buildJobPayload(form)); else await createJob(buildJobPayload(form));
            showToast({message: id ? 'Job updated.' : 'Job created.', type: 'success'});
            navigate('/recruiter/jobs');
        } catch (error) {
            setErrorMessage(error.message || 'Unable to save job.');
            showToast({message: error.message || 'Unable to save job.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.pageHeader}><div><p className={styles.eyebrow}>Recruiter workspace</p><h1>{id ? 'Edit job posting' : 'Create job posting'}</h1><p>Keep the information concise, accurate, and useful for candidates.</p></div></header>
        <ErrorMessage message={errorMessage}/>
        {isLoading ? <LoadingState label="Loading job..."/> : canManage ? <JobForm form={form} errors={errors} isSaving={isSaving} submitLabel={id ? 'Save changes' : 'Create job'} onChange={updateField} onSubmit={handleSubmit} onCancel={() => navigate('/recruiter/jobs')}/> : <div className={styles.notice}>Connect your recruiter account to a company before creating job openings.</div>}
    </div></main>;
}
