/* when ever we connect to the database than try to wrap in try catch or use promise req,res and async await  use */

// require('dotenv').config({path : './.env'});


import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({path : './.env'});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed", err);
    
})











/*
const app = express();

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error:",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listing on ${process.env.PORT}`);
            
        })
    }
    catch(error){
        console.error("Error connecting to MongoDB:", error);
    }
})()*/