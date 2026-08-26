import cron from 'node-cron';
import { prisma } from './prisma';
import { DoctorVerificationStatus, Role } from '../../generated/prisma/enums';

export const deleteUnverifiedDoctors = async () =>{

cron.schedule(' */10 * * * *', async() => {

try {
        const oneHourago = new Date(Date.now() - 60 * 60 * 1000)
//prisma business => doctors delete
    const  deletedDoctors = await prisma.user.deleteMany({
        where:{
            role: Role.DOCTOR,
            emailVerified: false,
            createdAt: { lt : oneHourago },
            doctor:{
                verificationStatus : DoctorVerificationStatus.PENDING
            }
        }
    });

    if(deletedDoctors.count > 0){
        console.log(`Cron : Deleted ${deletedDoctors.count} unverified email doctor applications older  than 1 hour`);
    }
    
} catch (error) {
    console.log("cron: failed to delete unverified doctor application", error);
}

console.log("unverified Doctor Delete cron schedule (every 10 min");
});

}