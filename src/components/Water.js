import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

export class WaterSystem {
    constructor(scene) {
        this.scene = scene;
        this.water = null;
    }

    async load() {
        const loader = new THREE.TextureLoader();
        const normalMap = await new Promise(resolve => loader.load('waternormals.png', resolve));

        normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        // Scale UVs so the normal map repeats instead of stretching over the entire 10km area
        // This fixes the "weird" giant ripple look
        const uvAttribute = waterGeometry.attributes.uv;
        const uvScale = 500; 
        for (let i = 0; i < uvAttribute.count; i++) {
            uvAttribute.setXY(i, uvAttribute.getX(i) * uvScale, uvAttribute.getY(i) * uvScale);
        }

        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: normalMap,
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x004a6f, 
                distortionScale: 3.7, 
                fog: this.scene.fog !== undefined,
                alpha: 0.6 // Semi-transparent
            }
        );

        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -2; 
        
        // Enable transparency in the water material derived by the helper
        this.water.material.transparent = true;
        
        this.scene.add(this.water);

        // Add an underside mesh for viewing from below
        // The main Water shader is single-sided and reflection-based, so it disappears from below
        const underGeo = new THREE.PlaneGeometry(10000, 10000);
        const underMat = new THREE.MeshBasicMaterial({
            color: 0x004a6f,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        this.underWaterMesh = new THREE.Mesh(underGeo, underMat);
        this.underWaterMesh.rotation.x = -Math.PI / 2;
        this.underWaterMesh.position.y = -2;
        this.scene.add(this.underWaterMesh);
    }

    update(time) {
        if (this.water) {
            this.water.material.uniforms['time'].value += 1.0 / 60.0;
        }
    }

    setSunDirection(vector) {
        if (this.water) {
            this.water.material.uniforms['sunDirection'].value.copy(vector).normalize();
        }
    }
}