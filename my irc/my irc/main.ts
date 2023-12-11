const express = require('express');
const http = require('http');
import bodyParser from "body-parser";
import { log } from "console";
const mysql = require('mysql2');
const { db } = require("./db");
import expressSession, { SessionData } from "express-session";
import { IncomingMessage } from "http";
// import { request } from "http";
import { RowDataPacket } from "mysql2";
import { disconnect } from "process";
import { Server, Socket } from "socket.io";
import { main } from "./checkUser";

declare module 'express-session' {
    interface SessionData {
        user?: {id: number, username: string};
        canal?: {id: number, name: string};
    }
}

interface SessionIncomingMessage extends IncomingMessage {
    session: SessionData;
}

interface SessionSocket extends Socket {
    request: SessionIncomingMessage
}

const app = express();
const httpServer = http.createServer(app).listen(8080, () => {
    console.log('Server is running at port 8080');
});
const io = new Server(httpServer)

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// const cors = require('cors');
// app.use(cors());

const session = expressSession({
    secret: "verySecret",
    resave: false,
    saveUninitialized: true,
    cookie: {}
})

const wrapper = (middleware: any) => (socket: Socket, next: any) => middleware(socket.request, {}, next);
io.use(wrapper(session));



const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(jsonParser);
app.use(urlencodedParser);
app.use(session);

app.get('/', (req, res) => {
    if(req.session.user) {
        res.send('Hello ' + req.session.user.username + " !");
    } else {
        res.send("You are not logged in yet")
    }
    // console.log('Request received for / route'); // Este mensaje se imprimirá en la consola cuando alguien acceda a la ruta /
    
});



app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/login.html")
})

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        // Appel de la fonction main pour vérifier les informations de connexion.
        const data = await main(username, password);
        // console.log(data);
        if (data === true) {
            const query = "SELECT * FROM users WHERE username = ? AND password = ?";
            

            // Exécution de la requête SQL pour vérifier si l'utilisateur existe.
            db.query(query, [username, password], (error, results) => {
                if (error) {
                    console.error("Erreur lors de la requête SQL :", error);
                    res.send("Erreur lors de l'authentification.");
                } else if (results.length > 0) {
                    // Utilisateur authentifié avec succès. Vous pouvez stocker des informations de session.
                    if (req.session) {
                        req.session.username = {
                            id: results[0].id,
                            username: username
                        };
                    } else {
                        console.error("Session is not available.");
                    }
                    res.redirect("/accueil2"); // Rediriger vers la page de chat.
                } else {
                    console.log("Utilisateur non trouvé ou mot de passe incorrect.");
                    res.send("Utilisateur non trouvé ou mot de passe incorrect.");
                }
            });
        } else {
            console.log("Authentification échouée.");
            res.send("Authentification échouée.");
        }
    } else {
        console.log("Username or password missing");
        res.send("Username or password missing");
    }
    
})

app.get('/chat', (req, res) => {
    // console.log('chat route'); // Este mensaje se imprimirá en la consola cuando alguien acceda a la ruta /
    if(req.session.user) {
        res.sendFile(__dirname + "/chat.html")
    } else {
        res.redirect('/')
    }
    
})

app.get('/channels', (req, res) => {
    // console.log('chat route'); // Este mensaje se imprimirá en la consola cuando alguien acceda a la ruta /
    // if(req.session.user) {
        
        res.sendFile(__dirname + "/channels.html")
    // } else {
    //     res.redirect('/')
    // }
    
})

// app.post('/channels', (req, res) => {
//     console.log('Route POST /channels atteinte');
//     const newChannelName = req.body.canal;
//     const query = "INSERT INTO channels (name) VALUES (?)"
//         db.query(query, newChannelName, (error, result) => {
//             if(error) {
//                 console.log(error);
                
//             } else {
//                 console.log("Canal crée");
//             }
//         })
    
// })



app.get('/channelChat.html', (req, res) => {
    // console.log('chat route'); // Este mensaje se imprimirá en la consola cuando alguien acceda a la ruta /
    // if(req.session.user) {
        
        res.sendFile(__dirname + "/channelChat.html")
    // } else {
    //     res.redirect('/')
    // }
    
})

app.get('/general', (req, res) => {
    // console.log('chat route'); // Este mensaje se imprimirá en la consola cuando alguien acceda a la ruta /
    // if(req.session.user) {
        
        res.sendFile(__dirname + "/general.html")
    // } else {
    //     res.redirect('/')
    // }
    
})

app.get('/home', (request, response) => {
    response.sendFile(__dirname + "/view/accueil.html")
})

app.get('/style.css', (request, response) => {
    response.sendFile(__dirname + "/view/style.css")
})

app.get('/registrer', (request, response) => {
    response.sendFile(__dirname + "/view/registrer.html")
})

app.get('/accueil2', (request, response) => {
    response.sendFile(__dirname + "/view/accueil2.html")
})

app.post("/view/registrer", (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const role_id = 1;
    if (username && password) {
        const query = "insert into users (username, password, role_id) VALUES(?,?,1)";
        db.query(query, [username, password], (error, result) => {
            if(error) {
                console.log(error);
                response.send("Nom d'utilisateur déjà pris !");
            } else {
                console.log("Compte crée avec succés !");
                const data = <RowDataPacket>result;
                response.redirect("/accueil2");
            }
        })
    } else {
        console.log("username or password missing");
        response.send("username or password is missing");
    }
});





io.on('connection', (defaultSocket: Socket) => {
    const socket = <SessionSocket> defaultSocket;
    const userSession = socket.request.session.user;
    if(userSession) {
        console.log(userSession?.username + " is connected");
        
        socket.on('chat message', (mssg) => {
            console.log('message' + mssg);
            io.emit('chat message', userSession.username + ": " + mssg);
        });
        socket.on('disconnect', () => {
            console.log("user disconnected");
        });
        socket.on('new channel', (newChannel) => {
            // socket.join(newChannel);
            io.emit('new channel', newChannel);
            const query = 'INSERT INTO channels (name) VALUES (?)';
            db.query(query, [newChannel], (error, result) => {
              if (error) {
                console.error('Erreur lors de l\'insertion du canal dans la base de données: ' + error.message);
              } else {
                console.log('Canal ajouté avec succès dans la base de données');
              }
            });

        });
        socket.on('chat message channel', (mssg) => {
            console.log('message ' + mssg);
            io.emit('chat message channel', userSession.username + ": " + mssg);
        });
    } 

});