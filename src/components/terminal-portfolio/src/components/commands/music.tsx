import React, { useState } from "react";
import ReactPlayer from "react-player";
import { PlayerBar, SongInfo, Controls } from "../styles/music.styled";

const MusicPlayer: React.FC = () => {
  const [playing, setPlaying] = useState(false);

  const song = {
    title: "Neon Nights",
    artist: "Synthwave Dreams",
    url: "https://open.spotify.com/track/3X5Jbz7VhZfbPqIRmYIj8c?si=f7e510f603474f82",
    duration: "3:45",
  };

  return (
    <PlayerBar>
      <SongInfo>
        <div className="title">{song.title}</div>
        <div className="artist">{song.artist}</div>
        <div className="meta">Duration: {song.duration}</div>
      </SongInfo>

      <Controls>
        <button onClick={() => setPlaying(!playing)}>
          {playing ? "Pause" : "Play"}
        </button>
      </Controls>

      <ReactPlayer
        src={song.url}
        playing={playing}
        controls={true}
        width="0"
        height="0"
        style={{ width: "100%", height: "auto", aspectRatio: "16/9" }}
      />
    </PlayerBar>
  );
};

export default MusicPlayer;
