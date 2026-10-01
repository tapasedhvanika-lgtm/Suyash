const { v4: uuidv4 } = require("uuid");

const generateCertificateNumber = () => {
    return "CERT-" + uuidv4().slice(0, 8).toUpperCase();
};

module.exports = {
    generateCertificateNumber
};