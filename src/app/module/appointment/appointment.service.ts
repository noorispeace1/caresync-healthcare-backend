import {
	AppointmentStatus,
	PaymentStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";

const bookAppointment = async (payload : any , user: RequestUser) => {
//business logic
const transactionResult = await prisma.$transaction(async (tx) =>{


    const appointment = await tx.appointment.create({
        data :{
            status : AppointmentStatus.PENDING
        }
    })


 const bkashIdToken = await getBkashIdToken()
if(!bkashIdToken){
    throw new Error("No Bkash access Token Found")
}

const bkashCreatePaymentResponse = await fetch(`${config.bkash_base_url}/tokenized/checkout/create`,{
    method : "POST",
    headers : {
          "Content-Type": "application/json",
                             Accept: "application/json",
                             Authorization :bkashIdToken,
                             "X-App-Key" : config.bkash_app_key
                    
    },
         body: JSON.stringify({
                                 mode: "0011",
            // payerReference: "0123456789", //user email or phone number
            payerReference: user.email, //user email or phone number
            callbackURL: `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
            amount: "1200",
            currency: "BDT",
            intent: "sale",
            merchantInvoiceNumber: appointment.id // apppointment id
            // merchantInvoiceNumber: "Inv8" // apppointment id
                         })
})
const bkashCreatePaymentResult= await bkashCreatePaymentResponse.json()

console.log(bkashCreatePaymentResult);
//payment model create
await tx.payment.create({
    data:{

  	// merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
	// 			appointmentId: appointment.id,
	// 			amount: "1200",
	// 			gatewayResponse: bkashCreatePaymentResult,
	// 			bkashPaymentId: bkashCreatePaymentResult.paymentID,
	// 			payerReference: user.email,


  merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
        appointmentId: appointment.id,
        amount: "1200",
        gatewayResponse: bkashCreatePaymentResult, // Storing the raw flat object
        bkashPaymentId: bkashCreatePaymentResult.paymentID,
        payerReference: user.email,

    }
})


return {
    bkashURL: bkashCreatePaymentResult.bkashURL, // It's bkashURL, not bkash.URL
    paymentID: bkashCreatePaymentResult.paymentID
}


// return bkashCreatePaymentResult.bkash.URL
// return bkashCreatePaymentResult
})

return transactionResult
}
 const bookAppointmentCallback= async(query : Record<string,any>) =>{

  const transactionResult = await prisma.$transaction(async (tx) => {
      const paymentId = query.paymentID
      if(!paymentId){
        throw new Error("Payment id missing")
      }

    const status = query.status

    if(!status){
        throw new Error("Payment Status is missing")
    }



    const bkashIdToken = await getBkashIdToken()
    if(!bkashIdToken){
    throw new Error("No Bkash access Token Found")
}

    const executedPaymentResponse = await fetch(`${config.bkash_base_url}/tokenized/checkout/execute`,{
        method : "POST",
        headers :{
             "Content-Type": "application/json",
                             Accept: "application/json",
                             Authorization :bkashIdToken,
                             "X-App-Key" : config.bkash_app_key
        },
        body : JSON.stringify({
            paymentID : paymentId
        })
    })

    const excutedPaymentResult = await executedPaymentResponse.json()



    if(status === "success"){
        await tx.appointment.update({
            where : {
             id  : excutedPaymentResult.marchantInvoiceNumber 
                    
        },
            data :{
                status : AppointmentStatus.CONFIRMED
            }
        })

        await tx.payment.update({
            where : {
             appointmentId : excutedPaymentResult.marchantInvoiceNumber,
             bkashPaymentId : paymentId
            },
            data :{
                status : PaymentStatus.PAID,
                bkashTrxId :excutedPaymentResult.trxID,
                paidAt :excutedPaymentResult.paymentExecuteTime,
                gatewayResponse :excutedPaymentResult
            }
        })
        return{
            // transactionId : excutedPaymentResult.trxID,
                    //    excutedPaymentResult,
            redirectUrl : `${config.frontend_url}/dashboard/my-appointment?status=success`
        }
    }
   else if(status === "failure"){
       await tx.payment.update({
            where : {
             bkashPaymentId : paymentId
            },
            data :{
                status : PaymentStatus.FAILED,
               
                gatewayResponse :excutedPaymentResult
            }
        })
        return{
            // transactionId : excutedPaymentResult.trxID,
            redirectUrl : `${config.frontend_url}/dashboard/my-appointment?status=failed`
        }
    }
   else  if(status === "cancel"){
       await tx.payment.update({
            where : {
             bkashPaymentId : paymentId
            },
            data :{
                status : PaymentStatus.CANCEL,
               
                gatewayResponse :excutedPaymentResult
            }
        })
        return{
            // transactionId : excutedPaymentResult.trxID,
                       excutedPaymentResult,
            redirectUrl : `${config.frontend_url}/dashboard/my-appointment?status=cancel`
        }
    }
   else{
     return {
            excutedPaymentResult,
            redirectUrl : `${config.frontend_url}/dashboard/my-appointment?error=payment-failed`
    }
 
   }
  })
  return transactionResult
}

export const AppointmentServices = {
    bookAppointment,
    bookAppointmentCallback
}