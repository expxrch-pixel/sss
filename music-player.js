/**
 * OTF — onythefamily | Floating Ambient Music Player
 * Plays background clan ambiance with rotating OTF vinyl disc, auto-play, and audio visualizer.
 */

(() => {
  'use strict';

  let audioEl = null;
  let isPlaying = false;
  let currentTrackIndex = 0;
  let tracks = [];

  function loadTracks() {
    if (window.OTF_DATA && typeof window.OTF_DATA.getTracks === 'function') {
      tracks = window.OTF_DATA.getTracks();
    }
    if (!tracks || tracks.length === 0) {
      tracks = [
        {
          title: "OTF Anthem — Midnight Ambience",
          artist: "onythefamily Beats",
          url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=trap-future-bass-royalty-free-music-113540.mp3"
        },
        {
          title: "Loyalty & Honor — Drill Beat",
          artist: "Dark Street Chill",
          url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=hip-hop-rock-beats-118000.mp3"
        }
      ];
    }
  }

  function initPlayer() {
    loadTracks();

    // Prevent duplicate player if already initialized
    if (document.getElementById('otfMusicPlayer')) return;

    // Create Audio Element
    audioEl = new Audio();
    audioEl.preload = "auto";
    audioEl.volume = 0.40;
    audioEl.loop = false;

    async function setAudioSource(track) {
      if (!track) return;
      if (track.isLocal && track.id && window.OTF_DATA && typeof window.OTF_DATA.getLocalAudioUrl === 'function') {
        const localBlobUrl = await window.OTF_DATA.getLocalAudioUrl(track.id);
        if (localBlobUrl) {
          audioEl.src = localBlobUrl;
          return;
        }
      }
      audioEl.src = track.url;
    }

    setAudioSource(tracks[currentTrackIndex]);

    // Create Floating Widget Container
    const playerWidget = document.createElement('div');
    playerWidget.className = 'otf-music-player';
    playerWidget.id = 'otfMusicPlayer';
    playerWidget.innerHTML = `
      <div class="player-disc-wrap" id="playerPlayBtn" role="button" tabindex="0" title="กดเพื่อเล่น/หยุดเพลง (โลโก้ OTF จะหมุน)">
        <div class="player-disc" id="playerDisc">
          <img class="player-disc-img" src="otf-logo.png" alt="OTF Disc">
          <div class="player-disc-center"></div>
        </div>
        <div class="player-disc-overlay">
          <svg id="playIcon" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
          <svg id="pauseIcon" viewBox="0 0 24 24" hidden><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        </div>
      </div>

      <div class="player-body">
        <div class="player-title" id="playerTrackTitle">${tracks[currentTrackIndex].title}</div>
        <div class="player-artist" id="playerTrackArtist">${tracks[currentTrackIndex].artist}</div>
        <div class="player-visualizer">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>

      <div class="player-controls-right">
        <button class="player-toggle-btn" id="playerNextBtn" type="button" title="เพลงถัดไป">⏭</button>
        <button class="player-toggle-btn" id="playerMinBtn" type="button" title="ย่อ/ขยายหน้าต่าง">_</button>
      </div>
    `;

    document.body.appendChild(playerWidget);

    const playBtn = document.getElementById('playerPlayBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const trackTitle = document.getElementById('playerTrackTitle');
    const trackArtist = document.getElementById('playerTrackArtist');
    const nextBtn = document.getElementById('playerNextBtn');
    const minBtn = document.getElementById('playerMinBtn');

    function updateUI() {
      const track = tracks[currentTrackIndex] || { title: "OTF Track", artist: "onythefamily" };
      trackTitle.textContent = track.title;
      trackArtist.textContent = track.artist;

      if (isPlaying) {
        playerWidget.classList.add('playing');
        document.body.classList.add('music-playing');
        playIcon.hidden = true;
        pauseIcon.hidden = false;
        playBtn.setAttribute('title', 'กดเพื่อหยุดเพลง (โลโก้ OTF หมุน)');
      } else {
        playerWidget.classList.remove('playing');
        document.body.classList.remove('music-playing');
        playIcon.hidden = false;
        pauseIcon.hidden = true;
        playBtn.setAttribute('title', 'กดเพื่อเล่นเพลง (โลโก้ OTF จะหมุน)');
      }
    }

    function startPlayback() {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlaying = true;
          updateUI();
        }).catch(err => {
          // Autoplay was prevented by browser policy (e.g. requires user interaction)
          console.log("Autoplay blocked by browser policy; waiting for first interaction.", err);
          isPlaying = false;
          updateUI();
          attachUnlockListeners();
        });
      }
    }

    function togglePlayback() {
      if (isPlaying) {
        audioEl.pause();
        isPlaying = false;
        updateUI();
      } else {
        startPlayback();
      }
    }

    async function changeTrack(index) {
      currentTrackIndex = index % tracks.length;
      if (currentTrackIndex < 0) currentTrackIndex = tracks.length - 1;
      await setAudioSource(tracks[currentTrackIndex]);
      updateUI();
      if (isPlaying) {
        audioEl.play().catch(() => {});
      }
    }

    // Next track on end
    audioEl.addEventListener('ended', () => {
      changeTrack(currentTrackIndex + 1);
      audioEl.play().catch(() => {});
    });

    audioEl.addEventListener('play', () => {
      isPlaying = true;
      updateUI();
    });

    audioEl.addEventListener('pause', () => {
      isPlaying = false;
      updateUI();
    });

    // Play/Pause button click
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayback();
    });

    // Next button click
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      changeTrack(currentTrackIndex + 1);
    });

    // Minimize button click
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playerWidget.classList.toggle('minimized');
      minBtn.textContent = playerWidget.classList.contains('minimized') ? '▢' : '_';
    });

    // Clicking the 3D rotating logo in hero toggles play/pause
    document.addEventListener('click', (e) => {
      if (e.target.closest('.logo-3d-spin') || e.target.closest('.home-logo-rotator')) {
        togglePlayback();
      }
    });

    // Spacebar toggles music (unless typing in input/textarea)
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        togglePlayback();
      }
    });

    // Fallback user gesture unlock to satisfy strict browser autoplay policy
    let unlocked = false;
    function unlockAudioOnInteraction() {
      if (unlocked || isPlaying) return;
      unlocked = true;
      startPlayback();
      removeUnlockListeners();
    }

    function attachUnlockListeners() {
      const events = ['click', 'pointerdown', 'touchstart', 'keydown', 'scroll'];
      events.forEach(evt => window.addEventListener(evt, unlockAudioOnInteraction, { once: true, passive: true }));
    }

    function removeUnlockListeners() {
      const events = ['click', 'pointerdown', 'touchstart', 'keydown', 'scroll'];
      events.forEach(evt => window.removeEventListener(evt, unlockAudioOnInteraction));
    }

    // Attempt instant autoplay as requested by the user
    startPlayback();

    // Listen for realtime settings updates from admin panel
    window.addEventListener('otf:settings_updated', () => {
      const oldUrl = tracks[currentTrackIndex]?.url;
      loadTracks();
      if (!tracks.some(t => t.url === oldUrl)) {
        changeTrack(0);
      } else {
        updateUI();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();
