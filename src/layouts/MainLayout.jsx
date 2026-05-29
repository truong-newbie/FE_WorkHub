import {Outlet} from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import styles from './MainLayout.module.css';

export default function MainLayout() {
    return (
        <div className={styles.shell}>
            <AppHeader/>
            <main className={styles.mainContent}>
                <Outlet/>
            </main>
        </div>
    );
}
