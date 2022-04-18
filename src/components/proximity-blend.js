import { easeOutQuadratic } from "../utils/easing";

AFRAME.registerComponent("proximity-blend", {
  schema: {
    name: { default: "mouthOpen" },
    minValue: { default: 0 },
    maxValue: { default: 2 },
    reverse: { default: false }
  },

  init() {
    //console.log("initializing prox blend");
    const meshes = [];
    if (this.el.object3DMap.skinnedmesh) {
      meshes.push(this.el.object3DMap.skinnedmesh);
    } else if (this.el.object3DMap.group) {
      // skinned mesh with multiple materials
      this.el.object3DMap.group.traverse(o => o.isSkinnedMesh && meshes.push(o));
    }
    if (meshes.length) {
      this.morphs = meshes
        .map(mesh => ({ mesh, morphNumber: mesh.morphTargetDictionary[this.data.name] }))
        .filter(m => m.morphNumber !== undefined);
    }
  },

  tick() {
    //console.log("ticking");
    if (!this.morphs || !this.morphs.length) {
      console.log("no morphs found");
      return;
    }

    let avatarPos = document.querySelector("#avatar-rig").object3D.position;
    const proxVal = getProximity(avatarPos);
    //console.log(proxVal);

    const { minValue, maxValue, reverse } = this.data;
    const morphValue = !reverse
      ? THREE.Math.mapLinear(easeOutQuadratic(proxVal ? proxVal : 0), 0, 1, minValue, maxValue)
      : THREE.Math.mapLinear(easeOutQuadratic(proxVal ? proxVal : 0), 0, 1, maxValue, minValue);
    //console.log(morphValue);
    for (let i = 0; i < this.morphs.length; i++) {
      this.morphs[i].mesh.morphTargetInfluences[this.morphs[i].morphNumber] = morphValue;
    }
  }
});

const getProximity = position => {
  //console.log(position);
  const playerPos = new THREE.Vector3(position.x, position.y, position.z);

  //Query all avatar heads
  let heads = document.querySelectorAll("[networked-avatar]");
  if (heads.length < 2) return;
  //console.log(heads);
  let distances = [];

  for (let i = 0; i < heads.length; i++) {
    if (heads[i].id !== "avatar-rig") {
      let otherPosition = heads[i].object3D.position;
      let otherHead = new THREE.Vector3(otherPosition.x, otherPosition.y, otherPosition.z);
      let distance = playerPos.distanceTo(otherHead);
      distances.push(distance);
    }
  }
  if (distances.length) {
    let smallestDist = Math.min(...distances);
    return smallestDist;
  }
};
