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
    { id: 'grace', title: 'Amazing Grace', artist: 'John Newton · public-domain text', category: 'Worship', language: 'English Worship', duration: '3:45', lyrics: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.', image: 'church' },
    { id: 'holy', title: 'Holy, Holy, Holy', artist: 'Reginald Heber · public-domain text', category: 'Praise', language: 'English Worship', duration: '4:10', lyrics: 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy, merciful and mighty!\nGod in three Persons, blessed Trinity!', image: 'community' },
    { id: 'doxology', title: 'Doxology', artist: 'Thomas Ken · public-domain text', category: 'Thanksgiving', language: 'English Worship', duration: '2:30', lyrics: 'Praise God, from whom all blessings flow;\nPraise Him, all creatures here below;\nPraise Him above, ye heavenly host;\nPraise Father, Son, and Holy Ghost.', image: 'church' },
    { id: 'nandri-ayya', title: 'Nandri Ayya Nandri Ayya', artist: 'Anointing Ministries Worship', category: 'Thanksgiving', language: 'Tamil Worship', duration: '4:50', lyrics: 'நன்றி ஐயா நன்றி ஐயா\nநீர் செய்த நன்மைகளுக்காய்\nகோடான கோடி நன்றி ஐயா\nஎன் வாழ்வில் செய்த கிருபைக் காய்', image: 'church-worship' },
    { id: 'ummai-allamal', title: 'Ummai Allamal Enakku', artist: 'Tamil Christian Hymn', category: 'Worship', language: 'Tamil Worship', duration: '5:20', lyrics: 'உம்மை அல்லாமல் எனக்கு யாருண்டு\nஇந்த பூமியில் இன்பம் தருபவர் நீரே\nஎன் பலனும் என் துணையுமானவரே\nஎன்றென்றும் உம்மைத் தொழுதிடுவேன்', image: 'worship-song' },
    { id: 'naan-nambum', title: 'Naan Nambum Ayya', artist: 'Worship Collection', category: 'Prayer', language: 'Tamil Worship', duration: '4:15', lyrics: 'நான் நம்பும் ஐயா நீரே என் கோட்டை\nஆபத்து நாளும் உந்தன் சமூகம் அடைக்கலம்\nகலங்க மாட்டேன் நான் பயப்பட மாட்டேன்\nஎன் தேவன் என்னோடு இருக்கின்றார்', image: 'community' },
    { id: 'great-faithfulness', title: 'Great Is Thy Faithfulness', artist: 'Thomas Chisholm · Public Domain', category: 'Praise', language: 'English Worship', duration: '4:00', lyrics: 'Great is thy faithfulness, O God my father,\nThere is no shadow of turning with thee;\nThou changest not, thy compassions, they fail not;\nAs thou hast been thou forever wilt be.', image: 'church' },
    { id: 'ennai-nadathum', title: 'Ennai Nadathum Devare', artist: 'Anointing Ministries', category: 'Guidance', language: 'Tamil Worship', duration: '4:40', lyrics: 'என்னை நடத்தும் தேவனே\nஎன் பாதம் காக்கும் கர்த்தரே\nஉம் வழியில் நான் நடந்து செல்ல\nஉம் கிருபை எனக்குத் தாரும்', image: 'service-september' }
];
export const verses = [['The Lord is my shepherd; I shall not want.', 'Psalm 23:1'], ['Be still, and know that I am God.', 'Psalm 46:10'], ['We love him, because he first loved us.', '1 John 4:19'], ['For we walk by faith, not by sight.', '2 Corinthians 5:7']];
export const sermons = [{ id: 'walking-by-faith', title: 'Walking by faith, not by sight', topic: 'Faith', scripture: '2 Corinthians', reference: '2 Corinthians 5:7', image: 'church' }, { id: 'power-of-prayer', title: 'The quiet power of prayer', topic: 'Prayer', scripture: 'Philippians', reference: 'Philippians 4:6–7', image: 'community' }, { id: 'finding-peace', title: 'Finding peace in His presence', topic: 'Peace', scripture: 'John', reference: 'John 14:27', image: 'church' }, { id: 'purpose', title: 'A life filled with purpose', topic: 'Purpose', scripture: 'Ephesians', reference: 'Ephesians 2:10', image: 'community' }, { id: 'gods-timing', title: 'Trusting God’s timing', topic: 'Trust', scripture: 'Ecclesiastes', reference: 'Ecclesiastes 3:1', image: 'church' }];
export const eventNames = ['Sunday worship', 'Youth fellowship', 'Bible study', 'Worship night', 'Special prayer meeting', 'Christmas celebration', 'Easter service'];
