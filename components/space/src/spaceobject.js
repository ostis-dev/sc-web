/** Properties:
 *  apoapsis - Apocenter value (double)
 *  periapsis - Pericenter value (double)
 */
Space.Object = function(options) {
    
    this.radius = options.radius | 1;
    this.apoapsis = options.apoapsis | 30;
    this.periapsis = options.periapsis | 30;
    
    this.diffuseTex = THREE.ImageUtils.loadTexture(options.diffuse);
    
    this._childs = [];
    this._parent = null;
    this._time = 0;
};

/** Properties:
 *  diffuse - Diffuse texture
 *  radius - Object radius (double)
 *  mass - Mass of object
 *  semiMajorAxis - Semi major axis value (a)
 *  eccentricity - Eccentricity value (e)
 *  inclination - Inclination value (i)
 *  argOfPerihelion - Argument of perihelion (w)
 *  lonOfAscendingNode - Longitude of ascending node (Q)
 *  meanAnomaly - Mean anomaly (M)
 */
Space.SphereObject = function(options) {
    Space.Object.call(this, options);
    
    
};