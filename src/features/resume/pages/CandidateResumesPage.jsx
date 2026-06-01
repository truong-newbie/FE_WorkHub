import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import SkillSelector from '../../skill/components/SkillSelector.jsx';
import {formatDate, getItems, getPaginationMeta, openDownload} from '../../shared/moduleUtils.js';
import {
    deleteResume,
    getMyResumes,
    getResumeDownload,
    replaceResumeFile,
    setDefaultResume,
    updateResume,
    uploadResume,
} from '../services/resumeService.js';
import styles from '../../shared/ModulePage.module.css';

const emptyForm = {title: '', summary: '', isDefault: false, isPublic: false, skillIds: [], file: null};

function validateFile(file) {
    if (!file) return 'Choose a resume file.';
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtension = /\.(pdf|doc|docx)$/i.test(file.name);
    if ((file.type && !validTypes.includes(file.type)) || (!file.type && !validExtension)) {
        return 'Resume must be a PDF, DOC, or DOCX file.';
    }
    if (file.size > 10 * 1024 * 1024) return 'Resume file must not exceed 10 MiB.';
    return '';
}

export default function CandidateResumesPage() {
    const {showToast} = useToast();
    const [resumes, setResumes] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadResumes = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const data = await getMyResumes({page: page - 1, size: 10});
            const items = getItems(data);
            setResumes(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load resumes.');
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadResumes();
    }, [loadResumes]);

    const updateField = (field, value) => setForm((current) => ({...current, [field]: value}));

    const handleUpload = async (event) => {
        event.preventDefault();
        const fileError = validateFile(form.file);
        if (!form.title.trim() || form.title.trim().length > 150 || fileError) {
            setErrorMessage(!form.title.trim() ? 'Resume title is required.' : form.title.trim().length > 150 ? 'Resume title must not exceed 150 characters.' : fileError);
            return;
        }
        if (form.summary.length > 2000) {
            setErrorMessage('Resume summary must not exceed 2000 characters.');
            return;
        }
        setIsSaving(true);
        try {
            await uploadResume({...form, title: form.title.trim(), summary: form.summary.trim()});
            setForm(emptyForm);
            showToast({message: 'Resume uploaded. Parsing has been queued.', type: 'success'});
            await loadResumes();
        } catch (error) {
            showToast({message: error.message || 'Unable to upload resume.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = async (action, resume) => {
        if ((action === 'delete' || action === 'default') && !window.confirm(`${action === 'delete' ? 'Delete' : 'Set as default'} "${resume.title}"?`)) return;
        setIsSaving(true);
        try {
            if (action === 'delete') await deleteResume(resume.id);
            if (action === 'default') await setDefaultResume(resume.id);
            if (action === 'download') openDownload((await getResumeDownload(resume.id)).fileUrl);
            showToast({message: action === 'download' ? 'Resume download opened.' : 'Resume updated.', type: 'success'});
            if (action !== 'download') await loadResumes();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} resume.`, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleMetadataUpdate = async (event) => {
        event.preventDefault();
        if (!editing.title.trim() || editing.title.trim().length > 150 || editing.summary.length > 2000) {
            setErrorMessage('Check the resume title and summary length.');
            return;
        }
        setIsSaving(true);
        try {
            await updateResume(editing.id, {
                title: editing.title.trim(),
                summary: editing.summary.trim(),
                isPublic: editing.isPublic,
                isDefault: editing.isDefault,
                skillIds: editing.skillIds,
            });
            setEditing(null);
            showToast({message: 'Resume metadata updated.', type: 'success'});
            await loadResumes();
        } catch (error) {
            showToast({message: error.message || 'Unable to update resume.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleReplaceFile = async (resume, file) => {
        const fileError = validateFile(file);
        if (fileError) {
            showToast({message: fileError, type: 'error'});
            return;
        }
        setIsSaving(true);
        try {
            await replaceResumeFile(resume.id, file);
            showToast({message: 'Resume file replaced. Parsing has been queued again.', type: 'success'});
            await loadResumes();
        } catch (error) {
            showToast({message: error.message || 'Unable to replace resume file.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}><div><p className={styles.eyebrow}>Candidate profile</p><h1>My Resumes</h1><p>Manage CV files used for your WorkHub applications.</p></div></header>
                <ErrorMessage message={errorMessage}/>
                <div className={styles.grid}>
                    <section className={styles.panel}>
                        <div className={styles.panel_header}><div><h2>Resume library</h2><p>{meta.total} resumes</p></div></div>
                        {isLoading ? <LoadingState label="Loading resumes..."/> : resumes.length === 0 ? <div className={styles.empty}>No resumes uploaded yet.</div> : (
                            <div className={styles.stack}>
                                {resumes.map((resume) => (
                                    <article key={resume.id} className={styles.card}>
                                        <div className={styles.card_header}><div><h3>{resume.title}</h3><p>{resume.fileName} | Uploaded {formatDate(resume.uploadedAt)}</p></div><span className={resume.isDefault ? styles.success_badge : styles.neutral_badge}>{resume.isDefault ? 'Default' : resume.status || 'Uploaded'}</span></div>
                                        <p>{resume.summary || 'No resume summary provided.'}</p>
                                        <div className={styles.actions}>
                                            <span className={resume.isPublic ? styles.success_badge : styles.neutral_badge}>{resume.isPublic ? 'Public' : 'Private'}</span>
                                            <Button variant="secondary" onClick={() => handleAction('download', resume)} disabled={isSaving}>Download</Button>
                                            {!resume.isDefault && <Button variant="secondary" onClick={() => handleAction('default', resume)} disabled={isSaving}>Set default</Button>}
                                            <Button variant="secondary" onClick={() => setEditing({...resume, skillIds: resume.skills?.map((skill) => Number(skill.id)) || []})}>Edit</Button>
                                            <label className={styles.link}>Replace file<input hidden type="file" accept=".pdf,.doc,.docx" onChange={(event) => handleReplaceFile(resume, event.target.files?.[0])}/></label>
                                            <Button variant="danger" onClick={() => handleAction('delete', resume)} disabled={isSaving}>Delete</Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
                    </section>
                    <section className={styles.panel}>
                        <div className={styles.panel_header}><div><h2>Upload resume</h2><p>PDF, DOC, or DOCX up to 10 MiB.</p></div></div>
                        <form className={styles.stack} onSubmit={handleUpload}>
                            <Input label="Resume title" name="resume-title" value={form.title} onChange={(event) => updateField('title', event.target.value)} required/>
                            <label className={styles.textarea_field} htmlFor="resume-summary"><span>Summary</span><textarea id="resume-summary" rows="4" value={form.summary} onChange={(event) => updateField('summary', event.target.value)}/></label>
                            <SkillSelector value={form.skillIds} onChange={(skillIds) => updateField('skillIds', skillIds)}/>
                            <label className={styles.checkbox}><input type="checkbox" checked={form.isDefault} onChange={(event) => updateField('isDefault', event.target.checked)}/>Set as default resume</label>
                            <label className={styles.checkbox}><input type="checkbox" checked={form.isPublic} onChange={(event) => updateField('isPublic', event.target.checked)}/>Allow public resume access</label>
                            <input className={styles.file_input} type="file" accept=".pdf,.doc,.docx" onChange={(event) => updateField('file', event.target.files?.[0] || null)} required/>
                            <Button type="submit" disabled={isSaving}>{isSaving ? 'Uploading...' : 'Upload resume'}</Button>
                        </form>
                    </section>
                </div>
                {editing && (
                    <section className={styles.panel}>
                        <div className={styles.panel_header}><div><h2>Edit resume metadata</h2><p>{editing.fileName}</p></div><Button variant="secondary" onClick={() => setEditing(null)}>Close</Button></div>
                        <form className={styles.form_grid} onSubmit={handleMetadataUpdate}>
                            <Input label="Resume title" name="edit-resume-title" value={editing.title} onChange={(event) => setEditing((current) => ({...current, title: event.target.value}))}/>
                            <label className={styles.checkbox}><input type="checkbox" checked={Boolean(editing.isPublic)} onChange={(event) => setEditing((current) => ({...current, isPublic: event.target.checked}))}/>Public resume</label>
                            <label className={`${styles.textarea_field} ${styles.full_row}`} htmlFor="edit-resume-summary"><span>Summary</span><textarea id="edit-resume-summary" rows="4" value={editing.summary || ''} onChange={(event) => setEditing((current) => ({...current, summary: event.target.value}))}/></label>
                            <div className={styles.full_row}><SkillSelector value={editing.skillIds} onChange={(skillIds) => setEditing((current) => ({...current, skillIds}))}/></div>
                            <Button type="submit" disabled={isSaving}>Save resume</Button>
                        </form>
                    </section>
                )}
            </div>
        </main>
    );
}
