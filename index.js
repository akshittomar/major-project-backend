const connection = require('./db');
const express = require('express');
var cors = require('cors')
const auth = require('./routes/createuser')
const crop = require('./routes/crop')
const croprec = require('./routes/croprec');
connection();
const app = express();
const port = 3000;
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/auth',auth)
app.use('/api/crop',crop)
app.use('/api/croprec',croprec);
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = server ;