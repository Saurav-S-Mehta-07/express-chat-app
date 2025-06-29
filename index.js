const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError.js");
const { stripTypeScriptTypes } = require('module');



app.use(express.static(path.join(__dirname,"public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true})); //parse data in req.body
app.use(methodOverride("_method"));

main().then(()=>{
    console.log("connection successful");
})
.catch((err) => {
    console.log(err)
});
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fakewhatsapp');
}

//index route  (chat)
app.get("/chats",async(req,res)=>{

    try{
             let chats = await Chat.find();
            res.render("index.ejs",{chats});
    }catch(err){
        next(err);
    }

});

//new route
app.get("/chats/new",(req,res)=>{
    // throw new ExpressError(404,"page not foumd"); 
    res.render("new.ejs");
});

//error handling using try and catch
app.post("/chats", async(req,res,next)=>{
    try{
       let {from, to, msg} = req.body;
       let newChat = new Chat({
        from: from,
        to: to,
        msg : msg,
        created_at: new Date()
      });
      await newChat.save()
      res.redirect("/chats");
    } catch(err){
        next(err);
    }
    
});

//using wrapAsync

function asyncWrap(fn){
    return function (req,res,next){
        fn(req,res,next).catch(err=>next(err));
    }
}

//New- Show Route  it is for handling asynchroneous error
app.get("/chats/:id",asyncWrap( async(req,res,next)=>{
       let {id} = req.params;
       let chat = await Chat.findById(id);
       if(!chat){
        // throw new ExpressError(404,"page not foumd"); not handled by it
        return next(new ExpressError(404,"Chat not found or deleted"));
       }
       res.render("edit.ejs",{chat});
}));

//edit route
app.get("/chats/:id/edit",asyncWrap(async (req,res)=>{
      let {id} = req.params;
      let chat = await Chat.findById(id);
      res.render("edit.ejs",{chat});
}));

//update route
app.put("/chats/:id",asyncWrap(async(req,res)=>{

        let {id} = req.params;
        let {msg:newMsg} = req.body;
        let updatedChat = await Chat.findByIdAndUpdate(id,{msg: newMsg},{runValidators:true, new:true});
        console.log(updatedChat);
        res.redirect("/chats");
 
}));


//distroy route
app.delete("/chats/:id",asyncWrap(async(req,res)=>{
        let { id } = req.params;
        let dltChat = await Chat.findByIdAndDelete(id);
        console.log(dltChat);
        res.redirect("/chats");
}));

app.get("/",(req,res)=>{
    res.send("root is working");
});


//mongoose errors handling
function handledValidationError(err) {
    console.log("this was a validation error. Please follow rules");
    console.dir(err.message);
    return err;
}

app.use((err,req,res,next)=>{
    console.log(err.name);
    if(err.name === "ValidationError"){
        err = handledValidationError(err);
    }
    next(err);
});

//error handling middleware
app.use((err,req,res,next)=>{
    let {status= 500, message= "Some error occured"}= err;
    res.status(status).send(message);
})

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})