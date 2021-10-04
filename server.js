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
const jwtStrategy = require('passport-jwt').Strategy;
const Extractjwt = require('passport-jwt').Extractjwt;
const { v4: uuidv4 } = require('uuid');

const schema = require("./schemas/userData.schema.json");
const validate = ajv.compile(schema);

//haetaan salausavain omasta filusta
//const secrets = require('./secrets.json')

let userDb = [
  {
"Name": "esko pentti",
"email": "pena@kyna.com",
"emailVerified": true,
"createDate": "21-08-2021",
"accountName": "pena",
"password": "43t35dsf332xcz¤",
"Id": uuidv4()
}
];
let postings = [];
app.use(bodyParser.json());

//postattu data skeeman validointi mw tänne!
const dataValidateMw = (req, res, next) => {
const valid = validate(req.body);
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
      if(user.username === username){
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
app.get('/', (req,res)=>{
  res.send('Hello World')
})

let serverInstance = null;


app.get('/users', (req, res) =>{
res.json(userDb);
})

app.post('/signup',(req,res)=>{

const hashedPassword = bcrypt.hashSync(req.body.password, 10);
const date = new Date();
const newUser = {
  Name: req.body.name,
  email: req.body.email,
  emailVerified: true,
  createDate: date,
  username: req.body.username,
  password: hashedPassword,
  Id : uuidv4()

}

userDb.push(newUser);

})
app.post('/login', passport.authenticate('basic', {session:false}),(req, res)=>{
  const token = jwt.sign({}, asecretKey);

res.json({token: token});
})

///ilmoitukset
app.post('/postings', passport.authenticate('jwt',{session: false}), upload.array('photos', 12), (req, res, next)=>{



res.sendStatus(200);
})
app.put('/postings', (req, res)=>{

})
app.get('/postings', (req, res)=>{

})

app.get('/postings/search', (req, res)=>{

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
