import express from 'express'
import StreamZip from 'node-stream-zip'
import axios from 'axios'
import fs, { writeFile } from 'fs'
import request from 'superagent'

const app = express()
const port = 8080

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/locales', express.static('locales'))

app.get('/webhook/locales-updated', async (req, res) => {
  const response = await axios.post('https://api.lokalise.com/api2/projects/69945912629763aa044216.93114705:main/files/download', {
    "format": "json",
    "original_filenames": false
  }, {
    headers: {
      'X-Api-Token': 'e04d16ad6196553e1a961eb8f21e6126fc9b6ace'
    }
  })

  const updatedLocalesPath = response.data.bundle_url as string

  request
  .get(updatedLocalesPath)
  .on('error', function(error: any) {
    console.log(error);
  })
  .pipe(fs.createWriteStream('zipFile.zip'))
  .on('finish', async () => {
    const zip = new StreamZip.async({ file: 'zipFile.zip' });
    await zip.extract('locale', './locales');
    await zip.close();
    res.send(await zip.entries())
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})