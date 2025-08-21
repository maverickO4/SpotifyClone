function check() {
  document.title = "Spotify Clone";
  console.log(`${document.title} is live!`);
}
check();


let currentSong = new Audio();
let currFolder;


function formatTime(seconds) {
  let mins = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  // Add leading zeros
  mins = String(mins).padStart(2, "0");
  secs = String(secs).padStart(2, "0");
  return `${mins}:${secs}`;
}


async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }
  //Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = " ";
  for (const song of songs) {
    let displayName = decodeURIComponent(song) // %20 → space
      .replace(".mp3", "") // remove extension
      .trim(); // remove extra spaces
    songUL.innerHTML += `<li data-file="${song}">
      <img class="invert" src="SVGs/music.svg" alt="">
      <div class="info">
        <div>${displayName}</div>
        <div>Rick</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="SVGs/play.svg" alt="">
      </div>
    </li>`;
  }
  //Attach an event-listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.getAttribute("data-file"));
    });
  });
  return songs;
}


const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "SVGs/pause.svg";
  }
  let displayName = decodeURIComponent(track).replace(".mp3", "");
  document.querySelector(".songinfo").innerHTML = displayName;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
  const res = await fetch(`http://127.0.0.1:3000/SpotifyClone/songs/`); // e.g., "songs/KishoreKumar/"
  const html = await res.text();
  const div = document.createElement("div");
  div.innerHTML = html;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //Get the metadata of the folder
      let a = await fetch(
        `http://127.0.0.1:3000/SpotifyClone/songs/${folder}/info.json`
      );
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `            <div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="56"
                  height="56"
                  fill="none"
                  role="img"
                >
                  <path
                    d="M7.5241 19.0621C6.85783 19.4721 6 18.9928 6 18.2104V5.78956C6 5.00724 6.85783 4.52789 7.5241 4.93791L17.6161 11.1483C18.2506 11.5388 18.2506 12.4612 17.6161 12.8517L7.5241 19.0621Z"
                    stroke="#000000"
                    stroke-width="3"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img
                src="/SpotifyClone/songs/${folder}/cover.jpg"
                alt="Not Available"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }
  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      if (songs.length > 0) {
        playMusic(songs[0]);
      }
    });
  });
}


async function main() {
  await getSongs("songs/KishoreKumar");
  playMusic(songs[0], true);
  //Display all the albums on the page
  displayAlbums();
  //Attach and event listener to play, next & previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "SVGs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "SVGs/play.svg";
    }
  });
  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  //Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  //Add an event listener to previous and next
  previous.addEventListener("click", () => {
    console.log(`Previous clicked`);
    console.log(currentSong);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    console.log(`Next clicked`);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(`Setting volume to ${e.target.value}/100`);
      currentSong.volume = parseInt(e.target.value) / 100;
    });
  //Add event listener to mute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("SVGs/volume.svg")) {
      e.target.src = e.target.src.replace("SVGs/volume.svg", "SVGs/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else {
      e.target.src = e.target.src.replace("SVGs/mute.svg", "SVGs/volume.svg");
      currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
    }
  });
}


main();
