const express=require('express');
const AppError=require('./utils/Error');
const app=express();
app.use(express.json());
const testRouter=express.Router();

const taskRouter=require('./Routes/tackRoute')

app.use('/api/tasks', taskRouter);

app.use((req,res,next)=>{
    console.log(`${req.method} ${req.originalUrl}`);
    next();
})

function testMiddleware(req,res,next){
    console.log("this is test middleware");
    try{
        !j

    }
    catch(err){
        res.json({error:err.message});  
    }
    next();
}

app.get('/',testMiddleware,(req,res)=>{
    res.send('Hello from Express');
});

testRouter.use((req,res,next)=>{
    console.log('Test router middleware');
    AppError('This is a demonstration error.', 500);
  next(new Error('This is a demonstration error.'));
})


testRouter.get('/',(req,res)=>{

    
    res.json([{id:1,name:'Example test'}]);
})

testRouter.get('/error',(req,res,next)=>{
    next(new Error('This is a demonstration error.'));
})          

testRouter.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });


app.use('/api/test',testRouter);

app.use((req,res)=>{
    res.status(404).send('Route not found');
});
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});