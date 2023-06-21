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
const admin = require("../models/admin");

const JWT_KEY = "proyek_ws";

const admins = require("../models/admin")(sequelize, DataTypes);
const users = require("../models/users")(sequelize, DataTypes)
const chars = "abcdefghijklmnopqrstuvwxyz0123456789"

function generateString(length) {
  let result = "";
  const charLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }

  return result;
}

//register
const register = async (req, res) => {
  ({ username, email, password, role } = req.body);
  let schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(8),
    role: Joi.any().valid("U", "A", "u", "a")
  });

  try {
    await schema.validateAsync(req.body);
    if (role == "U" || role == "u") {
      const users = await sameUser(username);
      if (users.length > 0) {
        throw new Error("Username user harus unik");
      } else {
        let user_db = await sequelize.query("select * from users", {
          type: Sequelize.SELECT,
        });
    
        let newId = "U" + (user_db[0].length + 1).toString().padStart(3, "0");
    
        let [result, metadata] = await sequelize.query(
          `insert into users (idUser, username, email, password, role) values(:idUser, :username, :email, :password, :role)`,
          {
            replacements: {
              idUser: newId,
              username: username,
              email: email,
              password: password,
              role: role
            },
          }
        );

        const response = {
          idUser: newId,
          username: username,
          email: email
        }
      
        return res.status(201).send(response);
      }
    }
  
    if(role == "A" || role == "a"){
      const admins = await sameAdmin(username);

      if (admins.length > 0) {
        throw new Error("Username admin harus unik");
      } else {
        let apiKey = generateString(5);
    
        let admin_db = await sequelize.query("select * from admins", {
          type: Sequelize.SELECT,
        });
    
        let newId = "A" + (admin_db[0].length + 1).toString().padStart(3, "0");
    
        let [result, metadata] = await sequelize.query(
          `insert into admins (admin_id, username, password, email, api_key, api_hit, role) values(:admin_id, :username, :password, :email, :api_key, :api_hit, :role)`,
          {
            replacements: {
              admin_id: newId,
              username: username,
              password: password,
              email: email,
              api_key: apiKey,
              api_hit: 3,
              role: role
            },
          }
        );
        const response = {
          admin_id: newId,
          username: username,
          password: password,
          email: email,
          api_key: apiKey,
          api_hit: 10,
        }
        return res.status(201).send(response);
      }
    }
  } catch (error) {
    if (error.toString().includes("empty")) {
      return res.status(400).send({ message: "Field tidak boleh kosong" });
    }
    if (error.toString().includes("password")) {
      return res.status(400).send({
        message: "Password minimal 5 karakter dan maksimal  karakter",
      });
    }

    return res.status(400).send({ message: error.message });
  }
  
};

//admin login
const login = async (req, res) => {
  ({ id, password} = req.body);
  let schema = Joi.object({
    id: Joi.string().required(),
    password: Joi.string().min(5).max(8)
  });

  try {
    await schema.validateAsync(req.body);

    if(id.substr(0,1) == "A") {
      const admins = await findAdminById(id);
      if (admins === undefined) {
        throw new Error("Admin tidak ditemukan");
      }else {
        if (admins[0].password != password){
          return res.status(400).send({message: "Password salah"});
        }else{
          let token = jwt.sign(
            {
              api_key: admins[0].api_key,
              id: id,
            },
            JWT_KEY,
            { expiresIn: "3600s"}
          );
          return res.status(200).send({
            user: id,
            api_hit: admins[0].api_hit - 1,
            token: token,
          });
        }
      }
    }

    if(id.substr(0,1) == "U") {
      const users = await findUserById(id);
      if (users === undefined) {
        throw new Error("User tidak ditemukan");
      }else {
        if (users[0].password != password){
          return res.status(400).send({message: "Password salah"});
        }else{
          let token = jwt.sign(
            {
              idUser: users[0].idUser
            },
            JWT_KEY,
            { expiresIn: "3600s"}
          );
          return res.status(200).send({
            user: id,
            token: token,
          });
        }
      }
    }
  } catch (error) {
    if (error.toString().includes("empty")) {
      return res.status(400).send({ message: "Field tidak boleh kosong" });
    }
    if (error.toString().includes("password")) {
      return res.status(400).send({ message: error.message });
    }

    return res.status(400).send({ message: error.message });
  }

  
}

const coba = (req, res) => {
  console.log("done");
  return res.status(200).send("done");
};

async function sameAdmin(keyword) {
  let [admins, metadata] = await sequelize.query(
    "select * from admins where username like ?",
    {
      type: Sequelize.SELECT,
      replacements: [`%${keyword}%`],
    }
  );

  return admins;
}

async function sameUser(keyword) {
  let [users, metadata] = await sequelize.query(
    "select * from users where username like ?",
    {
      type: Sequelize.SELECT,
      replacements: [`%${keyword}%`],
    }
  );

  return users;
}

async function findUserById(keyword) {
  let [users, metadata] = await sequelize.query(
    "SELECT * FROM users WHERE idUser like ?",
    {
      type: Sequelize.SELECT,
      replacements: [`%${keyword}%`],
    }
  );

  return users;
}

async function findAdminById(keyword) {
  let [admins, metadata] = await sequelize.query(
    "SELECT * FROM admins WHERE admin_id like ?",
    {
      type: Sequelize.SELECT,
      replacements: [`%${keyword}%`],
    }
  );
  return admins;
}

module.exports = { coba, register, login };
