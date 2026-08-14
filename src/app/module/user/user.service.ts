import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
    
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: "caresync/profiles"
            },
            async (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(new Error(error.message));
                }

                try {
                    const updatedUser = await prisma.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            imageUrl : result?.secure_url,
                            image_publicId : result?.public_id
                        }
                    });
                       console.log(updatedUser);
                    resolve(updatedUser);
                } catch (dbError) {
                    console.error("Database Update Error:", dbError);
                    reject(dbError);
                }
            }
        );

        uploadStream.end(buffer);
    });
};

export const UserServices = {
    uploadProfileImage
};