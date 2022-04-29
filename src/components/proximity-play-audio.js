import { THREE } from "aframe";

const getPlayerPosV = function() {
  var playerPos = document.querySelector("#avatar-rig").object3D.position;
  var playerPosV = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z);
  return playerPosV;
};

const comparePosition = function(elementPos) {
  var playerPosV = getPlayerPosV();
  if (!playerPosV) return;
  var elementV = new THREE.Vector3(elementPos.x, elementPos.y, elementPos.z);
  if (!elementV) return;
  return elementV.distanceTo(playerPosV);
};

AFRAME.registerComponent("proximity-play-audio", {
  schema: {
    playRadius: { default: 3 },
    pauseRadius: { default: 5 },
    resumeFromStop: { default: false },
    networked: { default: true },
    someoneElseControlling: { default: false },
    playing: { default: false },
    readyToPlay: { default: true },
    currentTime: { default: 0 },
    reset: { default: false }
  },

  init() {
    this.time = 0;
  },

  tick(t, dt) {
    this.time += dt;
    const paused = this.el.getAttribute("media-video").videoPaused;
    if (this.el.getAttribute("media-video").time < this.data.currentTime && !this.data.reset) {
      console.log("someone else reset");
      this.data.someoneElseControlling = true;
    }
    this.data.currentTime = this.el.getAttribute("media-video").time;
    this.data.reset = false;
    var dist = comparePosition(this.el.object3D.position);
    //need to check if the state has changed since last time
    if (paused && this.data.playing) {
      console.log("someone else paused");
      this.data.someoneElseControlling = true;
    }
    if (!paused && !this.data.playing) {
      console.log("someone else played");
      this.data.someoneElseControlling = true;
    }
    if (dist > this.data.pauseRadius) {
      //console.log("exited pause threshold");
      if (!paused && !this.data.someoneElseControlling) {
        console.log("pausing");
        togglePlaying(this.el);
        this.data.playing = false;
      }
      this.data.readyToPlay = true;
    }
    if (dist < this.data.playRadius) {
      //console.log("entered play threshold");
      if (this.data.someoneElseControlling && !paused && this.data.readyToPlay) {
        //if playing, but not last activated by you
        //Restart file and play again
        //use for loop with seek back button
        console.log("resetting");
        resetPlaying(this.el);
        this.data.someoneElseControlling = false;
        this.data.playing = true;
        this.data.reset = true;
        this.data.readyToPlay = false;
      } else if (paused && this.data.readyToPlay && !this.data.someoneElseControlling) {
        //if simply paused by this client, start playing again
        console.log("playing");
        togglePlaying(this.el);
        this.data.playing = true;
        this.data.readyToPlay = false;
      } else if (paused && this.data.readyToPlay && this.data.someoneElseControlling) {
        //if paused by someone else, play and reset
        console.log("resetting and playing");
        resetPlaying(this.el);
        togglePlaying(this.el);
        this.data.playing = true;
        this.data.reset = true;
        this.data.readyToPlay = false;
        this.data.someoneElseControlling = false;
      }
    }
  }
});

const resetPlaying = element => {
  let time = Math.ceil(element.getAttribute("media-video").time);
  for (let i = 0; i < time / 10; i++) {
    element.querySelector(".video-seek-back-button").object3D.dispatchEvent({
      type: "interact",
      object3D: AFRAME.scenes[0].systems.interaction.options.rightRemote.entity.object3D
    });
  }
};

const togglePlaying = element => {
  //this should not have to worry about ownership, but we will have to have controls enabled on each audio file
  element.querySelector(".video-playpause-button").object3D.dispatchEvent({
    type: "interact",
    object3D: AFRAME.scenes[0].systems.interaction.options.rightRemote.entity.object3D
  });
};
