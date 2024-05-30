const express = require('express')
const router = express.Router()
const {
  generateVideo,
} = require('../controllers/video')

router.post('/', generateVideo)

module.exports = router
