const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");



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
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

//index route  (chat)
app.get("/chats",async(req,res)=>{
     let chats = await Chat.find();
     res.render("index.ejs",{chats});
});

//new route
app.get("/chats/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/chats",(req,res)=>{
    let {from, to, msg} = req.body;
    let newChat = new Chat({
        from: from,
        to: to,
        msg : msg,
        created_at: new Date()
    });

    newChat.save().then((res)=>{
        console.log("saved");
    })
    .catch((err)=>{
        console.log(err);
    });
    res.redirect("/chats");
})

//edit route
app.get("/chats/:id/edit",async (req,res)=>{
    let {id} = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs",{chat});
});

//update route
app.put("/chats/:id",async(req,res)=>{
    let {id} = req.params;
    let {msg:newMsg} = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(id,{msg: newMsg},{runValidators:true, new:true});
    console.log(updatedChat);
    res.redirect("/chats");
});


//distroy route
app.delete("/chats/:id",async(req,res)=>{
    let { id } = req.params;
    let dltChat = await Chat.findByIdAndDelete(id);
    console.log(dltChat);
    res.redirect("/chats");
});

app.get("/",(req,res)=>{
    res.send("root is working");
})

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})