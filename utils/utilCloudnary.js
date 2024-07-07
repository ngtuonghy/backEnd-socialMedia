import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";
import { json } from "express";

cloudinary.config({
  cloud_name: env.uploadImage.cloudnaryName,
  api_key: env.uploadImage.cloudnaryApiKey,
  api_secret: env.uploadImage.cloudnaryApiSecret,
});
/* console.log(cloudinary.config()); */
export const deleteMedia = async (postId, folder) => {
  // console.log(postId, folder);
  cloudinary.api.delete_resources_by_prefix(
    `${folder}/${postId}`,
    (error, result) => {
      if (result) {
        // console.log(result);
      }
    },
  );
};

export const uploadImage = async (imagePath, userid) => {
  // console.log(imagePath);

  try {
    // Upload the image
    //
    // const parser = new DatauriParser();
    // const extName = path.extname(req.file.originalname).toString();
    // const file64 = parser.format(extName, req.file.buffer);
    const options = {
      // folder: "profile",
      upload_preset: "profile",
      // folder: "/profile",
      public_id: userid,
      overwrite: true,
      timeout: 1000000,
      // resource_type: "image",
    };
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(imagePath, options, (error, result) => {
        if (result && result.secure_url) {
          console.log(result.secure_url);
          return resolve(result.secure_url);
        }
        console.log(error.message);
        return reject({ message: error.message });
      });
    });

    const result = await cloudinary.uploader.upload(imagePath, options);
    console.log(result);
    return result.public_id;
  } catch (error) {
    console.error("upload: ", error);
  }
};

export const signatureCloudinary = async (userId, upload_preset) => {
  const apiSecret = cloudinary.config().api_secret;
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        overwrite: true,
        public_id: userId,
        upload_preset: upload_preset,
      },
      apiSecret,
    );

    return {
      timestamp,
      signature,
    };
  } catch (error) {
    console.error("signature: ", error);
  }
};
