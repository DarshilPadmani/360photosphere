import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function PhotoSphere({ imageUrl }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clean up previous scene if it exists
        if (sceneRef.current) {
            const container = containerRef.current;
            container.removeChild(container.lastChild);
            sceneRef.current.dispose && sceneRef.current.dispose();
        }

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 0.1);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert the sphere so the texture is on the inside

        // Load texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(imageUrl, (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
        });

        // Add controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationSpeed = 0.003;
        let autoRotate = true;
        let phi = 0;
        let theta = 0;

        const onMouseDown = (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
            autoRotate = false;
        };

        const onMouseMove = (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y,
                };

                theta -= deltaMove.x * 0.01;
                phi -= deltaMove.y * 0.01;

                phi = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, phi));

                camera.position.x = 0.1 * Math.sin(theta) * Math.cos(phi);
                camera.position.y = 0.1 * Math.sin(phi);
                camera.position.z = 0.1 * Math.cos(theta) * Math.cos(phi);

                camera.lookAt(scene.position);

                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        const onMouseWheel = (e) => {
            const fov = camera.fov;
            const newFov = fov + e.deltaY * 0.05;
            camera.fov = Math.max(30, Math.min(90, newFov));
            camera.updateProjectionMatrix();
        };

        // Add touch controls for mobile
        const onTouchStart = (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                previousMousePosition = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
                autoRotate = false;
            }
        };

        const onTouchMove = (e) => {
            if (isDragging && e.touches.length === 1) {
                const deltaMove = {
                    x: e.touches[0].clientX - previousMousePosition.x,
                    y: e.touches[0].clientY - previousMousePosition.y,
                };

                theta -= deltaMove.x * 0.01;
                phi -= deltaMove.y * 0.01;

                phi = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, phi));

                camera.position.x = 0.1 * Math.sin(theta) * Math.cos(phi);
                camera.position.y = 0.1 * Math.sin(phi);
                camera.position.z = 0.1 * Math.cos(theta) * Math.cos(phi);

                camera.lookAt(scene.position);

                previousMousePosition = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }
        };

        const onTouchEnd = () => {
            isDragging = false;
        };

        const handleDeviceOrientation = (e) => {
            if (!e.alpha || !e.beta || !e.gamma) return;

            // Only use device orientation when not manually dragging
            if (!isDragging) {
                autoRotate = false;

                // Convert device orientation to camera position
                const alpha = THREE.MathUtils.degToRad(e.alpha); // Z-axis rotation
                const beta = THREE.MathUtils.degToRad(e.beta);   // X-axis rotation
                const gamma = THREE.MathUtils.degToRad(e.gamma); // Y-axis rotation

                // This is a simplified conversion and may need calibration
                theta = alpha;
                phi = beta > 0 ? Math.min(beta - Math.PI / 2, Math.PI / 2) : Math.max(beta + Math.PI / 2, -Math.PI / 2);

                camera.position.x = 0.1 * Math.sin(theta) * Math.cos(phi);
                camera.position.y = 0.1 * Math.sin(phi);
                camera.position.z = 0.1 * Math.cos(theta) * Math.cos(phi);
                camera.lookAt(scene.position);
            }
        };

        const handleResize = () => {
            if (!containerRef.current) return;

            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };

        // Add event listeners
        const element = renderer.domElement;
        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mousemove', onMouseMove);
        element.addEventListener('mouseup', onMouseUp);
        element.addEventListener('mouseleave', onMouseUp);
        element.addEventListener('wheel', onMouseWheel);

        // Touch events for mobile
        element.addEventListener('touchstart', onTouchStart);
        element.addEventListener('touchmove', onTouchMove);
        element.addEventListener('touchend', onTouchEnd);

        // Device orientation for mobile viewing
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
        }

        window.addEventListener('resize', handleResize);

        // Fullscreen functionality
        const toggleFullscreen = () => {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        };

        // Add fullscreen button
        const fullscreenButton = document.createElement('button');
        fullscreenButton.className = 'absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded';
        fullscreenButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m9 0h4.5m-4.5 0v4.5m4.5 7.5v4.5m0-4.5h-4.5m-9 0H3.75m4.5 0v4.5" />
      </svg>
    `;
        fullscreenButton.addEventListener('click', toggleFullscreen);
        containerRef.current.appendChild(fullscreenButton);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            if (autoRotate) {
                theta += rotationSpeed;
                camera.position.x = 0.1 * Math.sin(theta) * Math.cos(phi);
                camera.position.y = 0.1 * Math.sin(phi);
                camera.position.z = 0.1 * Math.cos(theta) * Math.cos(phi);
                camera.lookAt(scene.position);
            }

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup function
        return () => {
            element.removeEventListener('mousedown', onMouseDown);
            element.removeEventListener('mousemove', onMouseMove);
            element.removeEventListener('mouseup', onMouseUp);
            element.removeEventListener('mouseleave', onMouseUp);
            element.removeEventListener('wheel', onMouseWheel);
            element.removeEventListener('touchstart', onTouchStart);
            element.removeEventListener('touchmove', onTouchMove);
            element.removeEventListener('touchend', onTouchEnd);

            if (window.DeviceOrientationEvent) {
                window.removeEventListener('deviceorientation', handleDeviceOrientation);
            }

            window.removeEventListener('resize', handleResize);

            // Remove the fullscreen button
            if (fullscreenButton.parentNode) {
                fullscreenButton.parentNode.removeChild(fullscreenButton);
            }
        };
    }, [imageUrl]);

    return <div ref={containerRef} className="w-full h-full relative" />;
}

export default PhotoSphere;
                