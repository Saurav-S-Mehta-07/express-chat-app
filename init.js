const mongoose = require('mongoose');
const Chat = require("./models/chat.js");

main().then(()=>{
    console.log("connection successful");
})
.catch((err) => {
    console.log(err)
});
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}


let allChats = [
     {
    from:"neha",
    to:"priya",
    msg:"send me your exam sheets",
    created_at: new Date()
    },

     {
    from:"saurav",
    to:"kk",
    msg:"good morning kk",
    created_at: new Date()
    },

     {
    from:"mayank",
    to:"saurav",
    msg:"hurry up!",
    created_at: new Date()
    },

     {
    from:"rohit",
    to:"mohit",
    msg:"can you teach me JS callbacks?",
    created_at: new Date()
    },

     {
    from:"shivam",
    to:"manish",
    msg:"all the best!",
    created_at: new Date()
    },
];

Chat.insertMany(allChats);

