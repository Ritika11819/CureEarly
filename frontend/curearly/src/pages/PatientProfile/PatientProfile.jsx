import { useState, useEffect } from "react";
import "./PatientProfile.css";
import { api } from "../../api";

function PatientProfile() {

    const [profile, setProfile] = useState({
        fullName: "",
        age: "",
        gender: "",
        city: "",
        phone: "",

        bloodGroup: "",
        height: "",
        weight: "",
        smoking: "",
        alcoholConsumption: "",
        sleepHours: "",
        stressLevel: ""
    });

    const [diseases, setDiseases] = useState([]);
    const [medications, setMedications] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [familyHistory, setFamilyHistory] = useState([]);

    const [currentDisease, setCurrentDisease] = useState("");
    const [currentMedicine, setCurrentMedicine] = useState("");
    const [currentAllergy, setCurrentAllergy] = useState("");
    const [currentFamilyDisease, setCurrentFamilyDisease] = useState("");
    const [familyRelation, setFamilyRelation] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api('/api/patients/me').then((data) => {
            if (!data) return;
            const hp = data.healthProfile || {};
            setProfile({
                fullName: data.fullName || '',
                age: data.age !== null && data.age !== undefined ? String(data.age) : '',
                gender: data.gender || '',
                city: data.city || '',
                phone: data.phone || '',
                bloodGroup: hp.bloodGroup || '',
                height: hp.height !== null && hp.height !== undefined ? String(hp.height) : '',
                weight: hp.weight !== null && hp.weight !== undefined ? String(hp.weight) : '',
                smoking: hp.smoking === true ? 'Yes' : hp.smoking === false ? 'No' : '',
                alcoholConsumption: hp.alcoholConsumption === true ? 'Yes' : hp.alcoholConsumption === false ? 'No' : '',
                sleepHours: hp.sleepHours !== null && hp.sleepHours !== undefined ? String(hp.sleepHours) : '',
                stressLevel: hp.stressLevel !== null && hp.stressLevel !== undefined ? String(hp.stressLevel) : '',
            });
            if (data.conditions && Array.isArray(data.conditions)) {
                setDiseases(data.conditions.map((c) => c.name || c));
            }
            if (data.medications && Array.isArray(data.medications)) {
                setMedications(data.medications.map((m) => m.name || m));
            }
            if (data.allergies && Array.isArray(data.allergies)) {
                setAllergies(data.allergies.map((a) => a.name || a));
            }
            if (data.familyHistory && Array.isArray(data.familyHistory)) {
                setFamilyHistory(data.familyHistory.map((f) => ({
                    disease: f.diseaseName || f.disease || '',
                    relation: f.relation || ''
                })));
            }
        }).catch((err) => {
            console.warn('Could not load existing patient profile:', err);
        });
    }, []);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    /* =========================
       ADD MEDICAL HISTORY
    ========================= */

    const addDisease = () => {

        if (!currentDisease.trim()) return;

        setDiseases((previous) => [
            ...previous,
            currentDisease.trim()
        ]);

        setCurrentDisease("");
    };


    const addMedication = () => {

        if (!currentMedicine.trim()) return;

        setMedications((previous) => [
            ...previous,
            currentMedicine.trim()
        ]);

        setCurrentMedicine("");
    };


    const addAllergy = () => {

        if (!currentAllergy.trim()) return;

        setAllergies((previous) => [
            ...previous,
            currentAllergy.trim()
        ]);

        setCurrentAllergy("");
    };


    const addFamilyHistory = () => {

        if (
            !currentFamilyDisease.trim() ||
            !familyRelation.trim()
        ) {
            return;
        }

        setFamilyHistory((previous) => [
            ...previous,
            {
                disease: currentFamilyDisease.trim(),
                relation: familyRelation.trim()
            }
        ]);

        setCurrentFamilyDisease("");
        setFamilyRelation("");
    };


    /* =========================
       REMOVE ITEMS
    ========================= */

    const removeDisease = (index) => {

        setDiseases((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };


    const removeMedication = (index) => {

        setMedications((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };


    const removeAllergy = (index) => {

        setAllergies((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };


    const removeFamilyHistory = (index) => {

        setFamilyHistory((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };


    /* =========================
       SUBMIT
    ========================= */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            !profile.fullName.trim() ||
            !profile.age ||
            !profile.gender ||
            !profile.phone.trim()
        ) {
            setError(
                "Please fill in all required basic information."
            );

            return;
        }

        setLoading(true);

        const profileData = {
            ...profile,
            smoking: profile.smoking === "" ? null : profile.smoking === "Yes",
            alcoholConsumption: profile.alcoholConsumption === "" ? null : profile.alcoholConsumption === "Yes",
            conditions: diseases.map((name) => ({ name, status: "ACTIVE" })),
            medications: medications.map((name) => ({ name })),
            allergies: allergies.map((name) => ({ name, seriousness: "MODERATE" })),
            familyHistory: familyHistory.map(({ disease, relation }) => ({ diseaseName: disease, relation }))
        };

        try {
            await api("/api/patients/me/profile", { method: "PUT", body: JSON.stringify(profileData) });
            setLoading(false);
            setSuccess(
                "Your profile has been saved successfully."
            );
        } catch (err) {
            setLoading(false);
            setError(err.message);
        }
    };


    return (
        <div className="patient-profile-page">

            <div className="patient-profile-card">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="profile-heading">

                    <h1>Create Your Health Profile</h1>

                    <p>
                        Tell us about yourself and your health
                        history to personalize your Curearly experience.
                    </p>

                </div>


                {error && (
                    <div className="profile-error">
                        {error}
                    </div>
                )}


                {success && (
                    <div className="profile-success">
                        {success}
                    </div>
                )}


                <form onSubmit={handleSubmit}>


                    {/* =========================
                        BASIC INFORMATION
                    ========================= */}

                    <section className="profile-section">

                        <div className="section-heading">
                            <span>01</span>

                            <div>
                                <h2>Basic Information</h2>

                                <p>
                                    Tell us a little about yourself.
                                </p>
                            </div>
                        </div>


                        <div className="profile-grid">

                            <div className="profile-field full-width">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="profile-field">

                                <label>
                                    Age
                                </label>

                                <input
                                    type="number"
                                    name="age"
                                    min="1"
                                    max="120"
                                    placeholder="Age"
                                    value={profile.age}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="profile-field">

                                <label>
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={profile.gender}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            <div className="profile-field">

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Your city"
                                    value={profile.city}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="profile-field">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone number"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                    </section>


                    {/* =========================
                        HEALTH INFORMATION
                    ========================= */}

                    <section className="profile-section">

                        <div className="section-heading">

                            <span>02</span>

                            <div>

                                <h2>Health Information</h2>

                                <p>
                                    Basic information about your current health.
                                </p>

                            </div>

                        </div>


                        <div className="profile-grid">

                            <div className="profile-field">

                                <label>
                                    Blood Group
                                </label>

                                <select
                                    name="bloodGroup"
                                    value={profile.bloodGroup}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select blood group
                                    </option>

                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>

                                </select>

                            </div>


                            <div className="profile-field">

                                <label>
                                    Height (cm)
                                </label>

                                <input
                                    type="number"
                                    name="height"
                                    min="1"
                                    step="0.01"
                                    placeholder="e.g. 170"
                                    value={profile.height}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="profile-field">

                                <label>
                                    Weight (kg)
                                </label>

                                <input
                                    type="number"
                                    name="weight"
                                    min="1"
                                    step="0.01"
                                    placeholder="e.g. 65"
                                    value={profile.weight}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="profile-field">

                                <label>
                                    Smoking
                                </label>

                                <select
                                    name="smoking"
                                    value={profile.smoking}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="Yes">
                                        Yes
                                    </option>

                                    <option value="No">
                                        No
                                    </option>

                                </select>

                            </div>


                            <div className="profile-field">

                                <label>
                                    Alcohol Consumption
                                </label>

                                <select
                                    name="alcoholConsumption"
                                    value={profile.alcoholConsumption}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="Yes">
                                        Yes
                                    </option>

                                    <option value="No">
                                        No
                                    </option>

                                </select>

                            </div>


                            <div className="profile-field">

                                <label>
                                    Sleep Hours
                                </label>

                                <input
                                    type="number"
                                    name="sleepHours"
                                    min="0"
                                    max="24"
                                    placeholder="Hours per day"
                                    value={profile.sleepHours}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="profile-field full-width">

                                <label>
                                    Stress Level
                                </label>

                                <div className="stress-options">

                                    {[1, 2, 3, 4, 5].map((level) => (

                                        <button
                                            type="button"
                                            key={level}
                                            className={
                                                profile.stressLevel == level
                                                    ? "stress-option active"
                                                    : "stress-option"
                                            }
                                            onClick={() =>
                                                setProfile((previous) => ({
                                                    ...previous,
                                                    stressLevel: level
                                                }))
                                            }
                                        >
                                            {level}
                                        </button>

                                    ))}

                                </div>

                                <small>
                                    1 = Low &nbsp;&nbsp; 5 = High
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* =========================
                        DISEASE HISTORY
                    ========================= */}

                    <section className="profile-section">

                        <div className="section-heading">

                            <span>03</span>

                            <div>

                                <h2>Current Medical Conditions</h2>

                                <p>
                                    Add any currently diagnosed conditions.
                                </p>

                            </div>

                        </div>


                        <div className="add-item-row">

                            <input
                                type="text"
                                placeholder="e.g. Diabetes"
                                value={currentDisease}
                                onChange={(event) =>
                                    setCurrentDisease(event.target.value)
                                }
                            />

                            <button
                                type="button"
                                onClick={addDisease}
                            >
                                Add
                            </button>

                        </div>


                        <div className="item-list">

                            {diseases.map((disease, index) => (

                                <div
                                    className="item"
                                    key={index}
                                >

                                    <span>{disease}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeDisease(index)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* =========================
                        MEDICATIONS
                    ========================= */}

                    <section className="profile-section">

                        <div className="section-heading">

                            <span>04</span>

                            <div>

                                <h2>Current Medications</h2>

                                <p>
                                    Add medicines you currently take.
                                </p>

                            </div>

                        </div>


                        <div className="add-item-row">

                            <input
                                type="text"
                                placeholder="e.g. Metformin"
                                value={currentMedicine}
                                onChange={(event) =>
                                    setCurrentMedicine(event.target.value)
                                }
                            />

                            <button
                                type="button"
                                onClick={addMedication}
                            >
                                Add
                            </button>

                        </div>


                        <div className="item-list">

                            {medications.map((medicine, index) => (

                                <div
                                    className="item"
                                    key={index}
                                >

                                    <span>{medicine}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeMedication(index)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* =========================
                        ALLERGIES
                    ========================= */}

                    <section className="profile-section">

                        <div className="section-heading">

                            <span>05</span>

                            <div>

                                <h2>Allergies</h2>

                                <p>
                                    Add any known allergies.
                                </p>

                            </div>

                        </div>


                        <div className="add-item-row">

                            <input
                                type="text"
                                placeholder="e.g. Penicillin"
                                value={currentAllergy}
                                onChange={(event) =>
                                    setCurrentAllergy(event.target.value)
                                }
                            />

                            <button
                                type="button"
                                onClick={addAllergy}
                            >
                                Add
                            </button>

                        </div>


                        <div className="item-list">

                            {allergies.map((allergy, index) => (

                                <div
                                    className="item"
                                    key={index}
                                >

                                    <span>{allergy}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeAllergy(index)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* =========================
                        FAMILY HISTORY
                    ========================= */}

                    <section className="profile-section">

                        <div className="section-heading">

                            <span>06</span>

                            <div>

                                <h2>Family Medical History</h2>

                                <p>
                                    Add relevant medical conditions in your family.
                                </p>

                            </div>

                        </div>


                        <div className="family-history-row">

                            <input
                                type="text"
                                placeholder="Disease"
                                value={currentFamilyDisease}
                                onChange={(event) =>
                                    setCurrentFamilyDisease(
                                        event.target.value
                                    )
                                }
                            />

                            <input
                                type="text"
                                placeholder="Relation"
                                value={familyRelation}
                                onChange={(event) =>
                                    setFamilyRelation(
                                        event.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={addFamilyHistory}
                            >
                                Add
                            </button>

                        </div>


                        <div className="item-list">

                            {familyHistory.map((item, index) => (

                                <div
                                    className="item"
                                    key={index}
                                >

                                    <span>
                                        {item.disease} — {item.relation}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFamilyHistory(index)
                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* =========================
                        SAVE
                    ========================= */}

                    <div className="profile-submit">

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving Profile..."
                                : "Save My Health Profile"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default PatientProfile;
