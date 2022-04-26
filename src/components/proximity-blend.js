AFRAME.registerComponent("proximity-blend", {
  schema: {
    name: { default: "Shieldsup" },
    minValue: { default: 0 },
    maxValue: { default: 2 },
    minDist: { default: 0 },
    maxDist: { default: 10 },
    reverse: { default: false },
    enabled: { default: false }
  },

  init() {
    //console.log("initializing prox blend");
    const meshes = [];
    if (window.APP["prox-react"]) {
      this.data.enabled = window.APP["prox-react"].enabled;
      this.data.reverse = window.APP["prox-react"].reverse;
    } else {
      console.log("no prox react");
    }
    if (this.el.object3DMap.skinnedmesh) {
      meshes.push(this.el.object3DMap.skinnedmesh);
    } else if (this.el.object3DMap.group) {
      // skinned mesh with multiple materials
      this.el.object3DMap.group.traverse(o => o.isSkinnedMesh && meshes.push(o));
    } else if (this.el.object3DMap.mesh) {
      console.log("no skinned mesh");
      meshes.push(this.el.object3DMap.mesh);
    }
    if (meshes.length) {
      this.morphs = meshes
        .map(mesh => ({ mesh, morphNumber: mesh.morphTargetDictionary[this.data.name] }))
        .filter(m => m.morphNumber !== undefined);
      console.log(this.morphs);
    }
  },

  tick() {
    //console.log("ticking");
    if (!this.data.enabled) return;
    if (!this.morphs || !this.morphs.length) {
      console.log("no morphs found");
      return;
    }

    let avatarPos = document.querySelector("#avatar-rig").object3D.position;
    const proxVal = getProximity(avatarPos);
    //console.log(proxVal);

    const { minValue, maxValue, reverse, maxDist, minDist } = this.data;
    const morphValue = !reverse
      ? THREE.Math.mapLinear(proxVal ? proxVal : 0, maxDist, minDist, minValue, maxValue)
      : THREE.Math.mapLinear(proxVal ? proxVal : 0, minDist, maxDist, minValue, maxValue);
    const clampMorphValue = THREE.Math.clamp(morphValue, minValue, maxValue);
    console.log(proxVal, morphValue, clampMorphValue);
    for (let i = 0; i < this.morphs.length; i++) {
      this.morphs[i].mesh.morphTargetInfluences[this.morphs[i].morphNumber] = clampMorphValue;
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
