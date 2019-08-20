import fs from 'fs-extra'
import gm from 'gm'
import path from 'path'
import promise from 'bluebird'
import mime from 'mime-types'
import uuid from 'uuid'

import config from 'infrastructure/config'


promise.promisifyAll(gm.prototype)

const resizeWatermark = async (imagePath, watermarkPath, modeResize, heightWatermark, widthWatermark, percent, requestId) => {
  const {
    width: widthOriginImage,
    height: heightOriginImage
  } = await gm(imagePath).sizeAsync()

    const ext = mime.extension(mime.lookup(watermarkPath))
    await fs.ensureDir(`${ config.s3DownloadDir }/${ requestId }/watermarkResize`)
    const watermarkPathNew = await path.resolve(`${ config.s3DownloadDir }/${ requestId }/watermarkResize/${ uuid.v4() }.${ ext }`)

    let widthWatermarkNew = widthOriginImage * (percent / 100 )

    if (modeResize === 'noKeepRatioPercent') {
      let heightWatermarkNew = (heightOriginImage * (percent / 100 )) || null
      await gm(watermarkPath).resize(widthWatermarkNew,heightWatermarkNew,"!").writeAsync(watermarkPathNew)
      return watermarkPathNew
    }

    if (modeResize === 'percent' || modeResize === 'keepRatioPercent') {
      await gm(watermarkPath).resize(widthWatermarkNew,null).writeAsync(watermarkPathNew)
      return watermarkPathNew
    }

    if (modeResize === 'pixel'|| modeResize === 'keepPercentPixel') {
      await gm(watermarkPath).resize(widthWatermark,heightWatermark).writeAsync(watermarkPathNew)
      return watermarkPathNew
    }

    if (modeResize === 'noKeepPercentPixel') {
      await gm(watermarkPath).resize(widthWatermark,heightWatermark,"!").writeAsync(watermarkPathNew)
      return watermarkPathNew
    }
}

export default resizeWatermark