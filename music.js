document.title = "Christmas Countdown (Radio)";

const audio = new Audio();

// === Playlist + speech track ===
const songs = [
    "All I Want For Christmas Is You",
    "Baby It's Cold Outside",
    "Blue Christmas",
    "Carol Of The Bells",
    "Christmas (Baby Please Come Home)",
    "Christmas Canon",
    "Dance Of The Sugar Plum Fairy",
    "Deck The Halls",
    "Do You Want To Build A Snowman",
    "Feliz Navidad",
    "Frosty The Snowman",
    "God Rest Ye Merry Gentlemen",
    "Hallelujah",
    "Here Comes Santa Claus",
    "Holly Jolly Christmas",
    "I Want A Hippopotamus For Christmas",
    "It's Beginning To Look A Lot Like Christmas",
    "It's The Most Wonderful Time Of The Year",
    "Jingle Bell Rock",
    "Jingle Bells",
    "Last Christmas",
    "Let It Snow! Let It Snow!",
    "Little Drummer Boy",
    "Mistletoe",
    "O Christmas Tree",
    "Rockin Around The Christmas Tree",
    "Rudolph The Red-Nosed Reindeer",
    "Santa Baby",
    "Santa Claus Is Comin' To Town",
    "Silent Night",
    "Sleigh Ride",
    "The Christmas Song",
    "The Nutcracker March",
    "Up On The Housetop",
    "We Wish You A Merry Christmas",
    "White Christmas",
    "Winter Wonderland",
    "Wonderful Christmastime",
    "You're A Mean One Mr.Grinch!"
];

const playlist = [];
for (let song of songs) {
    playlist.push({ name: song, src: `songs/Music Now, Trap Music Now, Dance Music Now - ${song} (SPOTISAVER).mp3` });
    playlist.push({ name: "Speech", src: "speech.mp3" });
}

// Placeholder durations (seconds) – replace with actual track lengths
const songDurations = playlist.map(() => 180);

// === Live radio start Dec 1, 2025 ===
const serverStartTime = new Date("Dec 1, 2025 00:00:00 UTC").getTime();

function getCurrentSongIndexAndOffset() {
    const now = Date.now();
    const elapsed = (now - serverStartTime) / 1000;
    const totalDuration = songDurations.reduce((a,b) => a+b, 0);
    let time = elapsed % totalDuration;

    for (let i = 0; i < playlist.length; i++) {
        if (time < songDurations[i]) return { index: i, offset: time };
        time -= songDurations[i];
    }

    return { index: 0, offset: 0 };
}

// Play sync function
function playSync() {
    const { index, offset } = getCurrentSongIndexAndOffset();
    audio.src = playlist[index].src;
    audio.currentTime = offset;
    audio.play().catch(() => {}); // ignore autoplay errors

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: playlist[index].name,
            artist: 'Christmas Countdown',
            album: 'Live Radio',
            artwork: [{ src: 'favicon.ico', sizes: '64x64', type: 'image/png' }]
        });
    }

    const remaining = songDurations[index] - offset;
    setTimeout(playSync, remaining * 1000);
}

// Start audio + PiP after user click (required by browsers)
document.body.addEventListener('click', async () => {
    playSync();

    try {
        const stream = audio.captureStream();
        const track = stream.getAudioTracks()[0];
        const video = document.createElement('video');
        video.srcObject = new MediaStream([track]);
        video.muted = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        await video.play();
        await video.requestPictureInPicture();

        setInterval(() => {
            const { index } = getCurrentSongIndexAndOffset();
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata.title = playlist[index].name;
            }
        }, 1000);
    } catch (err) {
        console.error('PiP setup failed:', err);
    }
}, { once: true });
