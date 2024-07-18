const Bull = require('bull')

const { updateNodeStatus, getFirstReadyNode } = require('./redisNodes');

const { Chest } = require('./storage');


const queueOpts = {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
}


let OCRQueue = null

function initializeQueue(OCRIo) {
  console.log('QUEUE INITIALIZED!')
  
  OCRQueue = new Bull('OCRProcess', queueOpts)

  OCRQueue.process(async (payload, done) => {
    console.log('Queue started')
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

      console.log('Queue done')
      done()
    } catch (err) {
      console.log(err)
      done(err)
    }
  })

  OCRQueue.on('completed', async (job) => {
    console.log(`${job.id} completed`)
    await Chest.findByIdAndUpdate(job.data.chest._id, { status: 'PROCESSED' })
  })

  OCRQueue.on('failed', async (job) => {
    console.log(`${job.id} failed`)
    await Chest.findByIdAndUpdate(job.data.chest._id, { status: 'ERROR' })
  })
  return OCRQueue
}


function addToQueue(chest) {
  console.log(`Queue added`)
  OCRQueue.add({ chest })
}

function getOCRQueue(){
  if (!OCRQueue) {
    throw new Error('OCRQueue not initialized yet');
  }
  return OCRQueue
}

module.exports = { initializeQueue, addToQueue, getOCRQueue };