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

AFRAME.registerComponent("proximity-transform", {
  schema: {
    enterDist: { default: 5 },
    exitDist: { default: 5.5 },
    minScale: { type: "vec3", default: { x: 0.1, y: 0.1, z: 0.1 } },
    minPos: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    minRot: { type: "vec3", default: { x: 0, y: 0, z: 0 } },
    maxScale: { type: "vec3", default: { x: 1, y: 1, z: 1 } },
    maxPos: { type: "vec3", default: { x: 0, y: 5, z: 0 } },
    maxRot: { type: "vec3", default: { x: 1.56, y: 1.56, z: 1.56 } },
    hasMaxed: { default: false },
    animStarted: { default: false },
    animDuration: { default: 2000 },
    animEasing: { default: "easeInOutElastic(1, 1.5)" }
  },
  init() {
    this.time = 0;
    console.log("initialized proximity-transform");
    //matrixAutoUpdate
    this.el.object3D.matrixAutoUpdate = true;
    //set minScale on element
    this.el.setAttribute("scale", { x: this.data.minScale.x, y: this.data.minScale.y, z: this.data.minScale.z });
    //initialize scaleElement
    this.scaleElement = function(newScale, el) {
      this.animScale = AFRAME.ANIME.default.timeline({
        targets: this.el.object3D.scale,
        delay: 0,
        autoplay: false,
        duration: this.data.animDuration,
        easing: this.data.animEasing,
        loop: false
      });
      this.animScale.add({ x: newScale.x, y: newScale.y, z: newScale.z });
      this.animScale.began = true;
    };
    this.moveElement = function(newPos, el) {
      this.animPos = AFRAME.ANIME.default.timeline({
        targets: this.el.object3D.position,
        delay: 0,
        autoplay: false,
        duration: this.data.animDuration,
        easing: this.data.animEasing,
        loop: false
      });
      this.animPos.add({ x: newPos.x, y: newPos.y, z: newPos.z });
      this.animPos.began = true;
    };
    this.rotElement = function(newRot, el) {
      this.animRot = AFRAME.ANIME.default.timeline({
        targets: this.el.object3D.rotation,
        delay: 0,
        autoplay: false,
        duration: this.data.animDuration,
        easing: this.data.animEasing,
        loop: false
      });
      this.animRot.add({ x: newRot.x, y: newRot.y, z: newRot.z });
      this.animRot.began = true;
    };
  },
  tick(t, dt) {
    this.time += dt;
    if (this.animScale && !this.animScale.completed) {
      console.log("anim in progress");
      this.animScale.tick(this.time);
      this.animPos.tick(this.time);
      this.animRot.tick(this.time);
      return;
    }
    var dist = comparePosition(this.el.object3D.position);
    if (this.data.hasMaxed) {
      if (dist > this.data.exitDist) {
        console.log("max size and outside of exit distance");
        this.scaleElement(this.data.minScale, this.el);
        this.moveElement(this.data.minPos, this.el);
        this.rotElement(this.data.minRot, this.el);
        this.data.animStarted = true;
        this.data.hasMaxed = false;
      }
    } else {
      if (dist < this.data.enterDist) {
        console.log("min size and inside of enter distance");
        this.scaleElement(this.data.maxScale, this.el);
        this.moveElement(this.data.maxPos, this.el);
        this.rotElement(this.data.maxRot, this.el);
        this.data.animStarted = true;
        this.data.hasMaxed = true;
      }
    }
  }
});
