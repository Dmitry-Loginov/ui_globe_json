import * as THREE from "./three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { drawThreeGeo, reference } from "./threeGeoJSON.js";

//New scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);

export var clientx = 0;
export var clienty = 0;
export var showingMessage = false;

//New Renderer

var rd_container = document.getElementById('container');

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

rd_container.appendChild(renderer.domElement);


//Create a sphere to make visualization easier.
const loader = new THREE.TextureLoader();

var geometry = new THREE.SphereGeometry(30, 45, 45);
var material = new THREE.MeshPhongMaterial({
    map:         loader.load("images/earthmap1k.jpg"),
    bumpMap:     loader.load('images/earthbump1k.jpg'),
    bumpScale:   3.5,
    specularMap: loader.load('images/earthspec1k.jpg'),
    specular:    new THREE.Color('grey'),
    // wireframe:true
});
var sphere = new THREE.Mesh(geometry, material);

sphere.rotation.x += 1.58;

var container = new THREE.Object3D();
var planet = new THREE.Object3D();

var light = new THREE.DirectionalLight( 0xcccccc, 0.5);
light.position.set(10, 20, 10);

const color = 0xffffff;
var lightBack = new THREE.AmbientLight(color);
lightBack.position.set(-2, 2, 10);

var skyGeometry = new THREE.SphereGeometry(90, 50, 50);
var skyMaterial = new THREE.MeshBasicMaterial({
    map:  loader.load("images/galaxy_starfield.png"),
    side: THREE.BackSide,
});
var sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

var colors = ['red', 'green', 'blue', 'white', 'grey', 'orange', 'pink']

$.getJSON("test_geojson/univesrity.json", function(data) {
    drawThreeGeo(data, 30.3, 'sphere', {color: colors[getRandomInt(7)]}, container);
});

//Set the camera position
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 70;

planet.add(sphere);
scene.add(lightBack);
scene.add(light);
scene.add(planet);
planet.add(container);
planet.rotation.x += -1.55;
planet.rotation.z += -0.4;

//z - синий
//y - зеленый
//x - красный

//у точек своя система координат.
//z - вверх = y у сферы
//x=x
//y=-z

//анимация вращения мыши
//Render the image

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.11;
// controls.enableZoom = false;
controls.update();
export var rotate;
rotate = true;
var label = null;
var popup = null;

function render() {
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( container.children );
    try{
        if(!intersects[0].object.showingMessage){
            if(popup != null)
                if(!popup.showingPopup)
                    {
                        intersects[0].object.ShowMessage(); 
                    }
            if(popup == null)
                {
                    intersects[0].object.ShowMessage();
                }
            rotate = false;
            if(label != null)
                label.object.showingMessage = false;
            label = intersects[0];
        }
        else{

        }
    }
    catch{
        try{
            label?.object.HideMessage();
            if(!popup)
                rotate = true;
            if(!popup.showingPopup)
                rotate = true;
        }
        catch{}
    }
    renderer.render( scene, camera );
}

function onMouseMove( event ) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = ( event.clientX / window.innerWidth ) * 2-1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2+1;
    clientx = event.clientX;          
    clienty = event.clientY;   
    // console.log(camera);   
    render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

window.addEventListener( 'mousemove', onMouseMove, false );
document.getElementsByTagName("canvas")[0].addEventListener('click', ClickOutBlock, false);
document.getElementById("block").addEventListener('click', ClickBlock,false); 
document.getElementById("cross").addEventListener("click", ClickOutBlock, false);
document.getElementById("block").addEventListener("click", OpenDocument, false);
var isCross = false;
function ClickOutBlock(){
    Click(true);
}

function ClickBlock(){
    Click();
}

function OpenDocument(){
    if(!isCross)window.open(reference);
}

function Click(cancel = false){
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( container.children );
    // console.log(camera);
    
    try{
        if(popup == null){
            popup = intersects[0].object;
            intersects[0].object.ShowPopup();
            rotate = false;
            isCross = false;
        }
        if(!popup.showingPopup){
            popup = intersects[0].object;
            intersects[0].object.ShowPopup();
            rotate = false;
            isCross = false;
        }
        popup = intersects[0].object;
        
    }
    catch{
        if(popup != null && cancel){
            isCross = true;
            popup.HidePopup();
            rotate = true;
        }
    }
}

const animate = function () {
requestAnimationFrame( animate );
if(rotate)
    planet.rotation.z += 0.001;
else
    planet.rotation.z += 0;
controls.update();
renderer.render( scene, camera );
};

animate();
window.requestAnimationFrame(render);