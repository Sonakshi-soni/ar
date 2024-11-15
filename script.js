let renderer, scene, camera, model, xrSession;
const arButton = document.getElementById('arButton');

// Initialize Three.js for AR
function initThree() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    scene.add(camera);

    // Light setup
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // Load 3D Model
    const loader = new THREE.GLTFLoader();
    loader.load('chair-model.glb', (gltf) => {
        model = gltf.scene;
        model.visible = false;  // Hide the model initially
        scene.add(model);
    });
}

// Start AR Session
async function startAR() {
    if (navigator.xr) {
        xrSession = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] });
        renderer.xr.setSession(xrSession);
        
        const viewerSpace = await xrSession.requestReferenceSpace('viewer');
        const hitTestSource = await xrSession.requestHitTestSource({ space: viewerSpace });

        xrSession.addEventListener('select', () => {
            xrSession.requestAnimationFrame((timestamp, frame) => {
                const hitTestResults = frame.getHitTestResults(hitTestSource);

                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(xrSession.referenceSpace);

                    model.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                    model.visible = true;
                }
            });
        });

        renderer.setAnimationLoop(render);
    } else {
        alert('WebXR not supported on this device');
    }
}

// Render the AR Scene
function render() {
    renderer.render(scene, camera);
}

arButton.addEventListener('click', startAR);
initThree();
