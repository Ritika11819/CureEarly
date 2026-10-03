import { useNavigate } from "react-router-dom";

function CreateProfile() {
    const navigate = useNavigate();
    return (
        <section className="create-profile">

            <h2>Start Taking Your Health Seriously.</h2>

            <p>
                Create your Curearly profile and keep
                your health information organized.
            </p>

            <button onClick={() => navigate('/register')}>
                Create Your Profile
            </button>

        </section>
    );
}

export default CreateProfile;