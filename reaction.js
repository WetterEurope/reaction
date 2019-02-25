const ownerID = "393096318123245578";
let initialMessage = `**React to the message below to receive the associated role. If you would like to remove the role, simply remove your reaction!**`;
const roles = ["Giveawayping", "Overwatch", "Rocket League"];
const reactions = ["457479319539679233", "549333965983449095", "549335222030696512"];
const project_ping = require('./ping.js');
//login
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.login(process.env.TOKEN);
bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user.username}!`);
  bot.user.setStatus('dnd');
  bot.user.setActivity('mention me');
});
project_ping();

//If there isn't a reaction for every role, scold the user!
if (roles.length !== reactions.length) throw "Roles list and reactions list are not the same length!";

//Function to generate the role messages, based on your settings
function generateMessages(){
    var messages = [];
    messages.push(initialMessage);
    for (let role of roles) messages.push(`React below to get the **"${role}"** role!`); //DONT CHANGE THIS
    return messages;
}


bot.on("message", message => {
    if (message.content.toLowerCase() === `<@${bot.user.id}> createrolemsg`){
        if(message.author.id !== ownerID) return message.channel.send('DM <@393096318123245578> to start the setup.');
        var toSend = generateMessages();
        let mappedArray = [[toSend[0], false], ...toSend.slice(1).map( (message, idx) => [message, reactions[idx]])];
        for (let mapObj of mappedArray){
            message.channel.send(mapObj[0]).then( sent => {
                if (mapObj[1]){
                  sent.react(mapObj[1]);  
                } 
            });
        }
    }
    if(message.content === `<@${bot.user.id}>`){
      message.channel.send(`My Owner is <@393096318123245578>. Write a message to him, to start the setup.`);
    }
  
    if(message.content.toLowerCase() === `<@${bot.user.id}> ping` || message.content.toLowerCase().endsWith('ping')){
      message.channel.send(`Pong! **${Math.round(bot.ping)}** \`ms\``);
    }
    
    if(message.content.toLowerCase() === `<@${bot.user.id}> ping` || message.content.toLowerCase().startsWith(`<@${bot.user.id}> help`)) {
       return
    }
})


bot.on('raw', event => {
    if (event.t === 'MESSAGE_REACTION_ADD' || event.t == "MESSAGE_REACTION_REMOVE"){
        
        let channel = bot.channels.get(event.d.channel_id);
        let message = channel.fetchMessage(event.d.message_id).then(msg=> {
        let user = msg.guild.members.get(event.d.user_id);
        let member = bot.users.get(user.id).username;
        let server = bot.guilds.get(msg.guild.id).name;
        
        if (msg.author.id == bot.user.id && msg.content != initialMessage){
       
            var re = `\\*\\*"(.+)?(?="\\*\\*)`;
            var role = msg.content.match(re)[1];
        
            if (user.id != bot.user.id){
                let perm = msg.guild.me;
                var roleObj = msg.guild.roles.find(r => r.name === role);
                if(roleObj){
                var memberObj = msg.guild.members.get(user.id);
                
                if(!perm.hasPermission('MANAGE_ROLES')) {
                  errPerm(memberObj, channel, role, member);
                }
                
                if (event.t === "MESSAGE_REACTION_ADD"){
                  
                    memberObj.addRole(roleObj)
                
                  
                } else {
                    
                    memberObj.removeRole(roleObj)
                  
                } 
                }else{
                  errRole(memberObj, channel, role, server);
                }
            }
                
        }
        })
 
    }   
});

//FUNCTIONS

async function errPerm(memberObj, channel, role, member) {
try{
  await memberObj.send(`🚫 | **Missing permission!** Could not add/remove role **${role}**.\n`+
                       `Message the owner of the server & bot to fix the problem.`)
}catch(e){
        channel.send(`🚫 | Tried to DM ${member}.\n`+
                     `**Missing permission!** Could not add/remove role **${role}**.\n`+
                     `Message the owner of the server & bot to fix the problem.`)
}
}

async function errRole(memberObj, channel, role, server) {
try{
  await memberObj.send(`🚫 | **ERROR!** The role **${role}** in server **${server}** does not exist.\n`+
                       `Message the owner of the server & bot to fix the problem.`)
}catch(e){
        channel.send(`🚫 | **ERROR!** The role **${role}** in server **${server}** does not exist.\n`+
                     `Message the owner of the server & bot to fix the problem.`)
}
}