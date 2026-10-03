import Hero from "./Hero";
import WhyCurearly from "./WhyCurearly";
import HowItWorks from "./HowItWorks";
import YourReports from "./YourReports";
import HealthOverview from "./HealthOverview";
import WhenItMatters from "./WhenItMatters";
import CreateProfile from "./CreateProfile";
import './HomePage.css'
import HealthCarousel from "./HealthCarousel";

function HomePage() {
    return (
        <>
            <main>
                <Hero />
                <HealthCarousel />
                <WhyCurearly />
                <HowItWorks />
                <YourReports />
                <HealthOverview />
                <WhenItMatters />
                <CreateProfile />
            </main>

        </>
    );
}

export default HomePage;