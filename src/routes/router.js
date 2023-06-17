const router = require("express").Router();

const {coba} = require("../controller/adminController");

router.post("/test", coba);

module.exports = router;