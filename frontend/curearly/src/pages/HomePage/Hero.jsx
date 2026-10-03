import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/analysis");
    };

    return (
        <section className="hero">
            <div className="hero-content">
                <h1>
                    Early attention
                    <br />
                    can change everything.
                </h1>

                <p>
                    Understand your health reports,
                    identify potential warning signs,
                    and take action earlier.
                </p>

                <div className="hero-buttons">
                    <button type="button" onClick={handleGetStarted}>Get Started</button>
                    <button type="button" onClick={() => {
                        const target = document.querySelector('.how-it-works');
                        if (target) {
                            target.scrollIntoView({
                                behavior : "smooth"
                            });
                        }
                    }}>How It Works</button>
                </div>
            </div>

            <div className="hero-visual">
                {/* Medical illustration / graphic */}
            </div>
        </section>
    );
}

export default Hero;