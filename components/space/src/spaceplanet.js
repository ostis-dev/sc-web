/** Properties:
 *      year - Year length
 *      day - Day length
 */
Space.Planet = function(options) {
    
    Space.SphereObject.call(this, options);
    
    this.year = options.year | 1;
    this.day = options.day | 1;
    
    
    // initialize geometry
    this.group = new THREE.Group();
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    
    this.material  = new THREE.MeshPhongMaterial();
    this.material.map = this.diffuseTex;

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    this.group.add(this.mesh);
};

Space.Planet.prototype.update = function(dt) {
   
};