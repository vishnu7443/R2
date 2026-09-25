const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


// Protected Test Route

router.get(
    "/profile",
    authMiddleware,
    (req, res) => {

        res.status(200).json({

            success: true,

            message: "Protected Route Accessed",

            user: req.user

        });

    }
);


module.exports = router;