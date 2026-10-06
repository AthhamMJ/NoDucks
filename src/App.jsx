import TopBar from "./components/TopBar/Topbar";
import Sidebar from "./components/SideBar/Sidebar";
import Home from "./pages/Home/Home";

function App() {
    return (
        <>
            <TopBar />

            <main>
                <Sidebar />
                <Home />
            </main>
        </>
    );
}

export default App;