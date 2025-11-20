const mongoose = require('mongoose')

function connectDB(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("database is connect")
    }).catch((err)=>{
        console.log("database failed to connect",err)
    })
}

module.exports = connectDB