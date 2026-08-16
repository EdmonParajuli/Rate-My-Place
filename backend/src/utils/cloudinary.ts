import { v2 as cloudinary } from "cloudinary";
import { cloudinary as cloudinaryConfig } from "../config";

cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
});

// Doc 6's "signed upload URLs from the backend, direct browser->storage
// upload" requirement, Cloudinary's flavor of it: the backend signs a set of
// upload params with the API secret (never sent to the client); the browser
// then POSTs the file straight to Cloudinary using that signature, so file
// bytes never pass through this server. The signature only covers `folder`
// and `timestamp` - the frontend must send exactly those two extra fields
// (plus api_key and the file) or Cloudinary will reject the signature.
export function generateUploadSignature(folder: string): { signature: string; timestamp: number } {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        { folder, timestamp },
        cloudinaryConfig.apiSecret
    );
    return { signature, timestamp };
}

export { cloudinary };
