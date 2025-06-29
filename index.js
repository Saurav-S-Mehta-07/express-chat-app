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
       // .then((res)=>{
       //     console.log("saved");
      // })
      // .catch((err)=>{
      //     console.log(err);
      // });
      res.redirect("/chats");
    } catch(err){
        next(err);
    }
    
});

//New- Show Route  it is for handling asynchroneous error
app.get("/chats/:id",async(req,res,next)=>{
    try{
       let {id} = req.params;
       let chat = await Chat.findById(id);
       if(!chat){
        // throw new ExpressError(404,"page not foumd"); not handled by it
        return next(new ExpressError(404,"Chat not found or deleted"));
       }
       res.render("edit.ejs",{chat});
    }catch(err){
        next(err);
    }
});

//edit route
app.get("/chats/:id/edit",async (req,res)=>{
    try{
      let {id} = req.params;
      let chat = await Chat.findById(id);
      res.render("edit.ejs",{chat});
    }
    catch(err){
        next(err);
    }
});

//update route
app.put("/chats/:id",async(req,res)=>{
    try{
        let {id} = req.params;
        let {msg:newMsg} = req.body;
        let updatedChat = await Chat.findByIdAndUpdate(id,{msg: newMsg},{runValidators:true, new:true});
        console.log(updatedChat);
        res.redirect("/chats");
    }catch(err){
        next(err);
    }
});


//distroy route
app.delete("/chats/:id",async(req,res)=>{
    try{
        let { id } = req.params;
        let dltChat = await Chat.findByIdAndDelete(id);
        console.log(dltChat);
        res.redirect("/chats");
    }
    catch(err){
        next(err);
    }
});

app.get("/",(req,res)=>{
    res.send("root is working");
});

//error handling middleware
app.use((err,req,res,next)=>{
    let {status= 500, message= "Some error occured"}= err;
    res.status(status).send(message);
})

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})