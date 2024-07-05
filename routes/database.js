var express = require('express');
var router = express.Router();
var path = require('path')
const { Chest } = require('../storage')

router.post('/', async function (req, res) {
  let { chestname } = await req.body
  const chestId = await Chest.create({
    name: chestname,
    status: "CREATED",
    got_at: new Date()
})


  // Идти на AWS, получить ссылку для загрузки изрображения для файла с именем chestId.id
  // Записать ссылку на скачивание изображения в chest в mongo (url поле в монго)
  // res.status(200).json( { upliadLink: https://s3.aws.link/asdau32ud9 })


  // Нода получает ссылку на загрузку. Загружает изображение и по вебсокетам меняет статус сундука на uploaded

  res.status(200).json(chestId.id)
});

module.exports = router;