require('dotenv').config({ path: './server.env' });
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 추가: URL-encoded 데이터 처리를 위한 미들웨어
app.use(express.static(path.join(__dirname)));
app.use('/path', express.static(path.join(__dirname, 'path'))); // 추가: path 폴더 정적 파일 제공

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'join.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/festival_2024', (req, res) => {
    res.sendFile(path.join(__dirname, 'festival_2024.html'));
});

app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db('sampleDB');
        const collection = database.collection('sampleCollection');
        const usersCollection = database.collection('users');

        // 데이터 삽입 API
        app.post('/api/data', async (req, res) => {
            const data = req.body;
            const result = await collection.insertOne(data);
            res.json(result);
        });

        // 데이터 조회 API
        app.get('/api/data', async (req, res) => {
            const data = await collection.find({}).toArray();
            res.json(data);
        });

        // 사용자 등록 API
        app.post('/api/join', async (req, res) => {
            const { username, id, password } = req.body;

            // 중복 체크
            const existingUser = await usersCollection.findOne({ $or: [{ username }, { id }] });
            if (existingUser) {
                if (existingUser.username === username) {
                    return res.status(409).json({ message: '이미 존재하는 닉네임입니다.' });
                }
                if (existingUser.id === id) {
                    return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await usersCollection.insertOne({ username, id, password: hashedPassword });
            res.json(result);
        });

        // 로그인 API
        app.post('/api/login', async (req, res) => {
            const { id, password } = req.body;
            const user = await usersCollection.findOne({ id });

            if (!user) {
                // 사용자가 존재하지 않는 경우
                res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
            } else if (await bcrypt.compare(password, user.password)) {
                // 사용자가 존재하고 비밀번호가 일치하는 경우
                res.json({ message: '로그인 성공', username: user.username });
            } else {
                // 비밀번호가 일치하지 않는 경우
                res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
            }
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

run().catch(console.dir);
