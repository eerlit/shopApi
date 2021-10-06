const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../server')
const chaiJsonSchemaAjv = require('chai-json-schema-ajv')
chai.use(chaiJsonSchemaAjv);

const fs = require('fs');
const address = "http://localhost:3000"

const userDataSchema = require("../schemas/userData.schema.json");



describe('shop API tests', function(){

before(function(){
  server.start();
})

after(function(){
server.stop();

})



describe('add new user to database', function () {

it('should signup user', function(done) {
chai.request(address)
.post('/signup')
.send(
  {
  Name: "string",
  email: "user@example.com",
  emailVerified:true,
  createDate: "2019-08-24",
  accountName: "string",
  password: "pa$$word"

  }
)
.end(function(err, res){
expect(err).to.be.null;
expect(res).to.have.status(201);
done();
  })
})
it('should reject with missing fileds from data structure', function(done) {
chai.request(address)
.post('/signup')
.send(
  {
  Name: "string",
  email: "user@example.com",
  createDate: "2019-08-24",
  accountName: "string",
  password: "pa$$word"
  }
)
.end(function(err, res){
expect(err).to.be.null;
expect(res).to.have.status(400);
done();
})
});
it('should reject request with incorrect data types', function(done) {
chai.request(address)
.post('/signup')
.send(
  {
  Name: 123,
  email: "user@example.com",
  createDate: "2019-08-24",
  accountName: "string",
  password: "pa$$word"
  }
)
.end(function(err, res){
expect(err).to.be.null;
expect(res).to.have.status(400);
done();
})
});
it('should reject empty post requests', function(done) {
chai.request(address)
.post('/signup')
.send(
  {
  }
)
.end(function(err, res){
expect(err).to.be.null;
expect(res).to.have.status(400);
done();
})
});
it('should contain added user data', function(done) {
  chai.request(address)
  .get('/users')
  .end(function(err, res){
    expect(err).to.be.null;
    expect(res).to.have.status(200);

    let found = false;
    for(let i = 0; i< res.body.length; i++) {
      if(res.body.length > 1) {
        found = true;
        break;
      }
    }
    if(found == false){
      assert.fail('Data not saved');
    }
    done();
  })
})

})
describe("add new postings",function() {
 it("should add new posting with image to the array", function(done){
   chai.request(address)
   .post('/postings')
   .set('content-type', 'multipart/form-data')
   .field('accountName', 'makkonen')
   .field('title', 'luistimet')
   .field('Description', 'urheilu')
   .field('Category', 'urheilu')
   .attach('gallery', fs.readFileSync('/home/eerik/1.jpeg'))
   .end(function(err,res){
     expect(err).to.be.null;
     expect(res).to.have.status(201);

   })
   

   });

 })


})
