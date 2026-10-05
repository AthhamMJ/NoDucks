import TopBar from '../components/TopBar/Topbar';
import Sidebar from '../components/SideBar/Sidebar'

function AppLayout({ children }) {
    return (
        <>
            <TopBar />

            <main>
                <Sidebar />
                {children}
            </main>
        </>
    );
}

export default AppLayout;