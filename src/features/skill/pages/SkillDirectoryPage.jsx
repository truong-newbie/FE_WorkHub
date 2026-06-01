import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import {cleanParams, getItems, getPaginationMeta} from '../../shared/moduleUtils.js';
import {getPopularSkills, searchSkills} from '../services/skillService.js';
import styles from '../../shared/ModulePage.module.css';

export default function SkillDirectoryPage() {
    const [keyword, setKeyword] = useState('');
    const [appliedKeyword, setAppliedKeyword] = useState('');
    const [skills, setSkills] = useState([]);
    const [popular, setPopular] = useState([]);
    const [meta, setMeta] = useState({total: 0, totalPages: 1});
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadSkills = useCallback(async () => {
        setIsLoading(true);
        try {
            const [skillsData, popularData] = await Promise.all([
                searchSkills(cleanParams({keyword: appliedKeyword, pageNum: page, pageSize: 12, sortBy: 'name', isAscending: true}), {skipAuth: true, skipAuthCleanup: true}),
                getPopularSkills({limit: 10}),
            ]);
            const items = getItems(skillsData);
            setSkills(items);
            setPopular(popularData || []);
            setMeta(getPaginationMeta(skillsData, items.length));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load skills.');
        } finally {
            setIsLoading(false);
        }
    }, [appliedKeyword, page]);

    useEffect(() => { loadSkills(); }, [loadSkills]);

    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.header}><div><p className={styles.eyebrow}>Career skills</p><h1>Skill Directory</h1><p>Explore technologies and professional skills used across WorkHub jobs.</p></div></header>
        <section className={styles.panel}><form className={styles.filters} onSubmit={(event) => {event.preventDefault(); setPage(1); setAppliedKeyword(keyword.trim());}}><Input className={styles.grow} label="Search skills" name="skill-keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Java, React, Cloud..."/><Button type="submit">Search</Button></form></section>
        {popular.length > 0 && <section className={styles.panel}><div className={styles.panel_header}><div><h2>Popular skills</h2><p>Frequently used in published job openings.</p></div></div><div className={styles.actions}>{popular.map((skill) => <span className={styles.success_badge} key={skill.id}>{skill.name} {skill.usageCount ? `(${skill.usageCount})` : ''}</span>)}</div></section>}
        <ErrorMessage message={errorMessage}/>
        {isLoading ? <LoadingState label="Loading skills..."/> : skills.length === 0 ? <div className={styles.empty}>No skills found.</div> : <>
            <div className={styles.card_grid}>{skills.map((skill) => <article className={styles.card} key={skill.id}><div className={styles.card_header}><div><h2>{skill.name}</h2><p>{skill.level || 'General skill'}</p></div><span className={styles.success_badge}>Active</span></div><p>{skill.description || 'No description available.'}</p></article>)}</div>
            <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage}/>
        </>}
    </div></main>;
}
