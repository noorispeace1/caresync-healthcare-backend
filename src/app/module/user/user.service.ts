import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
    // আগের ইউজারের ডেটা খুঁজে বের করা
    const currentUser = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            image_publicId: true,
            imageUrl: true
        }
    })

    // ক্লাউডিনারিতে নতুন ছবি আপলোড করা
    const cloudinaryResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto"
            },
            async (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return reject(new Error("No result returned from Cloudinary"));
                }

                resolve(result);
            }
        ).end(buffer)
    })

    // ডাটাবেসে ইউজারের নতুন ছবির লিংক এবং পাবলিক আইডি আপডেট করা
    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            imageUrl: cloudinaryResult.secure_url,
            image_publicId: cloudinaryResult.public_id // <-- এখানে imagePublicId এর বদলে image_publicId হবে
        },
        omit: {
            password: true
        }
    })

    // যদি ইউজারের আগে থেকে কোনো ছবি থাকে, তবে সেটি ক্লাউডিনারি থেকে ডিলিট করা
    if (currentUser?.image_publicId && currentUser.imageUrl) {
        await cloudinary.uploader.destroy(currentUser.image_publicId)
    }

    return updatedUser
}

export const UserServices = {
    uploadProfileImage
}