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
    const meshes = [];
    //delay init until window.APP['prox-react'] !undefined
    while (!window.APP["prox-react"]) {
      console.log("prox-react does not exist");
    }
    if (window.APP["prox-react"]) {
      this.data.enabled = window.APP["prox-react"].enabled;
      this.data.reverse = window.APP["prox-react"].reverse;
    }
    if (this.el.object3DMap.skinnedmesh) {
      meshes.push(this.el.object3DMap.skinnedmesh);
    } else if (this.el.object3DMap.group) {
      // skinned mesh with multiple materials
      this.el.object3DMap.group.traverse(o => o.isSkinnedMesh && meshes.push(o));
    } else if (this.el.object3DMap.mesh) {
      meshes.push(this.el.object3DMap.mesh);
    }
    if (meshes.length) {
      this.morphs = meshes
        .map(mesh => ({ mesh, morphNumber: mesh.morphTargetDictionary[this.data.name] }))
        .filter(m => m.morphNumber !== undefined);
    }
  },

  tick() {
    if (!this.data.enabled) return;
    if (!this.morphs || !this.morphs.length) {
      return;
    }

    let rootEl = getRootPosition(this.el);

    const proxVal = getProximity(rootEl.components["ik-root"].el.object3D.position, rootEl.id);

    const { minValue, maxValue, reverse, maxDist, minDist } = this.data;
    const morphValue = !reverse
      ? THREE.Math.mapLinear(proxVal ? proxVal : 0, maxDist, minDist, minValue, maxValue)
      : THREE.Math.mapLinear(proxVal ? proxVal : 0, minDist, maxDist, minValue, maxValue);
    const clampMorphValue = THREE.Math.clamp(morphValue, minValue, maxValue);
    for (let i = 0; i < this.morphs.length; i++) {
      this.morphs[i].mesh.morphTargetInfluences[this.morphs[i].morphNumber] = clampMorphValue;
    }
  }
});

const getRootPosition = el => {
  while (el && !(el.components && el.components["ik-root"])) {
    el = el.parentNode;
  }

  return el;

  // let pos = el.components["ik-root"].el.object3D.position;
  // return pos;
};

const getProximity = (position, id) => {
  const playerPos = new THREE.Vector3(position.x, position.y, position.z);

  //Get position to all other entities outside of this one
  let avatars = document.querySelectorAll("[networked-avatar]");
  if (avatars.length < 2) return;
  let distances = [];

  for (let i = 0; i < avatars.length; i++) {
    if (avatars[i].id !== id) {
      let otherPosition = avatars[i].object3D.position;
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
