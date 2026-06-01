import {useCallback, useEffect, useMemo, useState} from 'react';
import Button from '../../../components/ui/Button.jsx';
import ErrorMessage from '../../../components/ui/ErrorMessage.jsx';
import Input from '../../../components/ui/Input.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import Select from '../../../components/ui/Select.jsx';
import {useToast} from '../../../components/ui/useToast.js';
import {
    changeUserRole,
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    getUserStatistics,
    lockUser,
    unlockUser,
    updateUserById,
} from '../services/userService.js';
import styles from './AdminUserManagementPage.module.css';

const roleOptions = ['ROLE_ADMIN', 'ROLE_RECRUITER', 'ROLE_CANDIDATE'];
const genderOptions = ['MALE', 'FEMALE', 'OTHER'];

const emptyFilters = {
    keyword: '',
    role: '',
    gender: '',
    minAge: '',
    maxAge: '',
    companyId: '',
    enabled: '',
    includeDeleted: 'false',
    sortBy: 'createdDate',
    sortDir: 'DESC',
};

const emptyUserForm = {
    id: '',
    username: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    dob: '',
    address: '',
    phone: '',
    headline: '',
    bio: '',
    experienceYears: '',
    location: '',
    website: '',
    linkedinUrl: '',
    githubUrl: '',
    roleName: 'ROLE_CANDIDATE',
    enabled: 'true',
    companyId: '',
};

function getUsersItems(data) {
    if (Array.isArray(data)) {
        return data;
    }

    return data?.items || data?.content || data?.users || [];
}

function getUsersMeta(data) {
    return data?.meta || {
        totalPages: data?.totalPages || 1,
        pageNum: data?.pageNum || 1,
        pageSize: data?.pageSize || 10,
        totalElements: data?.totalElements || getUsersItems(data).length,
    };
}

function cleanParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );
}

function normalizeUserForm(user) {
    return {
        ...emptyUserForm,
        id: user?.id || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        age: user?.age ?? '',
        gender: user?.gender || '',
        dob: user?.dob || '',
        address: user?.address || '',
        phone: user?.phone || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        experienceYears: user?.experienceYears ?? '',
        location: user?.location || '',
        website: user?.website || '',
        linkedinUrl: user?.linkedinUrl || '',
        githubUrl: user?.githubUrl || '',
        roleName: user?.roleName || 'ROLE_CANDIDATE',
        enabled: user?.enabled === false ? 'false' : 'true',
        companyId: user?.companyId ?? '',
    };
}

function buildUserPayload(form, mode) {
    const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        age: form.age === '' ? null : Number(form.age),
        gender: form.gender || null,
        dob: form.dob || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        experienceYears: form.experienceYears === '' ? null : Number(form.experienceYears),
        location: form.location.trim() || null,
        website: form.website.trim() || null,
        linkedinUrl: form.linkedinUrl.trim() || null,
        githubUrl: form.githubUrl.trim() || null,
        roleName: form.roleName,
        enabled: form.enabled === 'true',
        companyId: form.companyId === '' ? null : form.companyId,
    };

    if (mode === 'create') {
        payload.password = form.password;
    }

    return payload;
}

function validateUserForm(form, mode) {
    if (!form.username.trim()) {
        return 'Username is required';
    }

    if (!form.email.trim()) {
        return 'Email is required';
    }

    if (mode === 'create' && !form.password) {
        return 'Password is required when creating a user';
    }

    if (mode === 'create' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
        return 'Password must be at least 8 characters and include uppercase, lowercase, and number';
    }

    if (form.age !== '' && Number(form.age) < 0) {
        return 'Age must be a positive number';
    }

    if (form.experienceYears !== '' && Number(form.experienceYears) < 0) {
        return 'Experience years must be a positive number';
    }

    return '';
}

function StatCard({label, value}) {
    return (
        <div className={styles.statCard}>
            <span>{label}</span>
            <strong>{value ?? 0}</strong>
        </div>
    );
}

export default function AdminUserManagementPage() {
    const {showToast} = useToast();
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({totalPages: 1, pageNum: 1, pageSize: 10, totalElements: 0});
    const [statistics, setStatistics] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [formMode, setFormMode] = useState('create');
    const [userForm, setUserForm] = useState(emptyUserForm);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [actionUserId, setActionUserId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formError, setFormError] = useState('');

    const totalPages = useMemo(() => Number(meta?.totalPages || 1), [meta]);

    const loadStatistics = useCallback(async () => {
        try {
            const data = await getUserStatistics();
            setStatistics(data);
        } catch (error) {
            showToast({message: error.message || 'Failed to load user statistics', type: 'error'});
        }
    }, [showToast]);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getUsers(cleanParams({
                ...appliedFilters,
                page: page - 1,
                size: pageSize,
            }));
            setUsers(getUsersItems(data));
            setMeta(getUsersMeta(data));
        } catch (error) {
            const message = error.message || 'Failed to load users';
            setErrorMessage(message);
            showToast({message, type: 'error'});
        } finally {
            setIsLoading(false);
        }
    }, [appliedFilters, page, pageSize, showToast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const updateFilter = (field, value) => {
        setFilters((current) => ({...current, [field]: value}));
    };

    const updateFormField = (field, value) => {
        setUserForm((current) => ({...current, [field]: value}));
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        setPage(1);
        setAppliedFilters(filters);
    };

    const handleResetFilters = () => {
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPage(1);
    };

    const handleNewUser = () => {
        setFormMode('create');
        setSelectedUser(null);
        setUserForm(emptyUserForm);
        setFormError('');
    };

    const handleEditUser = async (user) => {
        setActionUserId(user.id);
        setFormError('');

        try {
            const data = await getUserById(user.id);
            setSelectedUser(data);
            setUserForm(normalizeUserForm(data));
            setFormMode('edit');
        } catch (error) {
            const message = error.message || 'Failed to load user detail';
            setFormError(message);
            showToast({message, type: 'error'});
        } finally {
            setActionUserId('');
        }
    };

    const refreshAfterMutation = async () => {
        await Promise.all([loadUsers(), loadStatistics()]);
    };

    const handleUserSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        const validationError = validateUserForm(userForm, formMode);

        if (validationError) {
            setFormError(validationError);
            return;
        }

        setIsSaving(true);

        try {
            const payload = buildUserPayload(userForm, formMode);
            const savedUser = formMode === 'create'
                ? await createUser(payload)
                : await updateUserById(userForm.id, payload);

            setSelectedUser(savedUser);
            setUserForm(normalizeUserForm(savedUser));
            setFormMode('edit');
            showToast({
                message: formMode === 'create' ? 'User created successfully' : 'User updated successfully',
                type: 'success',
            });
            await refreshAfterMutation();
        } catch (error) {
            const message = error.message || 'Failed to save user';
            setFormError(message);
            showToast({message, type: 'error'});
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Delete user "${user.username || user.email}"?`)) {
            return;
        }

        setActionUserId(user.id);

        try {
            await deleteUser(user.id);
            showToast({message: 'User deleted successfully', type: 'success'});

            if (selectedUser?.id === user.id) {
                handleNewUser();
            }

            await refreshAfterMutation();
        } catch (error) {
            showToast({message: error.message || 'Failed to delete user', type: 'error'});
        } finally {
            setActionUserId('');
        }
    };

    const handleLockToggle = async (user) => {
        const isEnabled = user.enabled !== false;
        const reason = window.prompt(isEnabled ? 'Reason for locking this user' : 'Reason for unlocking this user');

        if (!reason) {
            return;
        }

        setActionUserId(user.id);

        try {
            if (isEnabled) {
                await lockUser(user.id, {reason});
                showToast({message: 'User locked successfully', type: 'success'});
            } else {
                await unlockUser(user.id, {reason});
                showToast({message: 'User unlocked successfully', type: 'success'});
            }

            await refreshAfterMutation();
        } catch (error) {
            showToast({message: error.message || 'Failed to update user status', type: 'error'});
        } finally {
            setActionUserId('');
        }
    };

    const handleChangeRole = async (user) => {
        const newRole = window.prompt('New role: ROLE_ADMIN, ROLE_RECRUITER, ROLE_CANDIDATE', user.roleName);

        if (!newRole || !roleOptions.includes(newRole)) {
            showToast({message: 'Role must be ROLE_ADMIN, ROLE_RECRUITER, or ROLE_CANDIDATE', type: 'error'});
            return;
        }

        const reason = window.prompt('Reason for changing role');

        if (!reason) {
            return;
        }

        setActionUserId(user.id);

        try {
            await changeUserRole(user.id, {newRole, reason});
            showToast({message: 'User role updated successfully', type: 'success'});
            await refreshAfterMutation();
        } catch (error) {
            showToast({message: error.message || 'Failed to change user role', type: 'error'});
        } finally {
            setActionUserId('');
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>User Management</h1>
                    <p>Manage users through the `/api/v1/user` admin endpoints.</p>
                </div>
                <Button onClick={handleNewUser}>New user</Button>
            </div>

            <section className={styles.statsGrid}>
                <StatCard label="Total users" value={statistics?.totalUsers}/>
                <StatCard label="Active" value={statistics?.activeUsers}/>
                <StatCard label="Locked" value={statistics?.lockedUsers}/>
                <StatCard label="Deleted" value={statistics?.deletedUsers}/>
                <StatCard label="New today" value={statistics?.newUsersToday}/>
                <StatCard label="New this month" value={statistics?.newUsersThisMonth}/>
            </section>

            <section className={styles.panel}>
                <form className={styles.filters} onSubmit={handleFilterSubmit}>
                    <Input
                        label="Keyword"
                        name="keyword"
                        value={filters.keyword}
                        onChange={(event) => updateFilter('keyword', event.target.value)}
                    />
                    <Select
                        label="Role"
                        name="role"
                        value={filters.role}
                        onChange={(event) => updateFilter('role', event.target.value)}
                    >
                        <option value="">All roles</option>
                        {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                    </Select>
                    <Select
                        label="Gender"
                        name="gender"
                        value={filters.gender}
                        onChange={(event) => updateFilter('gender', event.target.value)}
                    >
                        <option value="">All genders</option>
                        {genderOptions.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                    </Select>
                    <Input
                        label="Min age"
                        name="minAge"
                        type="number"
                        min="0"
                        value={filters.minAge}
                        onChange={(event) => updateFilter('minAge', event.target.value)}
                    />
                    <Input
                        label="Max age"
                        name="maxAge"
                        type="number"
                        min="0"
                        value={filters.maxAge}
                        onChange={(event) => updateFilter('maxAge', event.target.value)}
                    />
                    <Input
                        label="Company ID"
                        name="companyId"
                        value={filters.companyId}
                        onChange={(event) => updateFilter('companyId', event.target.value)}
                    />
                    <Select
                        label="Enabled"
                        name="enabled"
                        value={filters.enabled}
                        onChange={(event) => updateFilter('enabled', event.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Enabled</option>
                        <option value="false">Locked</option>
                    </Select>
                    <Select
                        label="Deleted"
                        name="includeDeleted"
                        value={filters.includeDeleted}
                        onChange={(event) => updateFilter('includeDeleted', event.target.value)}
                    >
                        <option value="false">Hide deleted</option>
                        <option value="true">Include deleted</option>
                    </Select>
                    <Select
                        label="Page size"
                        name="pageSize"
                        value={pageSize}
                        onChange={(event) => {
                            setPage(1);
                            setPageSize(Number(event.target.value));
                        }}
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </Select>
                    <div className={styles.filterActions}>
                        <Button type="button" variant="secondary" onClick={handleResetFilters}>Reset</Button>
                        <Button type="submit">Apply</Button>
                    </div>
                </form>
            </section>

            <div className={styles.contentGrid}>
                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>Users</h2>
                            <p>{meta?.totalElements || users.length} records</p>
                        </div>
                        <Button variant="secondary" onClick={refreshAfterMutation}>Refresh</Button>
                    </div>

                    <ErrorMessage message={errorMessage}/>

                    {isLoading ? (
                        <LoadingState label="Loading users..."/>
                    ) : (
                        <>
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Company</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td className={styles.empty} colSpan="5">No users found</td>
                                            </tr>
                                        ) : users.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" className={styles.avatar}/>
                                                        ) : (
                                                            <span className={styles.avatarFallback}>
                                                                {(user.username || user.email || 'U').slice(0, 1).toUpperCase()}
                                                            </span>
                                                        )}
                                                        <div>
                                                            <strong>{user.username || 'Unnamed user'}</strong>
                                                            <span>{user.email || 'No email'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className={styles.roleBadge}>{user.roleName || 'N/A'}</span></td>
                                                <td>
                                                    <span className={user.deleted ? styles.deletedBadge : user.enabled === false ? styles.lockedBadge : styles.activeBadge}>
                                                        {user.deleted ? 'Deleted' : user.enabled === false ? 'Locked' : 'Active'}
                                                    </span>
                                                </td>
                                                <td>{user.companyName || user.companyId || 'None'}</td>
                                                <td>
                                                    <div className={styles.rowActions}>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => handleEditUser(user)}
                                                            disabled={actionUserId === user.id}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => handleLockToggle(user)}
                                                            disabled={actionUserId === user.id || user.deleted}
                                                        >
                                                            {user.enabled === false ? 'Unlock' : 'Lock'}
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => handleChangeRole(user)}
                                                            disabled={actionUserId === user.id || user.deleted}
                                                        >
                                                            Role
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => handleDeleteUser(user)}
                                                            disabled={actionUserId === user.id || user.deleted}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage}/>
                        </>
                    )}
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>{formMode === 'create' ? 'Create user' : 'Edit user'}</h2>
                            <p>{selectedUser?.id || 'POST /user'}</p>
                        </div>
                    </div>

                    <form className={styles.userForm} onSubmit={handleUserSubmit}>
                        <Input
                            label="Username"
                            name="username"
                            value={userForm.username}
                            onChange={(event) => updateFormField('username', event.target.value)}
                            required
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={userForm.email}
                            onChange={(event) => updateFormField('email', event.target.value)}
                            required
                        />
                        {formMode === 'create' && (
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                value={userForm.password}
                                onChange={(event) => updateFormField('password', event.target.value)}
                                required
                            />
                        )}
                        <Select
                            label="Role"
                            name="roleName"
                            value={userForm.roleName}
                            onChange={(event) => updateFormField('roleName', event.target.value)}
                        >
                            {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                        </Select>
                        <Select
                            label="Enabled"
                            name="enabled"
                            value={userForm.enabled}
                            onChange={(event) => updateFormField('enabled', event.target.value)}
                        >
                            <option value="true">Enabled</option>
                            <option value="false">Locked</option>
                        </Select>
                        <Input
                            label="Age"
                            name="age"
                            type="number"
                            min="0"
                            value={userForm.age}
                            onChange={(event) => updateFormField('age', event.target.value)}
                        />
                        <Select
                            label="Gender"
                            name="gender"
                            value={userForm.gender}
                            onChange={(event) => updateFormField('gender', event.target.value)}
                        >
                            <option value="">Not set</option>
                            {genderOptions.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                        </Select>
                        <Input
                            label="Date of birth"
                            name="dob"
                            type="date"
                            value={userForm.dob}
                            onChange={(event) => updateFormField('dob', event.target.value)}
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={userForm.phone}
                            onChange={(event) => updateFormField('phone', event.target.value)}
                        />
                        <Input
                            label="Company ID"
                            name="companyId"
                            value={userForm.companyId}
                            onChange={(event) => updateFormField('companyId', event.target.value)}
                        />
                        <Input
                            label="Headline"
                            name="headline"
                            value={userForm.headline}
                            onChange={(event) => updateFormField('headline', event.target.value)}
                        />
                        <Input
                            label="Experience years"
                            name="experienceYears"
                            type="number"
                            min="0"
                            value={userForm.experienceYears}
                            onChange={(event) => updateFormField('experienceYears', event.target.value)}
                        />
                        <Input
                            label="Location"
                            name="location"
                            value={userForm.location}
                            onChange={(event) => updateFormField('location', event.target.value)}
                        />
                        <Input
                            label="Website"
                            name="website"
                            value={userForm.website}
                            onChange={(event) => updateFormField('website', event.target.value)}
                        />
                        <Input
                            label="LinkedIn URL"
                            name="linkedinUrl"
                            value={userForm.linkedinUrl}
                            onChange={(event) => updateFormField('linkedinUrl', event.target.value)}
                        />
                        <Input
                            label="GitHub URL"
                            name="githubUrl"
                            value={userForm.githubUrl}
                            onChange={(event) => updateFormField('githubUrl', event.target.value)}
                        />
                        <Input
                            className={styles.fullRow}
                            label="Address"
                            name="address"
                            value={userForm.address}
                            onChange={(event) => updateFormField('address', event.target.value)}
                        />
                        <label className={`${styles.textareaField} ${styles.fullRow}`} htmlFor="admin-user-bio">
                            <span>Bio</span>
                            <textarea
                                id="admin-user-bio"
                                className={styles.textarea}
                                value={userForm.bio}
                                onChange={(event) => updateFormField('bio', event.target.value)}
                            />
                        </label>

                        <ErrorMessage message={formError}/>

                        <div className={`${styles.formActions} ${styles.fullRow}`}>
                            <Button type="button" variant="secondary" onClick={handleNewUser} disabled={isSaving}>
                                Clear
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : formMode === 'create' ? 'Create user' : 'Save user'}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
