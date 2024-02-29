const net = require('net');

const host = '192.168.1.101';
const port = 6000;

function crc(cmd) {
    let PRESENT_Value = 0xFFFF;
    let POLYNOMIAL = 0x8408;
    const cmdBytes = Buffer.from(cmd.split(' ').map(byte => parseInt(byte, 16)));

    let viCrcValue = PRESENT_Value;

    for (let x = 0; x < cmdBytes.length; x++) {
        viCrcValue = viCrcValue ^ cmdBytes[x];

        for (let y = 0; y < 8; y++) {
            if (viCrcValue & 0x0001) {
                viCrcValue = (viCrcValue >> 1) ^ POLYNOMIAL;
            } else {
                viCrcValue = viCrcValue >> 1;
            }
        }
    }

    const crc_H = (viCrcValue >> 8) & 0xFF;
    const crc_L = viCrcValue & 0xFF;

    const crcBytes = Buffer.from([crc_L, crc_H]);
    return Buffer.concat([cmdBytes, crcBytes]).toString('hex').toUpperCase();
}

function sendCmd(cmd) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(port, host, () => {
            const message = crc(cmd);
            client.write(Buffer.from(message, 'hex'));
        });

        client.on('data', data => {
            const responseHex = data.toString('hex').toUpperCase();
            const hexList = responseHex.match(/.{2}/g);
            const hexSpace = hexList.join('').replace(/\s/g, ' '); // Menghapus spasi dari hasil
            client.end();
            resolve(hexSpace);
        });

        client.on('close', () => {
            console.log('Connection closed');
        });

        client.on('error', err => {
            console.error('Error:', err.message);
            reject(err);
        });
    });
}


module.exports = { sendCmd };
