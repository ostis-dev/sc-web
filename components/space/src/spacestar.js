Space.Star = function(options) {
    
    Space.SphereObject.call(this, options);
    
    this.diffuseTex = THREE.ImageUtils.loadTexture(options.diffuse);
    
    this.group = new THREE.Group();
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    
    
    this.material  = new THREE.MeshPhongMaterial();
    this.material.map = this.diffuseTex;
    

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    this.group.add(this.mesh);
    
};

Space.Star.prototype.update = function(dt) {
    
};