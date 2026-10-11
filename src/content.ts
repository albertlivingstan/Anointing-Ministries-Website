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
export const initialSongs: Song[] = [{ id: 'grace', title: 'Amazing Grace', artist: 'John Newton · public-domain text', category: 'Worship', language: 'English Worship', duration: '—', lyrics: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.', image: 'church' }, { id: 'holy', title: 'Holy, Holy, Holy', artist: 'Reginald Heber · public-domain text', category: 'Praise', language: 'English Worship', duration: '—', lyrics: 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy, merciful and mighty!\nGod in three Persons, blessed Trinity!', image: 'community' }, { id: 'doxology', title: 'Doxology', artist: 'Thomas Ken · public-domain text', category: 'Thanksgiving', language: 'English Worship', duration: '—', lyrics: 'Praise God, from whom all blessings flow;\nPraise Him, all creatures here below;\nPraise Him above, ye heavenly host;\nPraise Father, Son, and Holy Ghost.', image: 'church' }];
export const verses = [['The Lord is my shepherd; I shall not want.', 'Psalm 23:1'], ['Be still, and know that I am God.', 'Psalm 46:10'], ['We love him, because he first loved us.', '1 John 4:19'], ['For we walk by faith, not by sight.', '2 Corinthians 5:7']];
export const sermons = [{ id: 'walking-by-faith', title: 'Walking by faith, not by sight', topic: 'Faith', scripture: '2 Corinthians', reference: '2 Corinthians 5:7', image: 'church' }, { id: 'power-of-prayer', title: 'The quiet power of prayer', topic: 'Prayer', scripture: 'Philippians', reference: 'Philippians 4:6–7', image: 'community' }, { id: 'finding-peace', title: 'Finding peace in His presence', topic: 'Peace', scripture: 'John', reference: 'John 14:27', image: 'church' }, { id: 'purpose', title: 'A life filled with purpose', topic: 'Purpose', scripture: 'Ephesians', reference: 'Ephesians 2:10', image: 'community' }, { id: 'gods-timing', title: 'Trusting God’s timing', topic: 'Trust', scripture: 'Ecclesiastes', reference: 'Ecclesiastes 3:1', image: 'church' }];
export const eventNames = ['Sunday worship', 'Youth fellowship', 'Bible study', 'Worship night', 'Special prayer meeting', 'Christmas celebration', 'Easter service'];
