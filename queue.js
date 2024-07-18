const Bull = require('bull')

const { updateNodeStatus, getFirstReadyNode } = require('./redisNodes');

const { Chest } = require('./storage');
const { getOCRIo } = require('./sockets');


const queueOpts = { 
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}
}

const OCRQueue = new Bull('OCRProcess', queueOpts)

OCRQueue.process(async (payload, done) => {
  console.log('Queue started')
  OCRIo = getOCRIo()
  console.log(OCRIo)
  try {
      payload.progress(0)
      await Chest.findByIdAndUpdate(payload.data.chest._id, { status: 'PROCESSING' })
      payload.progress(10)
      // Sending chest to process
      const readyOCRNode = await getFirstReadyNode('ocr')
      if (!Object.keys(readyOCRNode).length) {
          console.log('no ready ocr nodes')
          return
      }
      payload.progress(20)
      OCRIo.to(Object.keys(readyOCRNode)[0]).emit('process', payload.data.chest)
      payload.progress(30)
      updateNodeStatus(Object.keys(readyOCRNode)[0], 'busy', 'ocr')
      payload.progress(40)

      done()
} catch (err) {
  console.log(err)
  done(err)
}})

OCRQueue.on('completed', async (job) => {
  console.log(`${job.id} completed`)
  await Chest.findByIdAndUpdate(job.data.chest._id, { status: 'PROCESSED' })
})

OCRQueue.on('failed', async (job) => {
  console.log(`${job.id} failed`)
  await Chest.findByIdAndUpdate(job.data.chest._id, { status: 'ERROR' })
})


module.exports = { OCRQueue };