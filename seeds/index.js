const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campgrounds');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp') //Aqui conectamos a nuestra base de datos y definimos el nombre que tendra.
    .then(() => {
        console.log("Mongo Connection Open"); //codigo para confirmar que todo funciona
    })
    .catch((err) => {
        console.log("Oh no, Mongo connection error :("); //codigo en caso de algun error
        console.log(err);
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})   

const sample = (array) => array[Math.floor(Math.random()* array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '667b1886a3601b498eff2f19',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Earum hic numquam blanditiis aspernatur suscipit magni dolorem, maiores', 
            price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dafqapqxi/image/upload/v1720109659/YelpCamp/mxezbevtewfdagpbvqas.jpg',
                  filename: 'YelpCamp/xyimtpvdyhtjpymauqby',
                },
                {
                  url: 'https://res.cloudinary.com/dafqapqxi/image/upload/v1720109660/YelpCamp/rm8nubkvbyldm3vxekyh.jpg',
                  filename: 'YelpCamp/xn3uw5wq5blkxktdaxik',
                }
              ]
        })
        await camp.save();
    }
}
seedDB();

seedDB().then(() => {
    db.close();
});