const router = require("express").Router();

const { required } = require("joi");
//USER ENDPOINT
const {coba, register, login} = require("../controller/adminController");
const {getUser, searchUser} = require("../controller/userController");

router.post("/test", coba);

//admin
router.post("/users/register", register)
router.get("/users/login", login)

//user
router.get("/users", getUser)
router.get("/users/:username", searchUser)

//REVIEW ENDPOINT
const { postReview, deleteReview } = require("../controller/postController")

//review
router.post("/review", postReview)
router.delete("/review/:review_id", deleteReview)



module.exports = router;