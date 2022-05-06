import { THREE } from "aframe";
import { LoopOnce } from "three/src/constants";

const getPlayerPosV = function() {
  if (!document.querySelector(".RightHand") && !document.querySelector(".LeftHand")) return;
  let playerRightObj = document.querySelector(".RightHand").object3D;
  let playerLeftObj = document.querySelector(".LeftHand").object3D;
  let playerPosV;
  if (!document.querySelector("[stats-plus]").components["stats-plus"].inVR) {
    var playerPos = document.querySelector("#avatar-rig").object3D.position;
    playerPosV = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z);
  } else {
    let rightV = new THREE.Vector3();
    let leftV = new THREE.Vector3();
    playerPosV = {
      right: playerRightObj.getWorldPosition(rightV),
      left: playerLeftObj.getWorldPosition(leftV)
    };
  }

  return playerPosV;
};

const comparePosition = function(elementPos) {
  var playerPosV = getPlayerPosV();
  if (!playerPosV) return;
  var elementV = new THREE.Vector3(elementPos.x, elementPos.y, elementPos.z);
  if (!elementV) return;
  if (playerPosV.right !== undefined) {
    let rightComp = elementV.distanceTo(playerPosV.right);
    let leftComp = elementV.distanceTo(playerPosV.left);
    if (rightComp > leftComp) {
      return leftComp;
    } else {
      return rightComp;
    }
  } else {
    return elementV.distanceTo(playerPosV);
  }
};

AFRAME.registerComponent("proximity-animation", {
  schema: {
    playDist: { default: 3 },
    pauseDist: { default: 3.5 },
    shouldReset: { default: true },
    shouldLoop: { default: true },
    clipNames: { default: ["Animation"] },
    animations: { default: [] }
  },
  init() {
    this.time = 0;
    this.hasEntered = false;
    let interval = setInterval(() => {
      if (this.el.components["loop-animation"]) {
        this.data.animations = this.el.components["loop-animation"].mixerEl.components["animation-mixer"].animations;
        this.el.setAttribute("loop-animation", { paused: true });
        clearInterval(interval);
      }
    }, 100);
  },
  tick(t, dt) {
    this.time += dt;
    var dist = comparePosition(this.el.object3D.position);
    if (dist > this.data.pauseDist) {
      if (!this.hasEntered) return;
      this.hasEntered = !this.hasEntered;
      //PAUSE ANIMATION
      if (this.data.shouldReset) {
        this.el.components["loop-animation"].destroy();
      } else {
        this.el.setAttribute("loop-animation", { paused: true });
      }
    } else if (dist < this.data.playDist) {
      if (this.hasEntered) return;
      this.hasEntered = !this.hasEntered;
      //RESTART OR RESUME ANIMATION
      if (this.data.shouldReset) {
        this.restartAnim();
      } else {
        this.el.setAttribute("loop-animation", { paused: false });
      }
    }
  },
  restartAnim() {
    if (this.data.animations.length < 1) return;
    let currentClips = [...this.data.clipNames];
    const clipNames = currentClips.map(x => x.label);
    const clips = this.data.animations.filter(x => clipNames.includes(x.name));
    const mixer = this.el.components["loop-animation"].mixerEl.components["animation-mixer"].mixer;
    for (let i = 0; i < clips.length; i++) {
      let action = mixer.clipAction(clips[i], this.el.object3D);
      action.enabled = true;
      if (!this.data.shouldLoop) {
        action.setLoop(LoopOnce, -1);
        action.clampWhenFinished = true;
        action.play();
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity).play();
      }
      this.el.components["loop-animation"].currentActions.push(action);
    }
    this.el.components["loop-animation"].mixerEl.components["animation-mixer"].play();
  }
});
