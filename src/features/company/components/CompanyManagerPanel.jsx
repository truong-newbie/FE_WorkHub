import {useCallback, useEffect, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {
    deleteCompany,
    getCompanyStatistics,
    updateCurrentCompany,
    uploadCompanyCover,
    uploadCompanyLogo,
} from '../services/companyService.js';
import {buildCompanyPayload, toCompanyForm, validateCompany} from '../companyUtils.js';
import styles from '../../shared/ModulePage.module.css';

export default function CompanyManagerPanel({company, onCompanyChange}) {
    const {showToast} = useToast();
    const [form, setForm] = useState(() => toCompanyForm(company));
    const [errors, setErrors] = useState({});
    const [statistics, setStatistics] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const loadStatistics = useCallback(async () => {
        try {
            setStatistics(await getCompanyStatistics(company.id));
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load company statistics.');
        }
    }, [company.id]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const updateField = (field, value) => {
        setForm((current) => ({...current, [field]: value}));
        setErrors((current) => ({...current, [field]: ''}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateCompany(form);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length) return;

        setIsSaving(true);
        try {
            const updated = await updateCurrentCompany(buildCompanyPayload(form));
            onCompanyChange(updated);
            showToast({message: 'Company profile updated.', type: 'success'});
        } catch (error) {
            showToast({message: error.message || 'Unable to update company.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleImage = async (type, file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast({message: 'Choose a valid image file.', type: 'error'});
            return;
        }
        setIsSaving(true);
        try {
            const updated = type === 'logo' ? await uploadCompanyLogo(company.id, file) : await uploadCompanyCover(company.id, file);
            onCompanyChange(updated);
            showToast({message: `Company ${type} updated.`, type: 'success'});
        } catch (error) {
            showToast({message: error.message || `Unable to upload company ${type}.`, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete company "${company.name}"?`)) return;
        setIsSaving(true);
        try {
            await deleteCompany(company.id);
            showToast({message: 'Company deleted.', type: 'success'});
            onCompanyChange(null);
        } catch (error) {
            showToast({message: error.message || 'Unable to delete company.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <section className={styles.panel}>
                <div className={styles.panel_header}><div><h2>Company statistics</h2><p>Current hiring activity</p></div></div>
                <ErrorMessage message={errorMessage}/>
                <div className={styles.stats_grid}>
                    <div className={styles.stat}><span>Total jobs</span><strong>{statistics?.totalJobs ?? 0}</strong></div>
                    <div className={styles.stat}><span>Active jobs</span><strong>{statistics?.activeJobs ?? 0}</strong></div>
                    <div className={styles.stat}><span>Applications</span><strong>{statistics?.totalApplications ?? 0}</strong></div>
                    <div className={styles.stat}><span>Pending applications</span><strong>{statistics?.pendingApplications ?? 0}</strong></div>
                </div>
            </section>
            <section className={styles.panel}>
                <div className={styles.panel_header}><div><h2>Manage company profile</h2><p>Keep public employer information accurate.</p></div></div>
                <form className={styles.form_grid} onSubmit={handleSubmit}>
                    <Input label="Company name" name="company-name" value={form.name} error={errors.name} onChange={(event) => updateField('name', event.target.value)} required/>
                    <Input label="Website" name="company-website" value={form.website} error={errors.website} onChange={(event) => updateField('website', event.target.value)}/>
                    <Input label="Email" name="company-email" value={form.email} error={errors.email} onChange={(event) => updateField('email', event.target.value)}/>
                    <Input label="Phone" name="company-phone" value={form.phone} error={errors.phone} onChange={(event) => updateField('phone', event.target.value)}/>
                    <Input label="Address" name="company-address" value={form.address} onChange={(event) => updateField('address', event.target.value)}/>
                    <Input label="City" name="company-city" value={form.city} onChange={(event) => updateField('city', event.target.value)}/>
                    <Input label="Country" name="company-country" value={form.country} onChange={(event) => updateField('country', event.target.value)}/>
                    <Input label="Company size" name="company-size" value={form.companySize} onChange={(event) => updateField('companySize', event.target.value)}/>
                    <Input label="Industry" name="company-industry" value={form.industry} onChange={(event) => updateField('industry', event.target.value)}/>
                    <Input label="Tax code" name="company-tax-code" value={form.taxCode} onChange={(event) => updateField('taxCode', event.target.value)}/>
                    <label className={`${styles.textarea_field} ${styles.full_row}`} htmlFor="company-description"><span>Description</span><textarea id="company-description" rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)}/></label>
                    <div className={`${styles.actions} ${styles.full_row}`}>
                        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save company'}</Button>
                        <Button variant="danger" onClick={handleDelete} disabled={isSaving}>Delete company</Button>
                    </div>
                </form>
            </section>
            <section className={styles.panel}>
                <div className={styles.panel_header}><div><h2>Company media</h2><p>Upload image files for your company profile.</p></div></div>
                <div className={styles.actions}>
                    <label className={styles.stack}>Logo image<input className={styles.file_input} type="file" accept="image/*" onChange={(event) => handleImage('logo', event.target.files?.[0])}/></label>
                    <label className={styles.stack}>Cover image<input className={styles.file_input} type="file" accept="image/*" onChange={(event) => handleImage('cover', event.target.files?.[0])}/></label>
                </div>
            </section>
        </>
    );
}
