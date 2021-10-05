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

const schema = require("./schemas/userData.schema.json");
const postingSchema = require("./schemas/postingData.schema.json");
const validate = ajv.compile(schema);
const validate2 = ajv.compile(postingSchema);

//haetaan salausavain omasta filusta
//const secrets = require('./secrets.json')

let userDb = [

];
let postings = [];
app.use(bodyParser.json());

//postattu data skeeman validointi mw tänne!
const dataValidateMw = (req, res, next) => {
console.log("validoidaan");
console.log(req.originalUrl);
let valid = "";
console.log(validate.errors);
console.log(validate2.errors);
if(req.originalUrl == "/signup"){
  valid = validate(req.body);
}
if(req.originalUrl == "/postings"){
  console.log("ASD");
  valid = validate2(req.body);
  console.log(validate2.errors);
}
//console.log(validate.errors);

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


app.get('/users', (req, res) =>{
res.json(userDb);
})

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
const secretkey = "kello"
var opts = {
  jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey : secretkey
}

passport.use(new JwtStrategy(opts, (payload, done)=>{

done(null, {});

}))


app.post('/login', passport.authenticate('basic', {session:false}),(req, res)=>{

  //create a jwt for the client
  const token = jwt.sign({ username: "password" }, secretkey);


  //send jwt to the client
  res.json({token: token});


})
/*app.post('/upload', passport.authenticate('jwt',{session:false}), upload.array('photos', 12) (req, res, next)=>{

})*/
///ilmoitukset
const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
//upload.array('photos', 12)
app.post('/postings', passport.authenticate('jwt', {session: false}), cpUpload, dataValidateMw,(req, res, next) =>{
  const day = new Date();
  const date = day.getDate()+"."+(day.getMonth()+1)+"."+day.getFullYear();


const newPosting = {

  accountName : req.params.accountName,
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
app.put('/postings/users/:accountName',passport.authenticate('jwt', {session:false}), (req, res)=>{
  console.log("acc0"+req.params.accountName);
  const posting = postings.find(d => d.accountName == req.params.accountName);
  if(posting.accountName == undefined){
    res.sendstatus(404);
  }else{
    res.json(posting);
  }
})
app.get('/postings/users/:accountName', passport.authenticate('jwt', {session:false}), (req, res)=>{
  console.log("acc0"+req.params.accountName);
  const posting = postings.find(d => d.accountName == req.params.accountName);
  if(posting.accountName == undefined){
    res.sendstatus(404);
  }else{
    res.json(posting);
  }
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

app.delete('/postings', (req, res)=>{

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
