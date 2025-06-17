import { useNavigate } from "react-router-dom";
import { auth } from "../auth/auth.js";

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.logout(() => navigate("/login"));
    };

    return (
        <div>
            <h1>Home Page</h1>
            {auth.isAuthenticated ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <p>Please login or register</p>
            )}
        </div>
    );
}

export default Home;