document.title = "Christmas Countdown (Radio)";
const audio = new Audio();

// Playlist + speech
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
for (let song of songs){
    playlist.push({
        name: song,
        src: `songs/Music Now, Trap Music Now, Dance Music Now - ${song} (SPOTISAVER).mp3`
    });
    playlist.push({name:"Speech", src:"songs/speech.mp3"});
}

// Placeholder durations (seconds)
const songDurations = playlist.map(()=>180);

// Live radio start: Dec 1, 2025
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

// AudioContext for effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser;
let dataArray;

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

// Play synchronized music
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

    const remaining = songDurations[index]-offset;
    setTimeout(playSync, remaining*1000);
}

// Start music + canvas PiP
async function startMusic(){
    if(audioCtx.state==='suspended') await audioCtx.resume();
    setupAudioContext();
    animateEffects();
    playSync();

    // Canvas PiP
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 800, height = 600;
    canvas.width = width;
    canvas.height = height;
    canvas.style.display='none';
    document.body.appendChild(canvas);

    const video = document.createElement('video');
    video.srcObject = canvas.captureStream(30);
    video.muted = true;
    await video.play();

    function renderCanvas(){
        ctx.clearRect(0,0,width,height);

        // Background
        const bg = new Image();
        bg.src = 'christmas-background.jpg';
        ctx.drawImage(bg, 0, 0, width, height);

        // Title and countdown
        ctx.font = '80px ChristmasFont, cursive';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 20;
        ctx.fillText('Christmas', width/2, 150);
        ctx.fillText('Countdown', width/2, 250);

        ctx.font = '80px ChristmasFont, cursive';
        ctx.shadowColor = 'green';
        ctx.shadowBlur = 15;
        ctx.fillText(countdownEl.textContent, width/2, 350);

        // Snowflakes
        document.querySelectorAll('.snowflake').forEach((flake)=>{
            const x = parseFloat(flake.style.left) || Math.random()*width;
            const y = parseFloat(flake.style.top) || Math.random()*height;
            ctx.font = flake.style.fontSize || '20px';
            ctx.fillStyle = 'white';
            ctx.fillText('❄', x, y);
        });

        requestAnimationFrame(renderCanvas);
    }
    renderCanvas();

    // Ctrl+Shift+P to toggle PiP
    document.addEventListener('keydown', async (event) => {
        if(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p'){
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
}
