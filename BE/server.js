const express=require('express');
const {connect}= require('mongoose');
const router=require('./routers/index.js');
const dotenv= require('dotenv');
const cors=require('cors');

const app=express();
app.use(cors());
app.use(express.json());

dotenv.config();
const PORT=process.env.PORT;
const MONGO_URI=process.env.MONGO_URI;
connect(MONGO_URI);

app.use('/',router);

app.listen(PORT,()=>{
    console.log(`server is running at PORT ${PORT}`);
});
