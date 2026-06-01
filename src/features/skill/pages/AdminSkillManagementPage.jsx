import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import Table from '../../../components/ui/Table.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {cleanParams, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import {createSkill, deleteSkill, disableSkill, enableSkill, searchSkills, updateSkill} from '../services/skillService.js';
import styles from '../../shared/ModulePage.module.css';

const emptyForm = {id: '', name: '', level: '', description: '', active: true};

export default function AdminSkillManagementPage() {
    const {showToast} = useToast();
    const [keyword, setKeyword] = useState('');
    const [appliedKeyword, setAppliedKeyword] = useState('');
    const [active, setActive] = useState('');
    const [skills, setSkills] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadSkills = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await searchSkills(cleanParams({keyword: appliedKeyword, active, pageNum: page, pageSize: 10, sortBy: 'name', isAscending: true}));
            const items = getItems(data);
            setSkills(items);
            setMeta(getPaginationMeta(data, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load skills.');
        } finally {
            setIsLoading(false);
        }
    }, [active, appliedKeyword, page]);

    useEffect(() => { loadSkills(); }, [loadSkills]);

    const updateField = (field, value) => setForm((current) => ({...current, [field]: value}));

    const handleSave = async (event) => {
        event.preventDefault();
        if (!form.name.trim() || form.name.trim().length > 255) {
            setErrorMessage('Skill name is required and must not exceed 255 characters.');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {name: form.name.trim(), level: form.level.trim() || null, description: form.description.trim() || null, active: form.active};
            if (form.id) await updateSkill(form.id, payload); else await createSkill(payload);
            setForm(emptyForm);
            showToast({message: form.id ? 'Skill updated.' : 'Skill created.', type: 'success'});
            await loadSkills();
        } catch (error) {
            showToast({message: error.message || 'Unable to save skill.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = async (skill, action) => {
        if ((action === 'delete' || action === 'disable') && !window.confirm(`${action} skill "${skill.name}"?`)) return;
        try {
            if (action === 'delete') await deleteSkill(skill.id);
            if (action === 'disable') await disableSkill(skill.id);
            if (action === 'enable') await enableSkill(skill.id);
            showToast({message: `Skill ${action} action completed.`, type: 'success'});
            await loadSkills();
        } catch (error) {
            showToast({message: error.message || `Unable to ${action} skill.`, type: 'error'});
        }
    };

    const columns = [
        {key: 'name', header: 'Skill', render: (skill) => <div><strong>{skill.name}</strong><p className={styles.muted}>{skill.level || 'General'}</p></div>},
        {key: 'description', header: 'Description', render: (skill) => skill.description || 'N/A'},
        {key: 'status', header: 'Status', render: (skill) => <span className={skill.active ? styles.success_badge : styles.danger_badge}>{skill.active ? 'Active' : 'Disabled'}</span>},
        {key: 'actions', header: 'Actions', render: (skill) => <div className={styles.actions}><Button variant="secondary" onClick={() => setForm({...skill, description: skill.description || '', level: skill.level || ''})}>Edit</Button><Button variant="secondary" onClick={() => handleAction(skill, skill.active ? 'disable' : 'enable')}>{skill.active ? 'Disable' : 'Enable'}</Button><Button variant="danger" onClick={() => handleAction(skill, 'delete')}>Delete</Button></div>},
    ];

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.header}><div><p className={styles.eyebrow}>Skill administration</p><h1>Skill Management</h1><p>Maintain the skill taxonomy used by jobs, resumes, and subscriptions.</p></div></header>
        <div className={styles.grid}>
            <section className={styles.panel}>
                <form className={styles.filters} onSubmit={(event) => {event.preventDefault(); setPage(1); setAppliedKeyword(keyword.trim());}}><Input className={styles.grow} label="Keyword" name="skill-search" value={keyword} onChange={(event) => setKeyword(event.target.value)}/><Select label="Status" name="skill-active" value={active} onChange={(event) => {setPage(1); setActive(event.target.value);}}><option value="">All</option><option value="true">Active</option><option value="false">Disabled</option></Select><Button type="submit">Search</Button></form>
                <ErrorMessage message={errorMessage}/>
                {isLoading ? <LoadingState label="Loading skills..."/> : <><Table columns={columns} rows={skills} getRowKey={(skill) => skill.id} emptyMessage="No skills found."/><Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/></>}
            </section>
            <section className={styles.panel}><div className={styles.panel_header}><div><h2>{form.id ? 'Edit skill' : 'Create skill'}</h2></div></div><form className={styles.stack} onSubmit={handleSave}><Input label="Name" name="admin-skill-name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required/><Input label="Level" name="admin-skill-level" value={form.level} onChange={(event) => updateField('level', event.target.value)}/><label className={styles.textarea_field} htmlFor="admin-skill-description"><span>Description</span><textarea id="admin-skill-description" rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)}/></label><label className={styles.checkbox}><input type="checkbox" checked={form.active} onChange={(event) => updateField('active', event.target.checked)}/>Active skill</label><div className={styles.actions}><Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save skill'}</Button><Button variant="secondary" onClick={() => setForm(emptyForm)}>Clear</Button></div></form></section>
        </div>
    </div></main>;
}
