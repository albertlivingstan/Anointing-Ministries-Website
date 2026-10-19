export type Song = {
    id: string;
    title: string;
    artist: string;
    category: string;
    language: string;
    duration: string;
    lyrics: string;
    src?: string;
    image: string;
};

export const initialSongs: Song[] = [
    { 
        id: 'oyvunaal', 
        title: 'Oyvunaal Aaradhanai — Sabbath Worship', 
        artist: 'Sister Latha Samson · Anointing Ministries', 
        category: 'Worship', 
        language: 'Tamil Worship', 
        duration: '6:15', 
        lyrics: 'ஓய்வுநாள் ஆராதனை\nதேவ சம சமூகத்தில்...\nகர்த்தர் நம் நடுவில் இருக்கின்றார்\nஅவர் கிருபை என்றென்றும் உள்ளதே.', 
        image: 'church-worship' 
    },
    { 
        id: 'thiralaai', 
        title: 'Thiralaai Perugappannuven', 
        artist: 'Rev. Dr. Samson Edward · Ps. David Samson', 
        category: 'Praise', 
        language: 'Tamil Worship', 
        duration: '5:40', 
        lyrics: 'திரளாய் பெருக்குவேன்\nஉன் எல்லைகளை விரிவுபடுத்துவேன்\nகர்த்தர் வாக்கு மாறாதவர்\nநமக்காய் பெரிய காரியங்களைச் செய்வார்.', 
        image: 'service-september' 
    },
    { 
        id: 'devanaalae', 
        title: 'Devanaalae Ellam Kudum', 
        artist: 'Pastor David Samson · Anointing Ministries', 
        category: 'Thanksgiving', 
        language: 'Tamil Worship', 
        duration: '4:50', 
        lyrics: 'தேவனால் கூடும் எல்லாம் கூடும்\nநம்புகிறவனுக்கு ஒன்றுமில்லை குறைவு\nகர்த்தர் தாமே நம்மை நடத்துவார்\nஅவர் நாமம் என்றென்றும் துதிக்கப்படுவது.', 
        image: 'worship-song' 
    },
    { 
        id: 'nandri-ayya', 
        title: 'Nandri Ayya Nandri Ayya', 
        artist: 'Pastor David Samson · Anointing Ministries', 
        category: 'Thanksgiving', 
        language: 'Tamil Worship', 
        duration: '4:50', 
        lyrics: 'நன்றி ஐயா நன்றி ஐயா\nநீர் செய்த நன்மைகளுக்காய்\nகோடான கோடி நன்றி ஐயா\nஎன் வாழ்வில் செய்த கிருபைக் காய்', 
        image: 'church-worship' 
    },
    { 
        id: 'ummai-allamal', 
        title: 'Ummai Allamal Enakku', 
        artist: 'Anointing Ministries Worship', 
        category: 'Worship', 
        language: 'Tamil Worship', 
        duration: '5:20', 
        lyrics: 'உம்மை அல்லாமல் எனக்கு யாருண்டு\nஇந்த பூமியில் இன்பம் தருபவர் நீரே\nஎன் பலனும் என் துணையுமானவரே\nஎன்றென்றும் உம்மைத் தொழுதிடுவேன்', 
        image: 'worship-song' 
    },
    { 
        id: 'naan-nambum', 
        title: 'Naan Nambum Ayya', 
        artist: 'Pastor David Samson', 
        category: 'Prayer', 
        language: 'Tamil Worship', 
        duration: '4:15', 
        lyrics: 'நான் நம்பும் ஐயா நீரே என் கோட்டை\nஆபத்து நாளும் உந்தன் சமூகம் அடைக்கலம்\nகலங்க மாட்டேன் நான் பயப்பட மாட்டேன்\nஎன் தேவன் என்னோடு இருக்கின்றார்', 
        image: 'community' 
    },
    { 
        id: 'great-faithfulness', 
        title: 'Great Is Thy Faithfulness', 
        artist: 'Anointing Ministries English Worship', 
        category: 'Praise', 
        language: 'English Worship', 
        duration: '4:00', 
        lyrics: 'Great is thy faithfulness, O God my father,\nThere is no shadow of turning with thee;\nThou changest not, thy compassions, they fail not;\nAs thou hast been thou forever wilt be.', 
        image: 'church' 
    },
    { 
        id: 'ennai-nadathum', 
        title: 'Ennai Nadathum Devare', 
        artist: 'Pastor David Samson · Anointing Ministries', 
        category: 'Guidance', 
        language: 'Tamil Worship', 
        duration: '4:40', 
        lyrics: 'என்னை நடத்தும் தேவனே\nஎன் பாதம் காக்கும் கர்த்தரே\nஉம் வழியில் நான் நடந்து செல்ல\nஉம் கிருபை எனக்குத் தாரும்', 
        image: 'service-september' 
    }
];

export const verses = [
    ['The Lord is my shepherd; I shall not want.', 'Psalm 23:1'], 
    ['Be still, and know that I am God.', 'Psalm 46:10'], 
    ['We love him, because he first loved us.', '1 John 4:19'], 
    ['For we walk by faith, not by sight.', '2 Corinthians 5:7']
];

export const sermons = [
    { id: 'tKIroxrTbG8', title: 'Sunday Worship Service & Sabbath Praise', topic: 'Worship', scripture: 'Psalm 95', reference: 'Madukkarai Sanctuary', image: 'church-worship' },
    { id: 'A0uaaxF8JnY', title: 'Thiralaai Perugappannuven Message', topic: 'Faith', scripture: 'Isaiah 54', reference: 'Pastor David Samson', image: 'service-september' },
    { id: 'eMzbt_ugXj4', title: 'Church Anniversary Special Service', topic: 'Fellowship', scripture: 'Acts 2', reference: 'Special Anniversary', image: 'christmas-community' },
    { id: 'DVwT2-LpUkY', title: 'Karthar Nam Naduvil Aaseerwathangal', topic: 'Blessing', scripture: 'Joel 2', reference: 'Rev. Dr. Samson Edward', image: 'service-february' },
    { id: '0bu_0bjvoNE', title: 'Devanaalae Ellam Kudum', topic: 'Promise', scripture: 'Luke 1:37', reference: 'Pastor David Samson', image: 'worship-song' }
];

export const eventNames = ['Sunday worship', 'Youth fellowship', 'Bible study', 'Worship night', 'Special prayer meeting', 'Christmas celebration', 'Easter service'];
