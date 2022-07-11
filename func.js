function Message(msg, client, conn) {

    sock = client;

    store = conn;

    if (!msg.message) return;

    let type = Object.keys(msg.message)[0];

    this.key = msg.key;

    this.from = this.key.remoteJid;

    this.fromMe = this.key.fromMe;

    this.id = this.key.id;

    this.isGroup = this.from.endsWith("@g.us");

    this.me = sock.type == "md" ? sock.user.id.split(":")[0] + S_WHATSAPP_NET : sock.state.legacy.user.id;

    this.sender = this.fromMe ? this.me : this.isGroup ? msg.key.participant : this.from;

    if (type == "conversation" || type == "extendedTextMessage") this.text = msg.message?.conversation || msg.message?.extendedTextMessage;

    this.type = type;

    this.isOwner = !!owner.find(v => v == this.sender);

    this.isBaileys = this.id.startsWith("BAE5") && this.id.length == 16;

    this.fakeObj = msg;

    if (this.fakeObj.message[type]?.contextInfo?.quotedMessage) this.quoted = new QuotedMessage(this, sock, store);

    this.pushname = msg.pushName;

    this.messageTimestamp = msg.messageTimestamp;

}

Message.prototype.toJSON = function() {

    let str = JSON.stringify({...this});

    return JSON.parse(str);

};

Message.prototype.download = function() {

    return (async({ fakeObj, type }) => {

        if (type == "conversation" || type == "extendedTextMessage") return undefined;

        let stream = await downloadContentFromMessage(fakeObj.message[type], type.split("M")[0]);

        return await streamToBuff(stream);

    })(this);

};

function QuotedMessage(msg, sock, store) {

    let contextInfo = msg.fakeObj.message[msg.type].contextInfo;

    let type = Object.keys(contextInfo.quotedMessage)[0];

    this.key = { remoteJid: msg.from, fromMe: contextInfo.participant == msg.me, id: contextInfo.stanzaId, participant: contextInfo.participant };

    this.id = this.key.id;

    this.sender = this.key.participant;

    this.fromMe = this.key.fromMe;

    this.mentionedJid = contextInfo.mentionedJid;

    if (type == "conversation" || type == "extendedTextMessage") this.text = contextInfo.quotedMessage?.conversation || contextInfo.quotedMessage?.extendedTextMessage;

    this.type = type;

    this.isOwner = !!owner.find(v => v == this.sender);

    this.isBaileys = this.id.startsWith("BAE5") && this.id.length == 16;

    this.fakeObj = contextInfo.quotedMessage;

}

QuotedMessage.prototype.toJSON = function() {

    let str = JSON.stringify({...this});

    return JSON.parse(str);

};

QuotedMessage.prototype.download = function() {

    return (async({ fakeObj, type }) => {

        if (type == "conversation" || type == "extendedTextMessage") return undefined;

        let stream = await downloadContentFromMessage(fakeObj[type], type.split("M")[0]);

        return await streamToBuff(stream);

    })(this);

};

QuotedMessage.prototype.delete = function() {

  return sock.sendMessage(this.key.remoteJid, { 

    delete: {

      remoteJid: this.key.remoteJid,

      id: this.id

    }

  });

};

QuotedMessage.prototype.getQuotedObj = function() {

  return (async({ key, id }, sock, store) => {

      let res = await store.loadMessage(key.remoteJid, id);

      return new Message(res, sock, store);

  })(this, sock, store);

};
