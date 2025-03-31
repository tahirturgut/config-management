const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const admin = require('./config/firebase');

const configRoutes = require('./routes/config.routes');

const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/config', configRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 