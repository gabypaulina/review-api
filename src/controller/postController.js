const { Sequelize, DataTypes } = require("sequelize");
const { development } = require("../config/config.json");
const sequelize = new Sequelize(
  development.database,
  development.username,
  development.password,
  {
    host: development.host,
    port: 3306,
    dialect: "mysql",
  }
);
const Joi = require("joi");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const JWT_KEY = "proyek_ws";
const fs = require("fs")
const multer = require("multer");
const upload = multer({
    dest: "./uploads",
    fileFilter: function(req, file, cb){
        if(file.mimetype != "image/png"){
        return cb(new Error ("Wrong file type"), null)
        }
        cb(null, true)
    },
    limits: {
        fileSize: 1000000
    }
})

const users = require("../models/users")(sequelize, DataTypes)
const post = require("../models/review")(sequelize, DataTypes)

async function AxiosProducts() {
    const options = {
        method: 'GET',
        url: 'https://yotpo.p.rapidapi.com/apps/B02uug6tF2uEA0Denhj0c9PV73y5PEOuKFmTCGb1/products',
        params: {
        },
        headers: {
          'X-RapidAPI-Key': 'e4a7b1cb50msh26faaaa06e35551p116f2bjsnc9d69790c133',
          'X-RapidAPI-Host': 'yotpo.p.rapidapi.com'
        }
    };
    let data;
    try {
        const response = await axios.request(options);
        data = response.data;
    } catch (error) {
        console.error(error);
        return null;
    }

    if(!data.response.total_products){
        return null;
    }

    let amount = parseInt(data.response.total_products);

    const options2 = {
        method: 'GET',
        url: 'https://yotpo.p.rapidapi.com/apps/B02uug6tF2uEA0Denhj0c9PV73y5PEOuKFmTCGb1/products',
        params: {
            count: amount
        },
        headers: {
          'X-RapidAPI-Key': 'e4a7b1cb50msh26faaaa06e35551p116f2bjsnc9d69790c133',
          'X-RapidAPI-Host': 'yotpo.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options2);
        data = response.data;
    } catch (error) {
        console.error(error);
        return null;
    }

    let t = data.response.products;

    if(!data||!t){
        return null;
    }
    return t;

}

const postReview = async (req, res) => {
    // const uploadFoto = upload.single("Upload_Foto");
    // // uploadFoto(req, res => async function (err){
    //     if (err) {
    //         return res.status(400).send({message: err.message})
    //     }

        let token = req.header("x-auth-token")

        if(!req.header("x-auth-token")) {
            // fs.unlinkSync(`./uploads/${req.file.filename}`)
            return res.status(400).send({message: "Token tidak ditemukan"})
        }
        
        try{
            let userdata = jwt.verify(token, JWT_KEY)
            if((userdata.id).substr(0,1) == 'U'){
                const schema = Joi.object({
                    item_id: Joi.string().required(),
                    rating: Joi.number().required(),
                    content: Joi.string().required()
                });

                ({item_id, rating, content} = req.body)
                try {
                    await schema.validateAsync(req.body);
                } catch (error) {
                    if (error.toString().includes("rating")) {
                        return res.status(404).send({ message: "Rating harus antara 1 - 5" });
                    }
                    return res.status(404).send(error.toString());
                }

                const data = await AxiosProducts();
                if(!data){
                    return res.status(500).send({msg:`Internal Server Error`})
                }

                let item = data.find(element => element.id == item_id);

                if(!item){
                    return res.status(404).send({msg: "Item is not found"});
                }

                let review_db = await sequelize.query("SELECT * FROM reviews", {
                    type: Sequelize.SELECT,
                });

                let newId = "R" + (review_db[0].length + 1).toString().padStart(3, "0");

                let ins = await sequelize.query(`insert into reviews values (?, ?, ?, ?)`, {
                    replacements: [newId, item_id, rating, content],
                });

                return res.status(201).send({
                    review_id: newId,
                    item_id: item_id,
                    rating: rating,
                    content: content
                });
            }else {
            //   fs.unlinkSync(`./uploads/${req.file.filename}`)
              return res.status(400).send({message: "Maaf anda bukan User"})
            }
        }catch(err){ 
            return res.status(400).send({message: "Token Salah"})
        }

        // review_db.uploadFoto = filename
        
    // })
}

const deleteReview = async (req, res) => {
    let token = req.header("x-auth-token")
    if(!req.header("x-auth-token")){
        return res.status(400).send({message: "Token tidak ditemukan"})
    }

    try{
        let userdata = jwt.verify(token, JWT_KEY)
        
        if((userdata.id).substr(0,1) == 'A'){

            let { review_id } = req.params;
            if(review_id == ":review_id"){
                return res.status(404).send({ message: "Review_id harus diisi" });
            } 

            const reviewFound = await findReviewById(review_id);

            const response = {
                message: "Review has been deleted",
                review_id: reviewFound.review_id,
                item_id: reviewFound.item_id,
                rating: reviewFound.rating,
                content: reviewFound.content,
            }

            let [results, metadata] = await sequelize.query(
                `delete from reviews WHERE review_id like ?`,
                {
                    type: sequelize.SELECT,
                    replacements: [`%${review_id}%`],
                }
              );

            const decrementApi = await kurangiApi(userdata.id);
              
            return res.status(200).send(response);
        }
    }catch(err){
        return res.status(400).send(err.toString())
    }
}

const editReview = async (req, res) => {
    let token = req.header("x-auth-token")
    if(!req.header("x-auth-token")){
        return res.status(400).send({message: "Token tidak ditemukan"})
    }

    ({ rating, content } = req.body);
    let schema = Joi.object({
        rating: Joi.string().required(),
        content: Joi.string().required()
    });

    try{
        let userdata = jwt.verify(token, JWT_KEY)
        
        if((userdata.id).substr(0,1) == 'U'){

            let { review_id } = req.params;
            if(review_id == ":review_id"){
                return res.status(404).send({ message: "Review_id harus diisi" });
            } 

            const reviewFound = await findReviewById(review_id);

            const response = {
                message: "Review has been edited",
                review_id: review_id, 
                item_id: reviewFound.item_id,
                rating: req.body.rating,
                content: req.body.content,
            }

            let [results, metadata] = await sequelize.query(
                "UPDATE reviews SET rating=?, content=? WHERE review_id=?",
                    {
                        type: sequelize.SELECT,
                        replacements: [req.body.rating,req.body.content,review_id],
                    }
              );
              
            return res.status(200).send(response);
        }
    }catch(err){
        return res.status(400).send(err.toString())
    }
}

// const sortLow = async (req, res) => {
//     let token = req.header("x-auth-token")
//     if(!req.header("x-auth-token")){
//         return res.status(400).send({message: "Token tidak ditemukan"})
//     }

//     const sort = Joi.string().required();
//     const validationResult = sort.validate(req.body.username);

//     try{
//         let userdata = jwt.verify(token, JWT_KEY)
        
//         // let avgItem;
//         // let itemId;
//         // var avgg;
//         // var dataavg;
        
//         if((userdata.id).substr(0,1) == 'U'){
//             const avg = await getAvgReviewLowest();
//             const hasil = [];

//             for (let i = 0; i < avg.length; i++) {
//                 hasil.push(avg[i]);
//             }


            //
            // const allItems = await getAllItems();
            // const allReviews = await getAllReviews();
            // // const data = [][2];
            // var data = [];
            // for (let i = 0; i < allItems.length; i++) {
            //     avgg = await getAvgReview();
            //     dataavg.push(avgg);
            // }

            // for (let i = 0; i < allReviews.length; i++) {
            //     data.push(allReviews[i]);
            // }

            // data.sort((x,y) => {
            //     return x - y;
            // })

            // // allItems.forEach(async (each) => {
            // //     const eachItems = {...each};

            // //     eachItems.item_id = each.item_id;
            // //     eachItems.avg = await getAvgReview(each.item_id)

            // //     data.push(eachItems);
            // // });

            // for (let i = 0; i < allItems.length; i++) {
            //     itemId = allItems[i].item_id;
            //     avgItem = await getAvgReview(itemId)

            //     data[i][0].push(itemId);
            //     data[i][1].push(avgItem);

            // }
            //
              
//             return res.status(200).send(hasil);
//         }
//     }catch(err){
//         return res.status(400).send(err.toString())
//     }
// }

const sortHigh = async (req, res) => {
    let token = req.header("x-auth-token")
    if(!req.header("x-auth-token")){
        return res.status(400).send({message: "Token tidak ditemukan"})
    }

    const sort = Joi.string().required();
    const validationResult = sort.validate(req.body.username);

    try{
        let userdata = jwt.verify(token, JWT_KEY)
        
        if((userdata.id).substr(0,1) == 'U'){
            const avg = await getAvgReviewHighest();
            const hasil = [];

            for (let i = 0; i < avg.length; i++) {
                hasil.push(avg[i]);
            }
            return res.status(200).send(hasil);
        }
    }catch(err){
        return res.status(400).send(err.toString())
    }
}

    const kesimpulan = async (req, res) => {
        // const options = {
        // method: 'POST',
        // url: 'https://textvis-word-cloud-v1.p.rapidapi.com/v1/textToCloud',
        // headers: {
        //     'content-type': 'application/json',
        //     'X-RapidAPI-Key': 'c01baa427cmshb5750a8b8799adcp179580jsn442b05114c8a',
        //     'X-RapidAPI-Host': 'textvis-word-cloud-v1.p.rapidapi.com'
        // },
        // data: {
        //     text: 'This is a test. I repeat, this is a test. We are only testing the functionality of this api, nothing else. End of test.',
        //     scale: 0.5,
        //     width: 400,
        //     height: 400,
        //     colors: [
        //     '#375E97',
        //     '#FB6542',
        //     '#FFBB00',
        //     '#3F681C'
        //     ],
        //     font: 'Tahoma',
        //     use_stopwords: true,
        //     language: 'en',
        //     uppercase: false
        // }
        // };

        // try {
            
        //     const response = await axios.request(options);
        //     console.log(response.data);
        //     return res.status(200).send(response.data);
        // } catch (error) {
        //     console.error(error);
        // }

}

async function findReviewById(review_id) {
    let [reviews, metadata] = await sequelize.query(
      "SELECT * FROM reviews WHERE review_id=?",
      {
        type: sequelize.SELECT,
        replacements: [review_id],
      }
    );
    return reviews[0];
  }

const checkAvailableUser = async (review_id) => {
    const reviews = await findReviewById(review_id);
  
    if (reviews === undefined) {
      throw new Error("Review idak ditemukan");
    }
}

async function kurangiApi(admin_id) {
    const data = await findUserById(admin_id);
    let totalApi = data.api_hit -= 1;
    let [admins, metadata] = await sequelize.query(
        "UPDATE admins SET api_hit=? WHERE admin_id=?",
            {
                type: sequelize.SELECT,
                replacements: [totalApi, admin_id],
            }
    );
return admins[0];
}

async function findUserById(admin_id) {
    let [admins, metadata] = await sequelize.query(
      "SELECT * FROM admins WHERE admin_id like ?",
      {
        type: sequelize.SELECT,
        replacements: [`%${admin_id}%`],
      }
    );
    if (reviews === undefined) {
        throw new Error("Admin tidak ditemukan");
      }
    return admins[0];
}

async function getAvgReviewLowest() {
    let [reviews, metadata] = await sequelize.query(
    "SELECT item_id, AVG(rating) FROM reviews GROUP BY item_id ORDER BY AVG(rating) ASC",
    {
        type: Sequelize.SELECT,
    }
    );
    return reviews;
}
async function getAvgReviewHighest() {
    let [reviews, metadata] = await sequelize.query(
    "SELECT item_id, AVG(rating) FROM reviews GROUP BY item_id ORDER BY AVG(rating) DESC",
    {
        type: Sequelize.SELECT,
    }
    );
    return reviews;
}

async function getAllItems() {
    let [items, metadata] = await sequelize.query(
      "SELECT * FROM items",
      {
        type: sequelize.SELECT,
      }
    );
    return items;
}

async function getAllReviews() {
    let [reviews, metadata] = await sequelize.query(
      "SELECT * FROM reviews",
      {
        type: sequelize.SELECT,
      }
    );
    return reviews;
}

module.exports = {postReview, deleteReview, editReview, sortLow, sortHigh, kesimpulan}
