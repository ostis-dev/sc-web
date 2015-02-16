Space.View = function() {

    var containerId,
        container,
        camera,
        scene,
        light,
        controls,
        renderer,
        stats, 
        starSystem;

    
    var clock = new THREE.Clock();
    
    var onWindowResize = function() {

        windowHalfX = container.innerWidth() / 2;
        windowHalfY = container.innerHeight() / 2;

        camera.aspect = container.innerWidth() / container.innerHeight();
        camera.updateProjectionMatrix();

        renderer.setSize(container.innerWidth(), container.innerHeight());
    };

    var animate = function() {

        requestAnimationFrame(animate);

        if (starSystem)
            starSystem.update(clock.getDelta());
        
        render();   
        stats.update();
    }

    var render = function() {
        renderer.render(scene, camera);
    }
    
    
    return {
    
        getScene: function() {
            return scene;
        },
        
        setStarSystem: function(system) {
            starSystem = system;
        },
        
        /** Initialize view
         * @param {Object} options Object that contains properties for view initialization.
         * Properties:
         *      container - id of view container
         */
        init: function(options) {
            containerId = options.container;
            container = $('#' + containerId);

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(50, container.innerWidth(), container.innerHeight(), 1, 10000);
            camera.position.set(0, 75, 0);
            camera.lookAt(new THREE.Vector3( 0, 0, 0 ));

            light = new THREE.PointLight(0xffffff, 1);
            camera.add(light);

            scene.add(camera);


            renderer = new THREE.WebGLRenderer( );
            renderer.setClearColor(0x000000);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.innerWidth(), container.innerHeight());
            container.append(renderer.domElement);


            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.append(stats.domElement);

            onWindowResize();
            window.addEventListener('resize', onWindowResize, false);

            animate();
        }
    };
    
}