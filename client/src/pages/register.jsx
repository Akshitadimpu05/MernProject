import { useNavigate } from "react-router-dom";
import { auth } from "../auth/auth.js";

function Register() {
    const navigate = useNavigate();

    const handleRegister = () => {
        auth.login(() => navigate("/"));
    };

    return (
        <div>
            <h1>Register Page</h1>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;