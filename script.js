let globalAccessToken = "";

async function refreshToken() {
    const clientId = "1826b44bc6e545b099b45532a892815b";
    const clientSecret = "42531bceb4d94dab9d40d04b2cc90d30";
    const refreshToken = "AQCnGsOZBzITLRmuwkwF2r8AsukA7W9TA0KYRRS3xDy3CQ9AlRBBLSrXMYqlgekIlLisdxCqlHdx6vH5ZjH2TDlh3AkNiN-q--tObUqM-HCaJOlnQ94jj76zP21EX-IZQCU";
    const base64Credentials = btoa(`${clientId}:${clientSecret}`);
    
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": "Basic " + base64Credentials,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                "grant_type": "refresh_token",
                "refresh_token": refreshToken
            })
        });

        if (response.ok) {
            const data = await response.json();
            globalAccessToken = data.access_token;
            return globalAccessToken;
        } else {
            console.error("Error refreshing token:", response.statusText);
            return -1;
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


// Function to update the Spotify track
function updateSong(songID) {
    let iframe = document.getElementById("spotify-embed");
    iframe.src = "https://open.spotify.com/embed/track/" + songID + "?utm_source=generator";
}

function changeNeeded(newSong) {
    let currentSong = document.getElementById("spotify-embed").src;
    // Dissecting URL to obtain song ID
    let song = currentSong.substring(0, currentSong.length - 21);
    song = song.substring(song.length - 22);
    return song !== newSong;
}

// Function to fetch currently playing track from Spotify API
function getCurrentSong() {
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
            "Authorization": "Bearer " + globalAccessToken
        }
    })
    .then(response => response.json())
    .then(data => {
        // If song is currently playing
        if (data.is_playing) {
            // Checks if song returned is the same as song playing
            if (changeNeeded(data.item.id)) {
                updateSong(data.item.id);
            }
            // Changing text to match status
            let text = document.getElementById("current-text");
            if (text.textContent !== "I'm currently listening to...") {
                text.textContent = "I'm currently listening to...";
            }

        } else {
            // Checks if song returned is the same as last played song
            if (changeNeeded(data.item.id)) {
                updateSong(data.item.id);
            }
            // Changing text to match status
            let text = document.getElementById("current-text");
            text.textContent = "I'm not listening to anything right now. Last played track..."
        }
    })
    .catch(error => {
        console.error("Error fetching currently playing track:", error);
        // Currently playing returns empty response, get lasted played song from history
        lastPlayedSong();
        let text = document.getElementById("current-text");
        text.textContent = "I'm not listening to anything right now. Last played track..."
    });
}

// Function to get the last played song from recently played history
function lastPlayedSong() {
    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
        headers: {
            "Authorization": "Bearer " + globalAccessToken
        }
    })
    .then(response => response.json())
    .then(data => {
        song = data.items[0].track.id;
        if (changeNeeded(song)) {
            updateSong(song);
        }
    })
    .catch(error => {
        console.error("Error fetching recently played tracks:", error);
    })
}

// Checks if user scrolled past landing page to display navigation bar
function scrollCheck() {
    if (!document.getElementById("nav") || !document.getElementById("top")) {
        return;
    }
    // If user scrolled past landing page set visibility for navigation bar and back-to-top button 
    if (document.body.scrollTop > 700 || document.documentElement.scrollTop > 700) {
        document.getElementById("nav").style.top = "0";
        document.getElementById("top").classList.remove("hiddenBar");
        document.getElementById("top").classList.add("showBar");
    } else {
        document.getElementById("nav").style.top = "-100px";
        document.getElementById("top").classList.remove("showBar");
        document.getElementById("top").classList.add("hiddenBar");
    }
}

// Function to scroll to a different section on the page
function jumpTo(id) {
    document.getElementById(id).scrollIntoView();
}

// Calls scrollCheck() everytime user scrolls
window.onscroll = function() {
    scrollCheck();
};

// Initial function calls
refreshToken();
getCurrentSong();

// Set interval to periodically update the track 
setInterval(getCurrentSong, 2500); // 2.5 seconds
// Refresh access token every 50 minutes
setInterval(refreshToken, 3e+6)

// Sets visibility for text as user scrolls down
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry);
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
});

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((element) => observer.observe(element));