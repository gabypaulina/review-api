const express = require("express");
const app = express();

const router = require("./src/routes/router");

const port = process.env.PORT || 3000
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// const Joi = require("joi").extend(require("@joi/date"));
// const multer = require("multer")
// const upload = multer({
//   dest: "./uploads", //mau diupload kemana
//   fileFilter: function(req, file, cb){
//     if(file.mimetype != "image/png"){
//       return cb(new Error ("Wrong file type"), null)
//     }
//     cb(null, true)
//   },
//   limits: {
//     fileSize: 1000000
//   }
// })

// const Sequelize = require("sequelize");
// const db = new Sequelize("project_ws", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
// });
// const jwt = require("jsonwebtoken");
// const JWT_KEY = "ProjectWS";

// app.post("/api/users", upload.single("upload"), async(req, res) => {
//   const schema = Joi.object({
//       username: Joi.string().required(),
//       name: Joi.string().required(),
//       email_address: Joi.string().required().external(checkUniqueEmail),
//       password: Joi.string()
//   })

//   try {
//     await schema.validateAsync(req.body);
//   } catch (error) {
//       if (error.toString().includes("email_address")) {
//         return res.status(400).send({ message: "Email address harus unik" });
//       }
//       if (error.toString().includes("password")) {
//         return res.status(400).send({ message: "Password harus diisi" });
//       }
//       return res.status(400).send(error.toString());
//   }

  
// })

app.listen(port, function () {
  console.log(`listening on port ${port}`);
});