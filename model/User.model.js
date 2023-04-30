

const mongoose = require("mongoose")


// const commentSchema = mongoose.Schema({
//   userId:String,
//   comment:String
// })


// const postSchema =  mongoose.Schema({
//     post_image: String,
//     description: String,
//     like: Number,
//     all_comment: [commentSchema]
    
// })


const userSchema = mongoose.Schema({
    // lastName: String,
    // firstName: String,
    // password: String,
    // email: String,
    // avatar: String,
    // coverimg: String,
    // post: [postSchema]

    username: {
        type: String,
        require: true,
        min: 3,
        max: 20,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        min: 6,
      },
      profilePicture: {
        type: String,
        default: "",
      },
      coverPicture: {
        type: String,
        default: "",
      },
      followers: {
        type: Array,
        default: [],
      },
      followings: {
        type: Array,
        default: [],
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      desc: {
        type: String,
        max: 50,
      },
      BlockedTime:{
        type:Number
      }
    

},
{ timestamps: true }
)

const User = mongoose.model("user", userSchema)
module.exports = {
    User
}


// {
//     "lastName": "gpaa",
//     "firstName": "gpaa",
//     "password": "gpaa",
//     "email": "gpaa@gmial.com",
//     "avatar": "ass",
//     "coverimg": "ass",
//     "post": [
//         {
//             "post_image": "ass",
//             "description": "dsa",
//             "like": 1,
//             "all_comment": [
//                 {
//                     "userId": "ass",
//                     "comment": "good"
//                 }
//             ]
//         }
//     ]
// }