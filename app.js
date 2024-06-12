require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const DbPass = process.env.Db_Pass
const DbUser = process.env.Db_User
const app = express()

app.use(express.json())
const user = require('./model/User')

app.get('/', (req, res)=>{
    res.status(200).json({msg: 'Welcome the our API'})
})
////////////////////////
//rota privada
app.get('/user/:id',checkToken, async(req,res)=>{
    const id = req.params.id

    const existe = await user.findById(id, '-pass');
    if(!existe){
        res.status(404).json({msg:"usuario nao foi encontrado brother"})
    }
    
    res.status(200).json({existe})
})

///////////
function checkToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({msg:"Acess Denied"})
    }

    try{
        const secret = process.env.secret
        jwt.verify(token,secret)
        next()
    }catch(err){
        res.status(400).json({msg:"Invalid Token"})
    }
}

///////////
//Registrar Usuário (Post)
app.post('/register', async(req,res)=>{
    const {email, name, pass, checkpass} = req.body;
   //Validações 
    if(!name || name.length<3){
        return res.status(422).json({msg:'Por favor, insira um nome para prosseguir!'})
    }

    //confirmação de usuário 
    const userExist = await user.findOne({email:email})
    if(userExist) return res.status(422).json({msg:'Esse email já esta sendo utilizado'});

    //criando senha
    const salt = await bcrypt.genSalt(12)
    const passHash = await bcrypt.hash(pass, salt)
    
    //Finalmente criando o usuário
    const usuario = new user({name,email,pass:passHash})

    try{
        await usuario.save()
        res.status(201).json({msg:'Seu usuário foi criado com sucesso!'})
    }catch(err){
        res.status(500).json({msg:'Ocorreu um erro inesperado', err})
    }

})

//Login
app.post('/login/user', async(req, res)=>{
    const{email, pass} = req.body

    if(!email){
        return res.status(422).json({msg:'O email é obrigatório! Por favor insira.'})
        }
    const userFound = await user.findOne({email:email})
    if(!userFound){
        res.status(404).json({msg:'Usuário não encontrado, verifique se digitou corretamente.'})
    }

    const validatePass = await bcrypt.compare(pass, userFound.pass);
    if (!validatePass) {
        return res.status(422).json({ msg: 'Verifique se digitou corretamente os dados.' });
    }
 
    try{
        const secret = process.env.secret;
        const token = jwt.sign({
            id: user._id,
        },secret)
        res.status(200).json({msg:" deu bom fiot ", token})

    }catch(err){
        console.error('deu ruim no trycatch do login de enviar token', err) 
        res.status(500).json({msg:"Deu erro"})
    }
 })

mongoose.connect(`mongodb+srv://${DbUser}:${DbPass}@cluster0.h4sfqvv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).then((res)=>{
    app.listen(3000)
    console.log('Tá on')

}).catch((err)=>{console.log(err, 'deu ruim')})
 
 