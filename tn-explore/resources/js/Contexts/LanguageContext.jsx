import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        brand: 'TN EXPLORE',
        tagline: 'Tamil Nadu Smart Tourism Platform',
        home: 'Home',
        explore: 'Districts',
        trip_builder: 'Trip Route Builder',
        ai_guide: 'TN Mitra AI',
        custom_trips: 'Custom Trips',
        trip_mates: 'Trip Mates',
        vendor_portal: 'Vendor Hub',
        admin_portal: 'Admin Center',
        login: 'Sign In',
        register: 'Get Started',
        search_placeholder: 'Search 38 Tamil Nadu districts, temples, hill stations, waterfalls...',
        hero_title: 'Experience the Timeless Soul of Tamil Nadu',
        hero_subtitle: 'From towering thousand-year-old temple gopurams to misty Nilgiri tea hills and tranquil coastal shores — plan custom journeys with verified local guides and operators.',
        plan_custom_trip: 'Plan Your Custom Trip',
        ask_ai_guide: 'Ask TN Mitra AI',
        verified_badge_text: 'Verified Local Vendors • KYC + AI Checked',
        best_season: 'Best Season',
        top_places: 'Top Attractions',
        view_district: 'Explore District',
        featured_vendors: 'Certified Local Tour Operators & Guides',
        trust_score: 'Trust Score',
        book_now: 'Book Tour',
        all_districts: 'All Districts',
        south_tn: 'South Tamil Nadu',
        north_tn: 'North & Chennai',
        west_tn: 'Western Ghats & Kongu',
        central_tn: 'Chola Heartlands',
        coastal_tn: 'Coastal Circuit',
    },
    ta: {
        brand: 'தமிழ்நாடு சுற்றுலா',
        tagline: 'தமிழ்நாடு ஸ்மார்ட் சுற்றுலா தளம்',
        home: 'முகப்பு',
        explore: 'மாவட்டங்கள்',
        trip_builder: 'சுற்றுலா திட்டமிடுபவர்',
        ai_guide: 'டிஎன் மித்ரா AI',
        custom_trips: 'விருப்பப் பயணங்கள்',
        trip_mates: 'பயண நண்பர்கள்',
        vendor_portal: 'வணிகர் தளம்',
        admin_portal: 'நிர்வாக மையம்',
        login: 'உள்நுழைக',
        register: 'தொடங்குக',
        search_placeholder: '38 மாவட்டங்கள், கோயில்கள், மலைவாசஸ்தலங்கள் தேடுக...',
        hero_title: 'தமிழ்நாட்டின் பாரம்பரிய அழகை கொண்டாடுங்கள்',
        hero_subtitle: 'ஆயிரமாண்டு பழமையான கோபுரங்கள் முதல் மூடுபனி படர்ந்த நீலகிரி தேயிலைத் தோட்டங்கள் வரை — சரிபார்க்கப்பட்ட உள்ளூர் வழிகாட்டிகளுடன் பயணங்களை திட்டமிடுங்கள்.',
        plan_custom_trip: 'பயணத்தைத் தொடங்குங்கள்',
        ask_ai_guide: 'மித்ரா AI-யிடம் கேளுங்கள்',
        verified_badge_text: 'சரிபார்க்கப்பட்ட வணிகர்கள் • KYC + AI ஆய்வு',
        best_season: 'சிறந்த பருவம்',
        top_places: 'முக்கிய இடங்கள்',
        view_district: 'மாவட்டத்தை காண்க',
        featured_vendors: 'அங்கீகரிக்கப்பட்ட உள்ளூர் வழிகாட்டிகள்',
        trust_score: 'நம்பகத்தன்மை குறியீடு',
        book_now: 'முன்பதிவு செய்க',
        all_districts: 'அனைத்து மாவட்டங்கள்',
        south_tn: 'தென் தமிழ்நாடு',
        north_tn: 'சென்னை & வட தமிழ்நாடு',
        west_tn: 'மேற்கு தொடர்ச்சி & கொங்கு',
        central_tn: 'சோழ நாடு',
        coastal_tn: 'கடற்கரை மண்டலம்',
    }
};

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('tn_lang') || 'en';
        }
        return 'en';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('tn_lang', lang);
        }
    }, [lang]);

    const toggleLang = () => {
        setLang((prev) => (prev === 'en' ? 'ta' : 'en'));
    };

    const t = (key) => {
        return translations[lang]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        return {
            lang: 'en',
            setLang: () => {},
            toggleLang: () => {},
            t: (key) => translations['en']?.[key] || key,
        };
    }
    return context;
}
