function YourReports() {
    return (
        <section className="your-reports">

            <h2>Your Reports. One Place.</h2>

            <div className="report-cards">

                <div className="report-card">
                    <span>📄</span>
                    <h3>Blood Reports</h3>
                    <p>
                        Upload blood report PDFs for analysis.
                    </p>
                </div>

                <div className="report-card">
                    <span>🩻</span>
                    <h3>PET Scans</h3>
                    <p>
                        Support for medical imaging analysis.
                    </p>
                </div>

                <div className="report-card">
                    <span>🔬</span>
                    <h3>Sonography & Images</h3>
                    <p>
                        Upload scanned medical images.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default YourReports;