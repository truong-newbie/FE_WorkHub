import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Table from '../../../components/ui/Table.jsx';
import {cleanParams, formatDate, getItems, getPaginationMeta, openDownload} from '../../shared/moduleUtils.js';
import {getAdminResumes, getResumeDownload} from '../services/resumeService.js';
import styles from '../../shared/ModulePage.module.css';

export default function AdminResumeManagementPage() {
    const [title, setTitle] = useState('');
    const [appliedTitle, setAppliedTitle] = useState('');
    const [resumes, setResumes] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadResumes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAdminResumes(cleanParams({title: appliedTitle, page: page - 1, size: 10}));
            const items = getItems(data);
            setResumes(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load resumes.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedTitle, page]);

    useEffect(() => { loadResumes(); }, [loadResumes]);

    const columns = [
        {key: 'title', header: 'Resume', render: (resume) => <div><strong>{resume.title}</strong><p className={styles.muted}>{resume.fileName}</p></div>},
        {key: 'candidate', header: 'Candidate', render: (resume) => resume.candidate?.email || 'N/A'},
        {key: 'score', header: 'ATS score', render: (resume) => resume.atsScore ?? 'Pending'},
        {key: 'uploaded', header: 'Uploaded', render: (resume) => formatDate(resume.uploadedAt)},
        {key: 'actions', header: 'Actions', render: (resume) => <Button variant="secondary" onClick={async () => openDownload((await getResumeDownload(resume.id)).fileUrl)}>Download</Button>},
    ];

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.header}><div><p className={styles.eyebrow}>Resume administration</p><h1>Resume Management</h1><p>Inspect uploaded candidate resumes and ATS processing state.</p></div></header>
        <section className={styles.panel}><form className={styles.filters} onSubmit={(event) => {event.preventDefault(); setPage(1); setAppliedTitle(title.trim());}}><Input className={styles.grow} label="Resume title" name="resume-search" value={title} onChange={(event) => setTitle(event.target.value)}/><Button type="submit">Search</Button></form></section>
        <section className={styles.panel}><ErrorMessage message={errorMessage}/>{isLoading ? <LoadingState label="Loading resumes..."/> : <><Table columns={columns} rows={resumes} getRowKey={(resume) => resume.id} emptyMessage="No resumes found."/><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/></>}</section>
    </div></main>;
}
