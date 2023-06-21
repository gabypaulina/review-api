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

const postReview = async (req, res) => {
    // const uploadFoto = upload.single("Upload_Foto");
    // // uploadFoto(req, res => async function (err){
    //     if (err) {
    //         return res.status(400).send({message: err.message})
    //     }

        let token = req.header("x-auth-token")

        if(!req.header("x-auth-token")) {
            // fs.unlinkSync(`./uploads/${req.file.filename}`)
            return res.status(400).sernd({message: "Token tidak ditemukan"})
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
//     let token = req.header("x-auth-token")
//     if(!req.header("x-auth-token")){
//         return res.status(400).send({message: "Token tidak ditemukan"})
//     }

//     try{
//         let userdata = jwt.verify(token, JWT_KEY)
//         if((userdata.id).substr(0,1) == 'A'){

//             let { review_id } = req.params;
            
//             let [review_db] = await sequelize.query(
//                 "SELECT * FROM reviews WHERE review_id=?",
//                 {
//                     type: sequelize.SELECT,
//                     replacements: [review_id.id],
//                 }
//             );


//             let newClass = "";
//             const class_db = user_db[0].class.split(",");
//             let found = "";
//             for(let i = 0; i<class_db.length; i++){
//                 if(class_db[i] == id_class){
//                     found = class_db[i]
//                 }else{
//                     if(newClass == ""){
//                         newClass = class_db[i]
//                     }else{
//                         newClass = newClass + `,${class_db[i]}`
//                     }
//                 }
//             }

//             if(!found){
//                 return res.status(400).send({message: "User tidak tergabung kedalam kelas"})
//             }else{
//                 let [class_db] = await sequelize.query(
//                 "SELECT name FROM classes WHERE id_class=?",
//                     {
//                         type: sequelize.SELECT,
//                         replacements: [id_class]
//                     }
//                 )

//                 let [user, metadata] = await sequelize.query(
//                 "UPDATE users SET class=? WHERE id_user=?",
//                     {
//                         type: sequelize.SELECT,
//                         replacements: [newClass,id_user],
//                     }
//                 );
//                 return res.status(200).send({message: `Berhasil drop kelas ${class_db[0].name}`});
//             }  
//         }else{
//             return res.status(400).send({message: "Maaf anda bukan student"})
//         }
//     }catch(err){
//         return res.status(400).send({message: "Token salah"})
//     }
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

module.exports = {postReview, deleteReview}
