import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import SkillSelector from '../../skill/components/SkillSelector.jsx';
import {EMPLOYMENT_TYPES, JOB_LEVELS} from '../jobUtils.js';
import styles from './Job.module.css';

export default function JobForm({form, errors = {}, isSaving, submitLabel, onChange, onSubmit, onCancel}) {
    const updateField = (field) => (event) => onChange(field, event.target.type === 'checkbox' ? event.target.checked : event.target.value);

    return (
        <form className={styles.jobForm} onSubmit={onSubmit}>
            <section className={styles.formSection}>
                <div className={styles.formSectionHeader}><h2>Basic information</h2><p>Use a clear title and a location candidates can scan quickly.</p></div>
                <div className={styles.formGrid}>
                    <Input className={styles.fullRow} label="Job title" name="job-title" value={form.title} onChange={updateField('title')} error={errors.title} required/>
                    <Input label="Location" name="job-location" value={form.location} onChange={updateField('location')} error={errors.location} required/>
                    <Select label="Level" name="job-level" value={form.level} onChange={updateField('level')} error={errors.level} required>
                        <option value="">Choose level</option>
                        {JOB_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                    </Select>
                    <Select label="Employment type" name="job-employment-type" value={form.employmentType} onChange={updateField('employmentType')}>
                        {EMPLOYMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </Select>
                    <Input label="Open positions" name="job-quantity" type="number" min="1" value={form.quantity} onChange={updateField('quantity')} error={errors.quantity}/>
                </div>
            </section>

            <section className={styles.formSection}>
                <div className={styles.formSectionHeader}><h2>Salary and timeline</h2><p>Leave salary empty or mark it negotiable when the range is not public.</p></div>
                <div className={styles.formGrid}>
                    <Input label="Minimum salary (USD)" name="job-salary-min" type="number" min="0" value={form.salaryMin} onChange={updateField('salaryMin')}/>
                    <Input label="Maximum salary (USD)" name="job-salary-max" type="number" min="0" value={form.salaryMax} onChange={updateField('salaryMax')} error={errors.salaryMax}/>
                    <Input label="Experience years" name="job-experience" type="number" min="0" value={form.experienceYears} onChange={updateField('experienceYears')} error={errors.experienceYears}/>
                    <Input label="Start date" name="job-start-date" type="date" value={form.startDate} onChange={updateField('startDate')}/>
                    <Input label="Application deadline" name="job-expired-at" type="date" value={form.expiredAt} onChange={updateField('expiredAt')} error={errors.expiredAt}/>
                    <label className={styles.checkbox}><input type="checkbox" checked={form.negotiableSalary} onChange={updateField('negotiableSalary')}/>Negotiable salary</label>
                </div>
            </section>

            <section className={styles.formSection}>
                <div className={styles.formSectionHeader}><h2>Skills and content</h2><p>Describe the position with enough detail for a candidate to decide quickly.</p></div>
                <SkillSelector value={form.skillIds} onChange={(skillIds) => onChange('skillIds', skillIds)} label="Required skills"/>
                <label className={styles.textareaField}><span>Description *</span><textarea rows="7" value={form.description} onChange={updateField('description')}/>{errors.description && <small>{errors.description}</small>}</label>
                <label className={styles.textareaField}><span>Requirements</span><textarea rows="5" value={form.requirement} onChange={updateField('requirement')}/></label>
                <label className={styles.textareaField}><span>Benefits</span><textarea rows="5" value={form.benefit} onChange={updateField('benefit')}/></label>
            </section>

            <section className={styles.formSection}>
                <div className={styles.formSectionHeader}><h2>Publishing</h2><p>Save as draft for later review or publish immediately.</p></div>
                <label className={styles.checkbox}><input type="checkbox" checked={form.published} onChange={updateField('published')}/>Publish this job immediately</label>
            </section>

            <div className={styles.formActions}>
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : submitLabel}</Button>
                <Button variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
            </div>
        </form>
    );
}
