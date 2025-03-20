export const computeRelativePositions = (capturedPhotos) => {
    // In a real app, this would analyze feature points across overlapping images
    // For demo purposes, we'll create a simple grid layout based on orientation data

    const positions = capturedPhotos.map(photo => {
        const { alpha, beta, gamma } = photo.orientation;

        // Normalize alpha (compass) to 0-360 degrees
        const normalizedAlpha = ((alpha || 0) + 360) % 360;

        // Convert orientation to spherical coordinates
        // These calculations are simplified and would be more complex in a real app
        const theta = normalizedAlpha * Math.PI / 180; // Horizontal angle
        const phi = (beta || 0) * Math.PI / 180;       // Vertical angle

        return {
            id: photo.id,
            data: photo.data,
            position: {
                x: Math.sin(theta) * Math.cos(phi),
                y: Math.sin(phi),
                z: Math.cos(theta) * Math.cos(phi)
            }
        };
    });

    return positions;
};

export const stitchPanorama = async (canvas, capturedPhotos) => {
    // This is a placeholder for a real stitching algorithm
    // A real implementation would:
    // 1. Detect features in each image (SIFT, SURF, ORB, etc.)
    // 2. Match features between overlapping images
    // 3. Compute homographies between images
    // 4. Warp and blend images into an equirectangular projection

    // For demo purposes, we'll create a simple grid layout
    const ctx = canvas.getContext('2d');

    // Set canvas to appropriate size for equirectangular panorama
    canvas.width = 4096;
    canvas.height = 2048;

    // Fill with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photoPromises = capturedPhotos.map((photo) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ img, photo });
            img.src = photo.data;
        });
    });

    const images = await Promise.all(photoPromises);

    // Simplified approach: arrange photos based on orientation
    const positions = computeRelativePositions(capturedPhotos);

    // Group images by approximate vertical angle (beta)
    const rows = {};
    positions.forEach((pos, index) => {
        const { beta } = capturedPhotos[index].orientation;
        const rowKey = Math.round((beta || 0) / 30) * 30; // Group in 30-degree increments

        if (!rows[rowKey]) {
            rows[rowKey] = [];
        }

        rows[rowKey].push({
            ...pos,
            img: images[index].img
        });
    });

    // For each row, sort by horizontal angle (alpha) and draw
    Object.entries(rows).forEach(([rowKey, rowImages]) => {
        // Convert to number and normalize to 0-360
        const betaAngle = ((parseFloat(rowKey) % 360) + 360) % 360;

        // Sort by alpha angle
        rowImages.sort((a, b) => {
            const alphaA = capturedPhotos.find(p => p.id === a.id).orientation.alpha || 0;
            const alphaB = capturedPhotos.find(p => p.id === b.id).orientation.alpha || 0;
            return alphaA - alphaB;
        });

        // Map beta angle (vertical) to y position in canvas
        const yPos = (betaAngle / 180) * canvas.height;

        // Draw images in this row
        rowImages.forEach((item, idx) => {
            const { img } = item;
            const alphaAngle = capturedPhotos.find(p => p.id === item.id).orientation.alpha || 0;

            // Map alpha angle (horizontal) to x position in canvas
            const xPos = ((alphaAngle / 360) * canvas.width) % canvas.width;

            // Calculate dimensions while preserving aspect ratio
            const height = canvas.height / 3;
            const width = (img.width / img.height) * height;

            ctx.drawImage(img, xPos, yPos - height / 2, width, height);
        });
    });

    return canvas.toDataURL('image/jpeg');
};