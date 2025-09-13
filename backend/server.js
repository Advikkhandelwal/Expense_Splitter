const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.get('/', (req, res) => {
  console.log(req.url);
  res.send('Hello babu from wildcard route');
});
app.post('/api/cars', (req, res) => {
  const { name, brand } = req.body;
  console.log(name, brand);
  res.send("Car submitted successfully");
});
app.put('/api/cars/:id', (req, res) => {
  const carId = req.params.id;
  const { name, brand } = req.body;
  console.log(name, brand);
  res.send(`Car with ID ${carId} updated successfully`);
});
app.delete('/api/cars/:id', (req, res) => {
  const carId = req.params.id;
  console.log(carId);
  res.send(`Car with ID ${carId} deleted successfully`);
});
app.listen(3000, () => {
  console.log('server started at port no. 3000');
});
