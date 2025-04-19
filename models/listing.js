const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review= require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description:String,
    //image: {
        //default:"vhttps://unsplash.com/photos/a-city-street-filled-with-lots-of-traffic-at-night-l_Qyltd4WBU",
        //type:String,
        //set:(v)=>
         //   v===""
   // ? "https://media.istockphoto.com/id/2189492037/photo/a-front-view-of-a-beautiful-american-house-and-autumn-leaves-in-the-background.jpg?s=1024x1024&w=is&k=20&c=yuqBmK7GBseCeayapQlXLFmsqOOolYnrO_IiOVGtrzg="
       // : v,
    //},
 image:{
    url:String,
    filename:String
 },

    price: Number,
    location: String,
    country: String,

reviews:[{
    type:Schema.Types.ObjectId,
    ref:"Review",
    },
],
owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
},
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if (listing) {
await Review.deleteMany({_id:{ $in:listing.reviews }});
    }
})


const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing; 