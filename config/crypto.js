
module.exports = {
    encrypt:(text)=>{
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), IV);
        let encrypted = cipher.update(text);
       
        encrypted = Buffer.concat([encrypted, cipher.final()]);
       
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    },
    encrypt:(text)=>{
       let textParts = text.split(':');
       let iv = Buffer.from(textParts.shift(), 'hex');
       let encryptedText = Buffer.from(textParts.join(':'), 'hex');
       let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
       let decrypted = decipher.update(encryptedText);
      
       decrypted = Buffer.concat([decrypted, decipher.final()]);
      
       return decrypted.toString();
    }
}