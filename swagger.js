// const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs');
// const swaggerDocument = YAML.load('./swagger.yaml');

// module.exports = function (app){
//     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// };
module.exports = function (req,res){
    const swaggerHTML = swaggerUi.generateHTML({url: './swagger.json'});

    res.writeHead(200, {'Content Type': 'text/html'});
    res.end(swaggerHTML);
}