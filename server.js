const express = require('express');
const app = express();
const Ajv = require('ajv');
const ajv = new Ajv();
const port = 3000
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const BasicStrategy = require('passport-http').BasicStrategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { v4: uuidv4 } = require('uuid');
app.use(bodyParser.json());

const schema = require("./schemas/userData.schema.json");
const postingSchema = require("./schemas/postingData.schema.json");
const updateSchema = require("./schemas/updateData.schema.json");
const validate = ajv.compile(schema);
const validate2 = ajv.compile(postingSchema);
const validate3 = ajv.compile(updateSchema);


//haetaan salausavain omasta filusta
//const secrets = require('./secrets.json')

let userDb = [

];
let postings = [];


//postattu data skeeman validointi mw tänne!
const dataValidateMw = (req, res, next) => {
console.log("validoidaan");
let check = req.originalUrl;
let valid = "";

if(req.originalUrl == "/signup"){
  valid = validate(req.body);
}

if(check.includes("posting")){

  valid = validate2(req.body);
  console.log(validate2.errors);
}
if(check.includes("posting/users")){
  valid = validate3(req.body);
  console.log(validate3.errors);

}

if(!valid){
  res.sendStatus(400);
}else{
  next();
  }
}

passport.use(new BasicStrategy(
  (username, password, done)=> {
    console.log('BasicStrategy params, username, '+ username + ' , password '+ password);

    //credential check
    //search userDb for matching user and Password

    const searchResult = userDb.find(user => {
      //((username === user.username) && (password === user.password))
      if(user.accountName == username){
        if(bcrypt.compareSync(password, user.password)){
          return true;
        }
      }else{
        return false;
      }
    })

    if(searchResult != undefined){
      done(null, searchResult);
    }else{
        done(null, false); //no credential match
    }
  }
));
//testataan että serveri toimii
app.get('/', passport.authenticate('basic', {session:false}), (req,res)=>{
  res.send('Hello World')
})


let serverInstance = null;




app.post('/signup', dataValidateMw,(req,res) =>{

const hashedPassword = bcrypt.hashSync(req.body.password, 10);
const day = new Date();
const date =day.getDate()+"."+(day.getMonth()+1)+"."+day.getFullYear();
const newUser = {
  Name: req.body.Name,
  email: req.body.email,
  emailVerified: true,
  createDate: date,
  accountName: req.body.accountName,
  password: hashedPassword,
  Id : uuidv4()
}
userDb.push(newUser);
res.sendStatus(201);

})

const secretkey = require("./secretkeys.json");
var opts = {
  jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey : secretkey
}

passport.use(new JwtStrategy(opts, (payload, done)=>{

done(null, {});

}))


app.post('/login', passport.authenticate('basic', {session:false}),(req, res)=>{

  //create a jwt for the client
  const token = jwt.sign({ username: "password" }, secretkey.jwtSignKey);


  //send jwt to the client
  res.json({token: token});


})

///ilmoitukset
const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);

app.post('/postings/:user', passport.authenticate('jwt', {session: false}), cpUpload, dataValidateMw,(req, res, next) =>{
  const day = new Date();
  const date = day.getDate()+"."+(day.getMonth()+1)+"."+day.getFullYear();


const newPosting = {

  accountName : req.params.user,
  id: uuidv4(),
  title: req.body.title,
  Description: req.body.Description,
  Category: req.body.Category,
  location: req.body.location,
  gallery: req.files,
  askingPrice: req.body.askingPrice,
  DateOfPosting: date,
  deliveryMethod: req.body.deliveryMethod,
  sellerPhoneNumber:req.body.sellerPhoneNumber,
  sellerEmail: req.body.sellerEmail

}

postings.push(newPosting);

res.sendStatus(200);
})

const cpUpdate = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
app.put('/postings/users/:user/:title', passport.authenticate('jwt', {session:false}), cpUpdate,dataValidateMw, (req, res, next)=>{
let post = "";
const day = new Date();
const date = day.getDate()+"."+(day.getMonth()+1)+"."+day.getFullYear();


let found = postings.find(function (post){
  return post.title == req.params.title;

})
if(found && req.params.user == found.accountName){
  let updated = {
    accountName : req.params.user,
    id: post.id,
    title: req.body.title,
    Description: req.body.Description,
    Category: req.body.Category,
    location: req.body.location,
    gallery: req.files,
    askingPrice: req.body.askingPrice,
    DateOfPosting: date,
    deliveryMethod: req.body.deliveryMethod,
    sellerPhoneNumber:req.body.sellerPhoneNumber,
    sellerEmail: req.body.sellerEmail
  };
  let targetIndex = postings.indexOf(found);

  postings.splice(targetIndex, 1, updated);

  res.sendStatus(200);
}else {
  res.sendStatus(404);
}

})
app.get('/postings/users/:accountName', passport.authenticate('jwt', {session:false}), (req, res)=>{
let filteredArr = []
    for(let i = 0; i < postings.length; i++){
       filteredArr = postings.filter(item => req.params.accountName == item.accountName )
  }
  res.json(filteredArr);

})

app.get('/postings/search/:category/:value', (req, res)=>{
  console.log(req.params.search);

  switch(req.params.category){
    case "Category":
    const posting1 = postings.find(d => d.Category == req.params.value);
    if(posting1.Category == undefined){
      res.sendstatus(404);
    }else{
      res.json(posting1);
    }
    break;
    case "location":
    const posting2 = postings.find(d => d.location == req.params.value);
    if(posting2.location == undefined){
      res.sendstatus(404);
    }else{
      res.json(posting2);
    }
    break;
    case "date":
    const posting3 = postings.find(d => d.DateOfPosting == req.params.value);
    if(posting3.DateOfPosting == undefined){
      res.sendstatus(404);
    }else{
      res.json(posting3);
    }
    break;
    default:
  }

})

app.get('/postings/:id', passport.authenticate('jwt', {session:false}),(req, res)=>{
  const posting = postings.find(d => d.id == req.params.id);
  if(posting.id == undefined){
    res.sendstatus(404);
  }else{
    res.json(posting);
  }

})
app.get('/postings',(req, res)=>{

    res.json(postings);

})

app.delete('/postings/:user/:title', passport.authenticate('jwt', {session:false}), (req, res)=>{

  let found = postings.find(function (post){
    return post.title == req.params.title;

  })

  if(found && req.params.user == found.accountName){
    let indexToBeDeleted = postings.indexOf(found);

    postings.splice(indexToBeDeleted, 1);

    res.sendStatus(200);
  }else {
    res.sendStatus(403);
  }


})



module.exports =  {
  start: function() {
  serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })
  },
  stop: function() {
  serverInstance.close();

  }
}
