var container;
var camera, scene, renderer;

var N = 10;
var mercuryDistance = 7; var mercurySpeed = 48;
var venusDistance = 12; var venusSpeed = 35;
var earthDistance = 18; var earthSpeed = 30;
var planets = [];
var moon;
var spotlight; 
var clock = new THREE.Clock();
var delta;

var keyboard = new THREEx.KeyboardState();

class CosmicObject{
    constructor(name, palnetPosition, planetTexture, planetBump, planetScale){
        this.name = name;
        this.palnetPosition = palnetPosition;
        this.planetTexture = planetTexture;
        this.planetBump = planetBump;
        this.planetScale = planetScale; 
    }
    createObject(){
        var geometry = new THREE.SphereGeometry( this.planetScale, 32, 32 );
        var loader = new THREE.TextureLoader();
        var tex = loader.load( this.planetTexture );
        tex.minFilter = THREE.NearestFilter;
        var material;
        if(this.name == "Sun" || this.name == "Stars"){
            material = new THREE.MeshBasicMaterial({
                map: tex,
                side: THREE.DoubleSide
            });
        }else{
            var bump = loader.load( this.planetBump ); 
            material = new THREE.MeshPhongMaterial({
                map: tex,
                bumpMap: bump,     
                bumpScale: 0.05,
                side: THREE.DoubleSide
            });
        }

        
        var sphere = new THREE.Mesh( geometry, material );
        sphere.position.copy(this.palnetPosition);
        this.sphere = sphere;
    }
}


class Planet extends CosmicObject{
    constructor(name, palnetPosition, planetTexture, planetBump, planetScale, rotationSpeed, distance){
        super(name, palnetPosition, planetTexture, planetBump, planetScale);
        this.rotationSpeed = rotationSpeed;
        this.distance = distance;
    }
}

function init()
{
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.set(0, 100, 0);
    camera.lookAt(new THREE.Vector3( 0, 0, 0));

    var ambient = new THREE.AmbientLight(0x202020);
    scene.add(ambient);

    spotlight = new THREE.PointLight( 0xffffff );
    spotlight.position.set(0,0,0);
    scene.add(spotlight);

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 1);

    container.appendChild( renderer.domElement );
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    
    addCosmicBodies();
    drawOrbit();
    render();
}



function addCosmicBodies(){
    var stars = new CosmicObject("Stars", new THREE.Vector3(0,0,0), "pics/stars_texture.jpg", "0", 100);
    stars.createObject();
    scene.add(stars.sphere);

    planets.push(new CosmicObject("Sun", new THREE.Vector3(0,0,0), "pics/sunmap.jpg", "0", 5)); 
    planets.push(new Planet("Mercury", new THREE.Vector3(mercuryDistance,0,0), "pics/mercurymap.jpg", "pics/mercurybump.jpg", 0.6, mercurySpeed, mercuryDistance));
    planets.push(new Planet("Venus", new THREE.Vector3(venusDistance,0,0), "pics/venusmap.jpg", "pics/venusbump.jpg", 1.1, venusSpeed, venusDistance));
    planets.push(new Planet("Earth", new THREE.Vector3(earthDistance,0,0), "pics/earthmap1k.jpg", "pics/earthbump1k.jpg", 2, earthSpeed, earthDistance));

    for (var i = 0; i < planets.length; i++){
        //scene.add(planets[i].createObject());
        planets[i].createObject()
        scene.add(planets[i].sphere);
    }

    moon = new Planet("Moon", new THREE.Vector3(6,0,0), "pics/moonmap1k.jpg", "pics/moonbump1k.jpg", 0.5, 100, 6);
    moon.createObject();
    scene.add(moon.sphere);
    
}

function drawOrbit(){
    for (var j = 1; j < planets.length; j++)
    {
    var lineGeometry = new THREE.Geometry(); 
    var vertArray = lineGeometry.vertices; 
        for(var i = 0; i < 63; i++)
        {
            var x = planets[j].distance*Math.cos(i/10);
            var z = planets[j].distance*Math.sin(i/10);
            vertArray.push((new THREE.Vector3(x, 0, z)));
        }
    
    var lineMaterial = new THREE.LineDashedMaterial( { color: 0xcc0c00, dashSize: 1, gapSize: 1 } );
    
    var line = new THREE.Line( lineGeometry, lineMaterial );
    line.computeLineDistances(); 
    scene.add(line);
    }
}

function onWindowResize()
{
 camera.aspect = window.innerWidth / window.innerHeight;
 camera.updateProjectionMatrix();
 renderer.setSize( window.innerWidth, window.innerHeight );
}

function cameraReset(){
    cameraFocus.fill(false);
    cameraFocus[0] = true;
    camera.position.set(0, 100, 0);
    camera.lookAt(new THREE.Vector3( 0, 0, 0));
}

function cameraMovement(planetNumber){
    cameraFocus.fill(false);
    cameraFocus[planetNumber] = true;
    var currentPlanet; 
    if(planetNumber == 4){
        currentPlanet = moon;
    }else{
        currentPlanet = planets[planetNumber];
    }
    var m = new THREE.Matrix4();
    m.copyPosition(currentPlanet.sphere.matrix);
    var pos = new THREE.Vector3(0, 0, 0);
    pos.setFromMatrixPosition(m);
 
    if(keyboard.pressed("left"))cameraRotation-=0.05;
    if(keyboard.pressed("right"))cameraRotation+=0.05;

    var x = pos.x + currentPlanet.planetScale * 5 * Math.sin(cameraRotation);
    var z = pos.z + currentPlanet.planetScale * 5 * Math.cos(cameraRotation);
    camera.position.set(x, 2, z);
    camera.lookAt(pos.setFromMatrixPosition(m));
}

var cameraRotation = 0;
var t = 0;
var deg = 0.1;
var cameraFocus = [];
function animate()
{
    delta = clock.getDelta(); 
    requestAnimationFrame( animate );
    render();
    t+=delta/50.0; 

    if(keyboard.pressed("1") || cameraFocus[1]) cameraMovement(1);
    if(keyboard.pressed("2") || cameraFocus[2]) cameraMovement(2);
    if(keyboard.pressed("3") || cameraFocus[3]) cameraMovement(3);
    if(keyboard.pressed("4") || cameraFocus[4]) cameraMovement(4);
    if(keyboard.pressed("0") || cameraFocus[0]) cameraReset();


    var axis = new THREE.Vector3(0, 1, 0);
    for (var i = 1; i < planets.length; i++){
        
        var m = new THREE.Matrix4(); 
        var m1 = new THREE.Matrix4(); 
        var m2 = new THREE.Matrix4();
        var m3 = new THREE.Matrix4(); 
        
        m1.makeRotationY( planets[i].rotationSpeed * t ); 
        m2.setPosition(new THREE.Vector3(planets[i].distance, 0, 0));
          
        m.multiplyMatrices( m1, m2 );
        m.multiplyMatrices( m, m1 ); 
        planets[i].sphere.matrix = m; 
        planets[i].sphere.matrixAutoUpdate = false; 
    }

    //*
    var mm = new THREE.Matrix4(); 
    var mm1 = new THREE.Matrix4(); 
    var mm2 = new THREE.Matrix4();

    mm1.makeRotationY( moon.rotationSpeed * t ); 
    mm2.setPosition(new THREE.Vector3(moon.distance-2, 0, 0));
    mm.multiplyMatrices( mm1, mm2 );

    mm.multiplyMatrices( mm, mm1 );
    
    mm2.copyPosition(planets[3].sphere.matrix);
    
    mm.multiplyMatrices( mm2, mm );

    moon.sphere.matrix = mm; 
    moon.sphere.matrixAutoUpdate = false;
    //*/

/*
    m.copyPosition(planets[3].sphere.matrix);// домножить на то что выше
    var pos = new THREE.Vector3(0, 0, 0);
    pos.setFromMatrixPosition(m);

    var x = pos.x + planets[3].planetScale * 2 * Math.sin(t*moon.rotationSpeed);
    var z = pos.z + planets[3].planetScale * 2 * Math.cos(t*moon.rotationSpeed);
    moon.sphere.position.copy(new THREE.Vector3(x, 0 ,z));
        //*/
}
function render()
{
 renderer.render( scene, camera );
}




init();
animate();