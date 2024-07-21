const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

var express = require('express');
var router = express.Router();
const { Chest } = require('../storage')

const REGION = 'eu-north-1'
const BUCKET_NAME = "tbcounter-screenshots";
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;

// Create an S3 client
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }
});



/**
 * @openapi
 * /db:
 *   post:
 *     description: Create new chest in DB
 *     responses:
 *       200:
 *         description: Returns upload and download links
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadLink:
 *                   type: string
 *                 downloadLink:
 *                   type: string
 *                 chestId:
 *                   type: string
 */
router.post('/', async function (req, res) {
  // create account id link to chests
  // let { accountId } = await req.body
  
  const chestId = await Chest.create({
    status: "CREATED",
    got_at: new Date()
  })
  
  console.log(chestId.id)

  let url = await generateSignedUrl(chestId.id) // add type
  let getUrl = await generateSignedGetUrl(chestId.id)

  await Chest.findByIdAndUpdate(chestId, {url: getUrl})

  // Идти на AWS, получить ссылку для загрузки изрображения для файла с именем chestId.id
  // Записать ссылку на скачивание изображения в chest в mongo (url поле в монго)
  // res.status(200).json( { upliadLink: https://s3.aws.link/asdau32ud9 })

  // Нода получает ссылку на загрузку. Загружает изображение и по вебсокетам меняет статус сундука на uploaded

  res.status(200).json({ uploadLink: url, downloadLink: getUrl, chestId: chestId.id })
});


async function generateSignedUrl(objectKey) {
    try {
        // Create a GetObjectCommand
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `${objectKey}.png`,
            ContentType: 'image/png'
        });

        // Generate a signed URL
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        

        console.log("Signed URL:", signedUrl);
        return signedUrl
    } catch (err) {
        console.error("Error generating signed URL:", err);
    }
}

async function generateSignedGetUrl(objectKey) {
  try {
      // Create a GetObjectCommand
      const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `${objectKey}.png`,
          ContentType: 'image/png'
      });

      // Generate a signed URL
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      

      console.log("Signed URL:", signedUrl);
      return signedUrl
  } catch (err) {
      console.error("Error generating signed URL:", err);
  }
}

module.exports = router