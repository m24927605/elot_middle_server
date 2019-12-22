
const auth = () => { };
const speakeasy = require('speakeasy');

auth.twofaGenerateSecret = () => speakeasy.generateSecret({ length: 30 });

auth.twofaGetOTPToken = (secret) => speakeasy.totp({
    secret,
    encoding: 'base64',
});

auth.twofaVerify = (secret, otp) => {
    const tokenValidates = speakeasy.totp.verify({
        secret,
        encoding: 'base64',
        token: otp,
        window: 6
    });
    if(tokenValidates){
        return true;
    } else {
        return false;
    }
};

module.exports = auth;
