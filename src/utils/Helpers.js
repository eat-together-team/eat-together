import { useState, useEffect } from 'react';
import { storage } from "../provider/Firebase";

export const useImageLoader = (defaultImage, imagePath) => {
    const [image, setImage] = useState(defaultImage);

    useEffect(() => {
        if (imagePath) {
            storage.ref(imagePath).getDownloadURL().then(uri => {
                setImage(uri);
            }).catch(() => {
                setImage(defaultImage);
            });
        }
    }, [imagePath, defaultImage]);

    return image;
};
