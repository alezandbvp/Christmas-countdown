// Fixed site title
document.title = "Christmas Countdown (Radio)";

// Audio element
const audio = new Audio();
audio.autoplay = true;

// Playlist
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

// Build playlist with speech track between songs
const playlist = [];
for (let song of songs) {
    playlist.push({ name: song, src: `songs/Music Now, Trap Music Now, Dance Music Now - ${song} (SPOTISAVER).mp3` });
    playlist.push({ name: "Speech", src: "speech.mp3" });
}

let currentIndex = 0;

// Play song and update MediaSession
function playSong(song) {
    audio.src = song.src;
    audio.play();

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: 'Christmas Countdown',
            album: 'Live Radio',
            artwork: [{ src: 'favicon.ico', sizes: '64x64', type: 'image/png' }]
        });
    }
}

// Auto-next song
audio.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[currentIndex]);
});

// Start first song
playSong(playlist[currentIndex]);

// Picture-in-Picture setup
async function setupPiP() {
    try {
        const stream = audio.captureStream();
        const track = stream.getAudioTracks()[0];

        const video = document.createElement('video');
        video.srcObject = new MediaStream([track]);
        video.muted = true;
        await video.play();
        await video.requestPictureInPicture();
    } catch (err) {
        console.error('PiP setup failed:', err);
    }
}

// Optional: auto-start PiP
// setupPiP();
