import { useEffect, useState } from "react";
import "./HealthCarousel.css";
import understandReports from "../../assets/understand_your_reports.png"
import analyzeHealth from "../../assets/analyze_your_health_info.png";
import healthOverview from "../../assets/health_overview.png";
import knowWhereToGo from "../../assets/know_where_to_go.png";

function HealthCarousel() {

    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Understand Your Reports",
            description:
                "Bring your blood reports, scans and medical images together in one place.",
            image: understandReports

        },
        {
            title: "Analyze Your Health Information",
            description:
                "Curearly brings your available health information together to generate meaningful insights.",
            image: analyzeHealth
        },
        {
            title: "See Your Health Clearly",
            description:
                "View your health information through a simple and understandable overview.",
            image: healthOverview
        },
        {
            title: "Know Where To Go",
            description:
                "When further medical attention may be appropriate, discover nearby healthcare facilities.",
            image: knowWhereToGo
        }
    ];


    /* Automatically move to next slide */

    useEffect(() => {

        const interval = setInterval(() => {

            setCurrentSlide((previous) =>
                (previous + 1) % slides.length
            );

        }, 4500);

        return () => clearInterval(interval);

    }, [slides.length]);


    /* Go to particular slide */

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };


    return (
        <section
            className="health-carousel"
        >

            <div className="carousel-content">

                {/* ================================
                    VISUAL
                   ================================ */}

                <div className="carousel-visual">

                    <img
                        src={slides[currentSlide].image}
                        alt={slides[currentSlide].title}
                    />

                </div>


                {/* ================================
                    TEXT
                   ================================ */}

                <div className="carousel-text">

                    <span className="carousel-label">
                        CUREARLY
                    </span>

                    <h2>
                        {slides[currentSlide].title}
                    </h2>

                    <p>
                        {slides[currentSlide].description}
                    </p>


                    {/* Slide indicators */}

                    <div className="carousel-dots">

                        {slides.map((_, index) => (

                            <button
                                key={index}
                                className={
                                    index === currentSlide
                                        ? "active"
                                        : ""
                                }
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />

                        ))}

                    </div>

                </div>

            </div>

        </section>
    );
}

export default HealthCarousel;