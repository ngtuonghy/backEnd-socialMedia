import sdk, { InputFile } from "node-appwrite";
import env from "../config/env.js";
const client = new sdk.Client();

const storage = new sdk.Storage(client);
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(env.appwrite.projectId)
  .setKey(env.appwrite.apiKey)
  .setSelfSigned();

export const getStorage = () => {
  const promise = storage.listBuckets();
  promise.then(
    function (response) {
      console.log(response);
    },
    function (error) {
      console.log(error);
    },
  );
};

// export const uploadImagAPP = async (imagePath, userid) => {
//   // const image = await encode();
//   // // console.log(imagePath);
//   // const promise = storage.createFile("6623e5c12b9c99b253bb", userid, image);
//   // console.log(promise.then((res) => console.log(res)));
// };
