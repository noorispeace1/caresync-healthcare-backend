
export class AppError extends Error{
    public statusCode : number
    constructor (statusCode : number,  message :string , stack = "" ) {
        super(message) //trow new error
        this.statusCode = statusCode
        if(stack){
            this.stack = stack

        }else{
            Error.captureStackTrace(this,this.constructor)
        }
        
    }
}

//throw new Apperror(404," NOt found")