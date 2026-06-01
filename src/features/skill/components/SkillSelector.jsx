import {useCallback, useEffect, useState} from 'react';
import Input from '../../../components/ui/Input.jsx';
import {getSkillSuggestions} from '../services/skillService.js';
import styles from './SkillSelector.module.css';

export default function SkillSelector({value = [], onChange, label = 'Skills'}) {
    const [keyword, setKeyword] = useState('');
    const [skills, setSkills] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const loadSkills = useCallback(async () => {
        try {
            setSkills(await getSkillSuggestions({keyword, limit: 50}));
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load skill suggestions.');
        }
    }, [keyword]);

    useEffect(() => {
        loadSkills();
    }, [loadSkills]);

    const toggleSkill = (skillId) => {
        const id = Number(skillId);
        onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
    };

    return (
        <div className={styles.selector}>
            <Input label={label} name={`${label}-search`} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search skills"/>
            {errorMessage && <span className={styles.error}>{errorMessage}</span>}
            <div className={styles.options}>
                {skills.map((skill) => (
                    <label key={skill.id} className={value.includes(Number(skill.id)) ? styles.selected : styles.option}>
                        <input type="checkbox" checked={value.includes(Number(skill.id))} onChange={() => toggleSkill(skill.id)}/>
                        <span>{skill.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
