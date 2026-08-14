import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
// 1. Change to a default import with a lowercase 'h'
import httpStatus from "http-status"; 
import { UserServices } from "./user.service";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {

    if(!req.file){
        throw new Error("NO file provided.")
    }
            const userId = req.user?.userId

    console.log(req.file,"req.file");
 await UserServices.uploadProfileImage(req.file?.buffer,userId!)
    sendResponse(res, {
        // 2. Now this correctly matches your import
        statusCode: httpStatus.OK, 
        success: true,
        message: "New tokens generated successfully",
        data: null,
    });
});

export const UserController = {
    uploadProfileImage
};