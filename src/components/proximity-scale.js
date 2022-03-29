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

AFRAME.registerComponent("proximity-scale", {
  schema: {
    enterDist: { default: 3 },
    exitDist: { default: 3 },
    minScale: { default: 0.1 },
    maxScale: { default: 1 },
    hasMaxed: { default: false },
    animStarted: { default: false },
    animDuration: { default: 2000 },
    animEasing: { default: "easeInOutElastic(1, 1.5)" }
  },
  init() {
    this.time = 0;
    console.log("initialized proximity-scale");
    //matrixAutoUpdate
    this.el.object3D.matrixAutoUpdate = true;
    //set minScale on element
    this.el.setAttribute("scale", { x: this.data.minScale, y: this.data.minScale, z: this.data.minScale });
    //initialize scaleElement
    this.scaleElement = function(newScale, el) {
      this.anim = AFRAME.ANIME.default.timeline({
        targets: this.el.object3D.scale,
        delay: 0,
        autoplay: false,
        duration: this.data.animDuration,
        easing: this.data.animEasing,
        loop: false
      });
      this.anim.add({ x: newScale, y: newScale, z: newScale });
      this.anim.play();
    };
  },
  tick(t, dt) {
    this.time += dt;
    if (this.anim && !this.anim.completed) {
      console.log("anim in progress");
      this.anim.tick(this.time);
      return;
    }
    var dist = comparePosition(this.el.object3D.position);
    if (this.data.hasMaxed) {
      if (dist > this.data.exitDist) {
        console.log("max size and outside of exit distance");
        this.scaleElement(this.data.minScale, this.el);
        this.data.animStarted = true;
        this.data.hasMaxed = false;
      }
    } else {
      if (dist < this.data.enterDist) {
        console.log("min size and inside of enter distance");
        this.scaleElement(this.data.maxScale, this.el);
        this.data.animStarted = true;
        this.data.hasMaxed = true;
      }
    }
  }
});
