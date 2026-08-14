import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
// 1. Change to a default import with a lowercase 'h'
import httpStatus from "http-status"; 

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
    console.log(req.file,"req.file");

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