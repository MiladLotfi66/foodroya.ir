import connectDB from "@/utils/connectToDB";
import Banner from "@/models/Banner";   
import {writeFile} from "fs/promises";
import path from "path";
 



export async function PUT(req) {
    try {
        await connectDB();
        console.log("req==>",req);

        const formData= await req.formData();
        const BannerImage=formData.get("BannerImage");
        const BannerBigTitle = formData.get("BannerBigTitle");
        const BannersmallDiscription = formData.get("BannersmallDiscription");
        const BannerDiscription = formData.get("BannerDiscription");
        const BannerStep = formData.get("BannerStep");





        const buffer=Buffer.from(await BannerImage.arrayBuffer())
        const fileName=Date.now()+BannerImage.name;

        await writeFile(path.join(process.cwd(),"public/Uploads/"+fileName),buffer)
        const imageUrl = "/Uploads/" + fileName;

        const newBanner = new Banner({
            BannerBigTitle,
            BannersmallDiscription,
            BannerDiscription,
            BannerStep,
            imageUrl,
        });

        await newBanner.save();

 
        return Response.json({message:"file upload success"},{status:201})
    } catch (error) {
        return Response.json({message:error.message},{status:500})

    }
    
    

}