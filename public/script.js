document.addEventListener("DOMContentLoaded", async () => {
  const categoryContainer = document.querySelector(".card-container"); 
  const songList = document.querySelector(".song-list ul"); 
  const songInfo = document.querySelector(".song-info"); 
  const playBtn = document.getElementById("play");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("previous");
  const volumeControl = document.getElementById("volume");
  const volumeImg = document.getElementById("volume-img");
  const seekBar = document.querySelector(".seekbar");
  const seekCircle = document.querySelector(".circle");

  let audio = new Audio();
  let songs = [];
  let currentSongIndex = 0;

  const fetchCategories = async () => {
    try {
      const response = await fetch("/songs");
      const data = await response.json();
      return Object.keys(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  // Fetch songs from a specific category
  const fetchSongs = async (category) => {
    try {
      const response = await fetch("/songs");
      const data = await response.json();
      return data[category] || [];
    } catch (error) {
      console.error(`Error fetching songs for ${category}:`, error);
      return [];
    }
  };

  // Load categories as cards
  const loadCategories = async () => {
    const categories = await fetchCategories();
    categoryContainer.innerHTML = ""; // Clear previous categories

    categories.forEach((category) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.folder = category;
      card.innerHTML = `
                <img src="songs/${category.toLowerCase()}/cover.jpg" alt="${category}" class="thumbnail">
                <img class="thumbnail-play-btn" src="svg/playlistplay.svg" alt="play-btn">
                <h2><label>${category}</label></h2>
                <p><label>Listen to the best ${category} tracks!</label></p>
            `;
      card.addEventListener("click", () => loadSongs(category));
      categoryContainer.appendChild(card);
    });

    // Load "NoMusic" category by default
    if (categories.includes("NoMusic")) {
      loadSongs("NoMusic");
    }
  };

  // Load songs into the left sidebar
  const loadSongs = async (category) => {
    songs = await fetchSongs(category);
    songList.innerHTML = ""; // Clear previous songs

    songs.forEach((song, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<img src="svg/music.svg" class="invert" alt="">
                                        <div class="song">
                                            <div>${song.name}</div>
                                        </div>
                                        <img src="svg/play.svg" class="invert play-btn" alt="">
`;
      li.addEventListener("click", () => playSong(index));
      songList.appendChild(li);
    });

    // Auto-play first song if available
    if (songs.length > 0) {
      playSong(0);
    }
  };

  // Play a song
  const playSong = (index) => {
    if (songs.length === 0) return;

    currentSongIndex = index;
    audio.src = songs[currentSongIndex].url;
    songInfo.textContent = songs[currentSongIndex].name;
    audio.play();
    updatePlayButton();
  };

  // Update play/pause button
  const updatePlayButton = () => {
    playBtn.src = audio.paused ? "svg/play.svg" : "svg/pause.svg";
  };

  // Next song
  nextBtn.addEventListener("click", () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
  });

  // Previous song
  prevBtn.addEventListener("click", () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
  });

  // Play/Pause button
  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    updatePlayButton();
  });

  // Update seek bar
  audio.addEventListener("timeupdate", () => {
    let percentage = (audio.currentTime / audio.duration) * 100;
    seekCircle.style.left = `${percentage}%`;
  });

  // Seek bar click event
  seekBar.addEventListener("click", (event) => {
    let percent = event.offsetX / seekBar.clientWidth;
    audio.currentTime = percent * audio.duration;
  });

  // Volume control
  volumeControl.addEventListener("input", (e) => {
    audio.volume = e.target.value / 100;
    volumeImg.src = audio.volume === 0 ? "svg/mute.svg" : "svg/volume.svg";
  });

  // Mute button
  volumeImg.addEventListener("click", () => {
    if (audio.volume === 0) {
      audio.volume = 0.5;
      volumeControl.value = 50;
      volumeImg.src = "svg/volume.svg";
    } else {
      audio.volume = 0;
      volumeControl.value = 0;
      volumeImg.src = "svg/mute.svg";
    }
  });

  // Load categories on page load
  loadCategories();
});
