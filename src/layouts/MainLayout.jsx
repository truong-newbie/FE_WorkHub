import {Outlet} from 'react-router-dom';
import Sidebar from '../components/sidebar.jsx';
import {useAuth} from '../stores/useAuth.js';
import styles from './MainLayout.module.css';

export default function MainLayout() {
    const {logout} = useAuth();

    return (
        <div className={styles.shell}>
            <Sidebar onLogout={logout}/>
            <main className={styles.mainContent}>
                <Outlet/>
            </main>
        </div>
    );
}
