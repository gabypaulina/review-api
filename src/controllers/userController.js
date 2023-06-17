const {Sequelize, DataTypes} = require("sequelize");

const sequelize = new Sequelize ("project_ws", "root", "", {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
})
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY;

const users = require("../models/user")(sequelize, DataTypes);
// random string
// const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

async function searchUser(username) {
    let userGet = await users.findAll({
        where: {
            username: username,
        },
    });
    return userGet;
}

const coba = (req, res) => {
    return res.status(200).send("Helo")
}

//user endpoint
const getUser = async (req, res) => {
    let username = req.body.username;
    let schema = Joi.object({
        username: Joi.string().required().messages({
            "any.required": "{{#label}} harus diisi",
            "string.empty": "{{#label}} tidak boleh blank",
        })
    })
    try {
        let res = await schema.validateAsync(req.body)
    }catch (error) {
        return res.status(400).send(error.toString())
    } 
    return res.status(200).send({"username": username})
}

const getAllUser = async (req,res) => {
    
}

const register = async (req,res) =>{

}

const login = async (req,res) =>{

}



module.exports = {coba, getUser};