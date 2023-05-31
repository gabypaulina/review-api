const router = require("express").Router();

//user endpoints
const { coba } = require("../controllers/userController");

router.get("/coba", coba);

module.exports = router;
