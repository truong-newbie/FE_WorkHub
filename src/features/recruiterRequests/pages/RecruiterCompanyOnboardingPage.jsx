import {useCallback, useEffect, useMemo, useState} from 'react';
import {FaBuilding, FaCheckCircle, FaSearch, FaUsers} from 'react-icons/fa';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {getCurrentUserProfile} from '../../user/services/userService.js';
import RequestStatusBadge from '../components/RequestStatusBadge.jsx';
import {formatRequestDate, getItems} from '../recruiterRequestUtils.js';
import {
    createCompany,
    createCompanyJoinRequest,
    getCurrentRecruiterCompany,
    getMyCompanyJoinRequests,
    searchCompanies,
} from '../services/recruiterRequestService.js';
import styles from './RecruiterCompanyOnboardingPage.module.css';

const emptyCompanyForm = {
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    companySize: '',
    industry: '',
    taxCode: '',
};

function validateCompany(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = 'Company name is required.';
    } else if (form.name.trim().length > 255) {
        errors.name = 'Company name must not exceed 255 characters.';
    }

    if (form.website && !/^https?:\/\/\S+$/i.test(form.website)) {
        errors.website = 'Website must start with http:// or https://.';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Enter a valid company email.';
    }

    if (form.phone && !/^[\d\s+()-]{8,20}$/.test(form.phone)) {
        errors.phone = 'Phone must contain 8 to 20 valid characters.';
    }

    return errors;
}

function buildCompanyPayload(form) {
    return Object.fromEntries(
        Object.entries({...form, active: true})
            .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
            .filter(([, value]) => value !== ''),
    );
}

export default function RecruiterCompanyOnboardingPage() {
    const {showToast} = useToast();
    const [company, setCompany] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [joinMessage, setJoinMessage] = useState('');
    const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
    const [companyErrors, setCompanyErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const pendingRequest = useMemo(
        () => joinRequests.find((request) => request.status === 'PENDING'),
        [joinRequests],
    );

    const loadOnboarding = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const profile = await getCurrentUserProfile();
            let currentCompany = null;

            if (profile?.companyId) {
                currentCompany = await getCurrentRecruiterCompany();
            }

            setCompany(currentCompany);

            if (!currentCompany) {
                const requestData = await getMyCompanyJoinRequests({page: 0, size: 10});
                setJoinRequests(getItems(requestData));
            }
        } catch (error) {
            setErrorMessage(error.message || 'Unable to load recruiter company onboarding.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOnboarding();
    }, [loadOnboarding]);

    const handleSearch = async (event) => {
        event.preventDefault();
        setIsSearching(true);

        try {
            const data = await searchCompanies({pageNum: 1, pageSize: 10, keyword: keyword.trim()});
            setCompanies(getItems(data));
        } catch (error) {
            showToast({message: error.message || 'Unable to search companies.', type: 'error'});
        } finally {
            setIsSearching(false);
        }
    };

    const handleJoin = async (targetCompany) => {
        if (joinMessage.length > 1000) {
            showToast({message: 'Join request message must not exceed 1000 characters.', type: 'error'});
            return;
        }

        if (!window.confirm(`Send a join request to "${targetCompany.name}"?`)) {
            return;
        }

        setIsSaving(true);

        try {
            const message = joinMessage.trim();
            await createCompanyJoinRequest(targetCompany.id, message ? {message} : {});
            showToast({message: 'Company join request submitted.', type: 'success'});
            setJoinMessage('');
            await loadOnboarding();
        } catch (error) {
            showToast({message: error.message || 'Unable to submit company join request.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const updateCompanyField = (field, value) => {
        setCompanyForm((current) => ({...current, [field]: value}));
        setCompanyErrors((current) => ({...current, [field]: ''}));
    };

    const handleCreateCompany = async (event) => {
        event.preventDefault();
        const errors = validateCompany(companyForm);
        setCompanyErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSaving(true);

        try {
            const createdCompany = await createCompany(buildCompanyPayload(companyForm));
            setCompany(createdCompany);
            setCompanyForm(emptyCompanyForm);
            showToast({message: 'Company created. It is waiting for administrator verification.', type: 'success'});
        } catch (error) {
            showToast({message: error.message || 'Unable to create company.', type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <LoadingState label="Loading recruiter company onboarding..."/>;
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>Recruiter onboarding</p>
                        <h1>Company Setup</h1>
                        <p>Connect your recruiter account to a company before publishing job openings.</p>
                    </div>
                    <Button variant="secondary" onClick={loadOnboarding}>Refresh</Button>
                </header>

                <ErrorMessage message={errorMessage}/>

                {company ? (
                    <section className={styles.companyCard}>
                        <div className={styles.companyIcon}><FaBuilding/></div>
                        <div>
                            <h2>{company.name || 'Your company'}</h2>
                            <p>Your recruiter account is linked to this company.</p>
                            <div className={styles.companyMeta}>
                                <span className={company.verified ? styles.goodBadge : styles.pendingBadge}>
                                    {company.verified ? 'Verified' : 'Waiting for verification'}
                                </span>
                                <span className={company.active ? styles.goodBadge : styles.pendingBadge}>
                                    {company.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </section>
                ) : (
                    <>
                        <section className={styles.summaryCard}>
                            <FaUsers/>
                            <div>
                                <h2>Choose how to connect your company</h2>
                                <p>Join an active verified company, or create a new company if it is not listed yet.</p>
                            </div>
                        </section>

                        {joinRequests.length > 0 && (
                            <section className={styles.panel}>
                                <div className={styles.panelHeader}>
                                    <div>
                                        <h2>Your join requests</h2>
                                        <p>Approved requests link your recruiter account to the selected company.</p>
                                    </div>
                                </div>
                                <div className={styles.requestList}>
                                    {joinRequests.map((request) => (
                                        <div key={request.id} className={styles.requestItem}>
                                            <div>
                                                <strong>{request.company?.name || `Company #${request.company?.id || 'N/A'}`}</strong>
                                                <span>Submitted {formatRequestDate(request.createdDate)}</span>
                                                {request.reviewNote && <small>Review note: {request.reviewNote}</small>}
                                            </div>
                                            <RequestStatusBadge status={request.status}/>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className={styles.contentGrid}>
                            <section className={styles.panel}>
                                <div className={styles.panelHeader}>
                                    <div>
                                        <h2>Join an existing company</h2>
                                        <p>Only active and verified companies can receive join requests.</p>
                                    </div>
                                </div>
                                <form className={styles.searchForm} onSubmit={handleSearch}>
                                    <Input
                                        label="Company keyword"
                                        name="companyKeyword"
                                        value={keyword}
                                        onChange={(event) => setKeyword(event.target.value)}
                                        placeholder="Search by name, city, or industry"
                                    />
                                    <Button type="submit" disabled={isSearching}>
                                        <FaSearch/> {isSearching ? 'Searching...' : 'Search'}
                                    </Button>
                                </form>
                                <label className={styles.textareaField} htmlFor="join-message">
                                    <span>Message for the company owner <small>Optional</small></span>
                                    <textarea
                                        id="join-message"
                                        rows="3"
                                        maxLength="1000"
                                        value={joinMessage}
                                        onChange={(event) => setJoinMessage(event.target.value)}
                                        placeholder="Explain your role at the company."
                                        disabled={Boolean(pendingRequest)}
                                    />
                                </label>
                                <div className={styles.companyList}>
                                    {companies.length === 0 ? (
                                        <p className={styles.empty}>Search for a company to begin.</p>
                                    ) : companies.map((item) => {
                                        const canJoin = item.active && item.verified && !pendingRequest;
                                        return (
                                            <div key={item.id} className={styles.companyResult}>
                                                <div>
                                                    <strong>{item.name}</strong>
                                                    <span>{[item.city, item.country, item.industry].filter(Boolean).join(' · ') || 'No additional details'}</span>
                                                    {(!item.active || !item.verified) && <small>Company is not available for join requests.</small>}
                                                </div>
                                                <Button onClick={() => handleJoin(item)} disabled={!canJoin || isSaving}>
                                                    Request to join
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className={styles.panel}>
                                <div className={styles.panelHeader}>
                                    <div>
                                        <h2>Create a new company</h2>
                                        <p>The company will require administrator verification.</p>
                                    </div>
                                </div>
                                <form className={styles.companyForm} onSubmit={handleCreateCompany}>
                                    <Input label="Company name" name="name" value={companyForm.name} error={companyErrors.name} onChange={(event) => updateCompanyField('name', event.target.value)} required/>
                                    <Input label="Website" name="website" value={companyForm.website} error={companyErrors.website} onChange={(event) => updateCompanyField('website', event.target.value)}/>
                                    <Input label="Company email" name="email" type="email" value={companyForm.email} error={companyErrors.email} onChange={(event) => updateCompanyField('email', event.target.value)}/>
                                    <Input label="Phone" name="phone" value={companyForm.phone} error={companyErrors.phone} onChange={(event) => updateCompanyField('phone', event.target.value)}/>
                                    <Input label="Address" name="address" value={companyForm.address} onChange={(event) => updateCompanyField('address', event.target.value)}/>
                                    <Input label="City" name="city" value={companyForm.city} onChange={(event) => updateCompanyField('city', event.target.value)}/>
                                    <Input label="Country" name="country" value={companyForm.country} onChange={(event) => updateCompanyField('country', event.target.value)}/>
                                    <Input label="Company size" name="companySize" value={companyForm.companySize} onChange={(event) => updateCompanyField('companySize', event.target.value)}/>
                                    <Input label="Industry" name="industry" value={companyForm.industry} onChange={(event) => updateCompanyField('industry', event.target.value)}/>
                                    <Input label="Tax code" name="taxCode" value={companyForm.taxCode} onChange={(event) => updateCompanyField('taxCode', event.target.value)}/>
                                    <label className={styles.textareaField} htmlFor="company-description">
                                        <span>Description</span>
                                        <textarea id="company-description" rows="3" value={companyForm.description} onChange={(event) => updateCompanyField('description', event.target.value)}/>
                                    </label>
                                    <Button type="submit" disabled={isSaving || Boolean(pendingRequest)}>
                                        {isSaving ? 'Creating...' : 'Create company'}
                                    </Button>
                                </form>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
