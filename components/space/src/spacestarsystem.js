
/** Properties:
 *  view - Space view objects
 */
Space.StarSystem = function(options) {
    
    if (!options.view)
        throw "Invalie view object";
    
    this.view = options.view;
    this._stars = [];
    this._planets = [];
    
    this.group = new THREE.Group();
    this.view.getScene().add(this.group);
    this.view.setStarSystem(this);
};

Space.StarSystem.prototype.addStar = function(star) {
    
    if (this._stars.indexOf(star) != -1)
        throw "Objec already exists";        
    
    this._stars.push(star);
    this.group.add(star.group);
};

Space.StarSystem.prototype.addPlanet = function(planet) {
    
    if (this._planets.indexOf(planet) != -1)
        throw "Objec already exists";        
    
    this._planets.push(planet);
    this.group.add(planet.group);
};

Space.StarSystem.prototype.update = function(dt) {

    // calculate new positions for plantes
    function calcPlanetPos(planet) {
        var r = (planet.apoapsis + planet.periapsis) * 0.5;
        
        planet._time += dt;
        var p = planet._time / planet.year;
        
        planet.group.position.x = r * Math.cos(Math.PI * 2 * p);
        planet.group.position.z = r * Math.sin(Math.PI * 2 * p);
        
        planet.group.rotation.y += 2 * Math.PI;// * (planet.time / planet.day);
    }
    
    for (var i = 0; i < this._stars.length; ++i)
        this._stars[i].update(dt);
    
    for (var i = 0; i < this._planets.length; ++i) {
        var p = this._planets[i];
        calcPlanetPos(p);
        p.update(dt);
    }
};