import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function OrientationGuide({ targetOrientation, currentOrientation }) {
    const containerRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clean up previous renderer
        if (rendererRef.current) {
            containerRef.current.removeChild(rendererRef.current.domElement);
        }

        // Create scene
        const scene = new THREE.Scene();

        // Create camera
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
        camera.position.z = 5;

        // Create renderer (square)
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(80, 80);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create arrow to indicate direction
        const arrowGroup = new THREE.Group();
        scene.add(arrowGroup);

        // Arrow body
        const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 12);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x4285F4 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        arrowGroup.add(body);

        // Arrow head
        const headGeometry = new THREE.ConeGeometry(0.3, 0.5, 12);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0x4285F4 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0, -1.2);
        head.rotation.x = -Math.PI / 2;
        arrowGroup.add(head);

        // Reference sphere (like a compass)
        const sphereGeometry = new THREE.SphereGeometry(2, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        const animate = () => {
            requestAnimationFrame(animate);

            // Update arrow orientation based on the difference between target and current
            if (currentOrientation && targetOrientation) {
                // Simplified orientation update - in a real app you'd use quaternions
                // to properly handle the orientation differences
                const alphaOffset = (targetOrientation.alpha - currentOrientation.alpha) * Math.PI / 180;
                const betaOffset = (targetOrientation.beta - currentOrientation.beta) * Math.PI / 180;
                const gammaOffset = (targetOrientation.gamma - currentOrientation.gamma) * Math.PI / 180;

                arrowGroup.rotation.y = alphaOffset;
                arrowGroup.rotation.x = betaOffset;
                arrowGroup.rotation.z = gammaOffset;
            }

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            if (rendererRef.current && containerRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, [targetOrientation, currentOrientation]);

    return <div ref={containerRef} className="w-20 h-20" />;
}

export default OrientationGuide;