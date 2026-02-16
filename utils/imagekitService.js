const ImageKit = require("imagekit");
const fs = require('fs');

/**
 * Uploads a file to ImageKit using seller-provided credentials
 * @param {Object} file - The file object from multer
 * @param {Object} credentials - Seller's ImageKit credentials
 * @returns {Promise<string>} - The URL of the uploaded image
 */
const uploadToImageKit = async (file, credentials) => {
    const { publicKey, privateKey, urlEndpoint } = credentials;

    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error("Missing ImageKit credentials in seller profile");
    }

    const imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint
    });

    try {
        const fileContent = fs.readFileSync(file.path);

        const response = await imagekit.upload({
            file: fileContent,
            fileName: file.filename || `product-${Date.now()}`,
            folder: "/products"
        });

        // Delete local file after successful upload
        try {
            fs.unlinkSync(file.path);
        } catch (unlinkError) {
            console.warn("Failed to delete local temp file:", unlinkError);
        }

        return response.url;
    } catch (error) {
        // Clean up local file even on failure
        if (file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (unlinkError) {
                console.warn("Failed to delete local temp file after Error:", unlinkError);
            }
        }
        console.error("ImageKit Upload ErrorDetails:", error);
        throw new Error(`ImageKit Upload Failed: ${error.message || 'Unknown error'}`);
    }
};

module.exports = { uploadToImageKit };
