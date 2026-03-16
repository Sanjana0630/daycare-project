const express = require('express');
const app = express();
const port = 5005;

app.get('/', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Port ${port} is free and server is listening!`);
    process.exit(0);
}).on('error', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
