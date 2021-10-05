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
const validate = ajv.compile(schema);

//haetaan salausavain omasta filusta
//const secrets = require('./secrets.json')

let userDb = [

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
const date = new Date();
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

//  const token = jwt.sign( {}, secretkey);
console.log('xD');
//res.json({token: token});
res.send('success');
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
