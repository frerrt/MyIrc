import express, { response } from "express";
import http, { IncomingMessage } from "http";
import bodyParser from "body-parser";
import { db } from "./db";
import expressSession, {SessionData} from 'express-session';
import { RowDataPacket } from "mysql2";
import { Server, Socket} from "socket.io";

declare module 'express-session' {
    interface SessionData {
        user?: {id: number, username: string};
    }
};

interface SessionIncomingMessage extends IncomingMessage{
    session: SessionData
}

interface SessionSocket extends Socket{
    request: SessionIncomingMessage
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const session = expressSession({
    secret: 'verysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {}
})

const wrapper = (middleware: any) => (socket: Socket, next: any) => middleware(socket.request, {}, next);
io.use(wrapper(session));

const jsonParser = bodyParser.json();
const urlencodeParser = bodyParser.urlencoded({ extended: true });

app.use(jsonParser);
app.use(urlencodeParser);
app.use(session);

app.get('/', (request, response) =>{
    if (request.session.user){
        response.send("Hello " + request.session.user.username + " ! ");
    } else
    response.send("You are not logged in yet");
})

app.get('/home', (request, response) => {
    response.sendFile(__dirname + "/view/accueil.html")
})

app.get('/login', (request, response) => {
    response.sendFile(__dirname + "/login.html")
})

app.post("/login", (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    console.log(username, password);
    if (username && password) {
        const query = `select * from users where username = '${username}'`;
        db.query(query, username, (error, result) => {
            if (error) {
                console.log(error);
                response.send ("user not found");
            }else {
                console.log("user found");
                const data = <RowDataPacket> result;
                request.session.user = {
                    id: data[0].id,
                    username: data[0].username//result[0].username
                }
                console.log(result);
                response.redirect("/")
            }
        })
    } else {
        console.log("username or password missing");
        response.send("username or password is missing");
    }
} )

app.get('/registrer', (request, response) => {
    response.sendFile(__dirname + "/view/registrer.html")
})

app.post("/view/registrer", (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    if (username && password) {
        const query = "insert into users (username, password, role_id) VALUES(?,?)";
        db.query(query, [username, password], (error, result) => {
            if(error) {
                console.log(error);
                response.send("Nom d'utilisateur déjà pris !");
            } else {
                console.log("Compte crée avec succés !");
                const data = <RowDataPacket>result;
                response.redirect("/");
            }
        })
    } else {
        console.log("username or password missing");
        response.send("username or password is missing");
    }
});



// app.get('/chat', (request, response) => {
//     console.log("chat route")
//     response.send("Chat")
// })

app.get('/chat', (request, response) => {
    if (request.session.user){
        response.sendFile(__dirname + '/chat.html')
    }else {
        response.redirect('/');
    }
});

io.on('connection', (defaultSocket: Socket) => {
    const socket = <SessionSocket> defaultSocket;
    const userSession = socket.request.session.user;
    if (userSession) {
    console.log(userSession?.username + "user connected");
    socket.on('chat message', (mssg) => {
        io.emit('chat message', userSession.username + ": " + mssg);
});
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    }
})


httpServer.listen(8080, () => console.log("hello world"));

