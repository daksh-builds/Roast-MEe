import dotenv from 'dotenv';
import express from 'express';
import {Mysongsofplaylist,RoasterLLM} from './controllers.js';
const app = express();
dotenv.config();
// Middleware

app.use(express.json());

app.use(express.static('public'));
// Environment variables
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "Express Server";



// API route
app.get("/api/songs",async (req, res) => {
    
    try {
        const songs=await Mysongsofplaylist();
        res.json(songs);
    } catch (error) {
        res.status(500).json({error:"failed to fetch your songs"});
    }
   
});
app.get("/api/roast",async (req,res)=>{
     const songs = await Mysongsofplaylist(); 

        // 2. Hand that exact songs array to your LLM function
        const roast = await RoasterLLM(songs); 
        
        res.json(roast);
});

// Start server
app.listen(PORT, () => {
    console.log(`${APP_NAME} running on http://localhost:${PORT}`);
});