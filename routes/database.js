var express = require('express');
var router = express.Router();
var path = require('path')

const { Chest } = require('../storage')
const AWS = require('aws-sdk');

const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const region = 'eu-north-1';
const bucketName = 'tbcounter-screenshots';

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

const s3 = new AWS.S3();

router.post('/', async function (req, res) {
  // create account id link to chests
  // let { accountId } = await req.body
  
  const chestId = await Chest.create({
    status: "CREATED",
    got_at: new Date()
  })

  let url = await getSignedUrl(chestId.id) // add type

  await Chest.findByIdAndUpdate(chestId, {url: url})
  // Идти на AWS, получить ссылку для загрузки изрображения для файла с именем chestId.id
  // Записать ссылку на скачивание изображения в chest в mongo (url поле в монго)
  // res.status(200).json( { upliadLink: https://s3.aws.link/asdau32ud9 })

  // Нода получает ссылку на загрузку. Загружает изображение и по вебсокетам меняет статус сундука на uploaded

  res.status(200).json({ uploadLink: url, chestId: chestId.id })
});

function getSignedUrl(fileName) {
  return new Promise((resolve, reject) => {
      const params = {
          Bucket: bucketName,
          Key: fileName,
          Expires: 60
      };

      s3.getSignedUrl('putObject', params, (err, url) => {
          if (err) {
              console.error('Ошибка при генерации подписанного URL', err);
              reject(err);
          } else {
              resolve(url);
          }
      });
  });
}

module.exports = router;