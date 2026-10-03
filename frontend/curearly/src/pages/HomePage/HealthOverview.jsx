function HealthOverview() {
    return (
        <section className="health-overview">

            <div className="health-overview-text">
                <h2>See Your Health Clearly</h2>

                <p>
                    Bring your health information together
                    and understand the bigger picture.
                </p>
            </div>

            <div className="health-dashboard-preview">

                <h3>Health Overview</h3>

                <div className="risk-level">
                    <span>Attention Level</span>
                    <strong>Moderate</strong>
                </div>

                <div className="health-items">
                    <div>Blood Parameters</div>
                    <div>Medical History</div>
                    <div>Symptoms</div>
                </div>

            </div>

        </section>
    );
}

export default HealthOverview;