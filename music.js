document.title = "Christmas Countdown (Radio)";
const audio = new Audio();

// Playlist
const songs = [
    "All I Want For Christmas Is You","Baby It's Cold Outside","Blue Christmas",
    "Carol Of The Bells","Christmas (Baby Please Come Home)","Christmas Canon",
    "Dance Of The Sugar Plum Fairy","Deck The Halls","Do You Want To Build A Snowman",
    "Feliz Navidad","Frosty The Snowman","God Rest Ye Merry Gentlemen","Hallelujah",
    "Here Comes Santa Claus","Holly Jolly Christmas","I Want A Hippopotamus For Christmas",
    "It's Beginning To Look A Lot Like Christmas","It's The Most Wonderful Time Of The Year",
    "Jingle Bell Rock","Jingle Bells","Last Christmas","Let It Snow! Let It Snow!",
    "Little Drummer Boy","Mistletoe","O Christmas Tree","Rockin Around The Christmas Tree",
    "Rudolph The Red-Nosed Reindeer","Santa Baby","Santa Claus Is Comin' To Town",
    "Silent Night","Sleigh Ride","The Christmas Song","The Nutcracker March",
    "Up On The Housetop","We Wish You A Merry Christmas","White Christmas",
    "Winter Wonderland","Wonderful Christmastime","You're A Mean One Mr.Grinch!"
];

const playlist = [];
for (let song of songs){
    playlist.push({name: song, src: `songs/Music Now, Trap Music Now, Dance Music Now - ${song} (SPOTISAVER).mp3`});
    playlist.push({name: "Speech", src: "songs/speech.mp3"});
}

// Song durations placeholder
const songDurations = playlist.map(()=>180);

// Start time
const serverStartTime = new Date("Dec 1, 2025 00:00:00 UTC").getTime();

function getCurrentSongIndexAndOffset(){
    const now = Date.now();
    const elapsed = (now-serverStartTime)/1000;
    const totalDuration = songDurations.reduce((a,b)=>a+b,0);
    let time = elapsed % totalDuration;
    for(let i=0;i<playlist.length;i++){
        if(time<songDurations[i]) return {index:i, offset:time};
        time -= songDurations[i];
    }
    return {index:0, offset:0};
}

// AudioContext for visual effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser, dataArray;

function setupAudioContext(){
    const track = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    track.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function animateEffects(){
    requestAnimationFrame(animateEffects);
    if(!analyser) return;
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a,b)=>a+b,0)/dataArray.length;
    document.querySelectorAll('.snowflake').forEach((flake,i)=>{
        flake.style.transform = `translateY(${Math.sin(Date.now()/1000 + i)*5 + avg/15}px)`;
        flake.style.opacity = 0.5 + avg/512;
    });
}

// Play synced music
function playSync(){
    const {index, offset} = getCurrentSongIndexAndOffset();
    audio.src = playlist[index].src;
    audio.currentTime = offset;
    audio.play().catch(()=>{});

    if('mediaSession' in navigator){
        navigator.mediaSession.metadata = new MediaMetadata({
            title: playlist[index].name,
            artist: 'Christmas Countdown',
            album: 'Live Radio',
            artwork: [{src:'favicon.ico', sizes:'64x64', type:'image/png'}]
        });
    }

    setTimeout(playSync, songDurations[index]-offset*1000);
}

// Start music + PiP for full page
async function startMusic(){
    if(audioCtx.state==='suspended') await audioCtx.resume();
    setupAudioContext();
    animateEffects();
    playSync();

    // Create iframe for PiP
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '800px';
    iframe.style.height = '600px';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);

    // Copy current body into iframe
    iframe.contentDocument.open();
    iframe.contentDocument.write(`<body style="margin:0; padding:0; background:transparent;">${document.body.innerHTML}</body>`);
    iframe.contentDocument.close();

    try {
        const stream = iframe.contentDocument.body.captureStream(30);
        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        await video.play();

        document.addEventListener('keydown', async (event)=>{
            if(event.ctrlKey && event.shiftKey && event.key.toLowerCase()==='p'){
                event.preventDefault();
                try{
                    if(!document.pictureInPictureElement){
                        await video.requestPictureInPicture();
                    }else{
                        await document.exitPictureInPicture();
                    }
                }catch(err){
                    console.error('PiP failed:', err);
                }
            }
        });
    } catch(err){
        console.error('PiP setup failed:', err);
    }
}
