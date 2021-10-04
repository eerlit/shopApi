const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../server')
const chaiJsonSchemaAjv = require('chai-json-schema-ajv')
chai.use(chaiJsonSchemaAjv);
const address = "http://localhost:3000"

const userInfoArraySchema = require('../schemas/userInfoArray.schema.json');


describe('shop API tests', function(){

before(function(){
  server.start();
})

after(function(){
server.stop();

})

describe('get /users', function () {

it('should return all users', function(done){
chai.request(address)
.get('/users')
.end(function(err, res){

expect(err).to.be.null;

expect(res).to.have.status(200);

//expect(res.body).to.be.jsonSchema(userInfoArraySchema);
done();
})


})


});



})
