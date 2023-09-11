const {Router} = require('express');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = Router();
const User = require('../models/User');

// /api/auth/reg
router.post('/reg',
    [
        check('email', 'Некорректный email').isEmail(),
        check('pass', 'Min длина пароля 6 символов').isLength({min: 6})
    ],
    async (req, res) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "Некорректные данные при регистрации"
            })
        }
        const {email, pass} = req.body;
        const candidate = await User.findOne({ email });
        if(candidate){
            return res.status(400).json({message: "Такой пользователь уже существует!"});
        }
        const hashPass = await bcrypt.hash(pass, 13);
        const user = new User({email, pass: hashPass});

        await user.save();
        res.status(201).json({message: "Пользователь создан."});
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"});
    }
})

// /api/auth/login
router.post('/login',
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('pass', 'Введите пароль').exists()
    ],
    async (req, res) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: "Некорректные данные при авторизации"
            })
        }
        const {email, pass} = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({message: "Пользователь не найден"});
        }
        const isMatch = await bcrypt.compare(pass, user.pass);
        if(!isMatch){
            return res.status(400).json({message: "Неверный пароль, попробуйте снова!"});
        }
        const token = jwt.sign({userId: user.id}, config.get('jwtSecret'), {expiresIn: '1h'});

        res.json({token,userId: user.id });

    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так, попробуйте снова!"});
    }
})


module.exports = router;