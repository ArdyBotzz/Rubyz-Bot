const { Message } = require("./func.js")

module.export = {
  async handler(message, sock, store, setting) {
    try {
      if (!message.messages[0]) return;
      let timestamp = new Date()
      let msg = message.messages[0]
      if (!msg.message) return;
      let m = new Message(msg, sock, store)
      let type = Object.keys(msg.message)[0]
      let from = msg.key.remoteJid;
      let isGroup = from.endsWith("@g.us")
      let sender = isGroup ? msg.key.participant: from;
      let metadata = isGroup ? await sock.groupMetadata(from): ""
      let me = sock.user.id.split(":")[0]
      let isMeAdmin = isGroup ? metadata.participants.find(v => v.id == me).admin: ""
      let isAdmin = isGroup ? metadata.participants.find(u => u.id == sender)?.admin: ""
      isMeAdmin = isMeAdmin == "admin" || isMeAdmin == "superadmin"
      isAdmin = isAdmin == "admin" || isAdmin == "superadmin"
      let pushname = msg.pushName
      let body = msg.message?.conversation || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || msg.message?.extendedTextMessage?.text || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.templateButtonReplyMessage?.selectedId || "";
      let args = body.trim().split(/ +/).slice(1)
      let q = args.join(" ")
      let command = body.slice(0).trim().split(/ +/).shift().toLowerCase()
      let isOwner = !!setting.owner.find(o => o == sender)
      let prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(command) ? command.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
      let content = JSON.stringify(msg.message)
      let isCmd = command.startsWith(prefix)
      
                function reply(text) {
                    sock.sendMessage(from, {
                        text
                    }, {
                        quoted: msg
                    })
                }
      
      for (let name in global.plugins) {
        let plugin = global.plugins[name]
        if (!plugin) continue
        if (plugin.disabled) continue
        let isCommand = plugin.command instanceof RegExp ?
          plugin.command.test(command) :
          Array.isArray(plugin.command) ? 
            plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
                cmd.test(command) :
                cmd === command
              ) : typeof plugin.command == 'String' ? plugin.command === command : false
        if (!isCommand) continue
        let extra = {
          type,
          from,
          isGroup,
          sender,
          metadata,
          me,
          isMeAdmin,
          isAdmin,
          pushname,
          body,
          args,
          q,
          command,
          isOwner,
          prefix,
          content,
          isCmd,
          reply
        }
        try {
          await plugin.call(sock, m, extra)
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
}