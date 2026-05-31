import {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {FaBars} from 'react-icons/fa';
import AppHeader from '../components/AppHeader.jsx';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={styles.shell}>
            <AppHeader hideNavigation/>
            <div className={styles.workspace}>
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
                <div className={styles.contentColumn}>
                    <button
                        type="button"
                        className={styles.menuButton}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <FaBars/>
                        Admin menu
                    </button>
                    <main className={styles.mainContent}>
                        <Outlet/>
                    </main>
                </div>
            </div>
        </div>
    );
}
