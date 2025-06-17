import { useNavigate } from "react-router-dom";
import { auth } from "../auth/auth.js";

function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        auth.login(() => navigate("/"));
    };

    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;